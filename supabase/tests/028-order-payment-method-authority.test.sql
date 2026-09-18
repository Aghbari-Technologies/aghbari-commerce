begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

select is(
  (select data_type from information_schema.columns
   where table_schema='public' and table_name='orders' and column_name='payment_method'),
  'text',
  'orders.payment_method column exists'
);

select is(
  (select is_nullable from information_schema.columns
   where table_schema='public' and table_name='orders' and column_name='payment_method'),
  'NO',
  'orders.payment_method is NOT NULL'
);

select ok(
  exists(
    select 1 from pg_constraint
    where conrelid='public.orders'::regclass
      and conname='orders_payment_method_chk'
  ),
  'payment method check constraint exists'
);

select ok(
  exists(
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='create_order'
      and pg_get_function_identity_arguments(p.oid)='p_idempotency_key text, p_warehouse_id uuid, p_lines jsonb, p_payment_method text'
  ),
  'four-argument create_order exists'
);

select is(
  (select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='create_order'
     and pg_get_function_identity_arguments(p.oid)='p_idempotency_key text, p_warehouse_id uuid, p_lines jsonb, p_payment_method text'),
  true,
  'four-argument create_order is SECURITY DEFINER'
);

select is(
  (select proconfig @> array['search_path=""'] from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='create_order'
     and pg_get_function_identity_arguments(p.oid)='p_idempotency_key text, p_warehouse_id uuid, p_lines jsonb, p_payment_method text'),
  true,
  'four-argument create_order pins empty search_path'
);

select is(
  has_function_privilege('authenticated','public.create_order(text,uuid,jsonb,text)','EXECUTE'),
  true,
  'authenticated can execute four-argument create_order'
);

select is(
  has_function_privilege('anon','public.create_order(text,uuid,jsonb,text)','EXECUTE'),
  false,
  'anon cannot execute four-argument create_order'
);

select is(
  has_function_privilege('anon','public.create_order(text,uuid,jsonb)','EXECUTE'),
  false,
  'anon cannot execute legacy three-argument create_order'
);

select is(
  has_function_privilege('authenticated','public.create_order(text,uuid,jsonb)','EXECUTE'),
  true,
  'authenticated retains legacy three-argument compatibility'
);

create temp table payment_fixture as
select
  '28282828-2828-4282-8282-282828282828'::uuid org_id,
  '28282828-2828-4282-8282-282828282829'::uuid user_id,
  '28282828-2828-4282-8282-282828282830'::uuid customer_id,
  '28282828-2828-4282-8282-282828282831'::uuid branch_id,
  '28282828-2828-4282-8282-282828282832'::uuid warehouse_id,
  '28282828-2828-4282-8282-282828282833'::uuid product_id,
  '28282828-2828-4282-8282-282828282834'::uuid price_list_id;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
select user_id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','payment-contract@fixture.invalid','x',now(),now()
from payment_fixture;

insert into public.organizations(id,name,is_active)
select org_id,'Payment Contract Tenant',true from payment_fixture;

insert into public.customers(id,organization_id,name,tier,is_active)
select customer_id,org_id,'Payment Contract Customer','wholesale'::customer_tier,true from payment_fixture;

insert into public.profiles(id,organization_id,customer_id,role)
select user_id,org_id,customer_id,'viewer'::user_role from payment_fixture;

insert into public.branches(id,organization_id,name,is_active)
select branch_id,org_id,'Payment Branch',true from payment_fixture;

insert into public.warehouses(id,organization_id,branch_id,name,is_active)
select warehouse_id,org_id,branch_id,'Payment Warehouse',true from payment_fixture;

insert into public.products(id,organization_id,sku,name,unit,status)
select product_id,org_id,'PAY-001','Payment Contract Product','unit','active' from payment_fixture;

insert into public.price_lists(id,organization_id,tier,name,currency,is_active)
select price_list_id,org_id,'wholesale'::customer_tier,'Payment Wholesale','YER',true from payment_fixture;

insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select org_id,price_list_id,product_id,25,now() - interval '1 minute' from payment_fixture;

insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
select org_id,warehouse_id,product_id,10 from payment_fixture;

set local role authenticated;
set local request.jwt.claim.role='authenticated';
select set_config('request.jwt.claim.sub',(select user_id::text from payment_fixture),true);

create temp table cash_order as
select * from public.create_order(
  'payment-authority-key-001',
  (select warehouse_id from payment_fixture),
  jsonb_build_array(jsonb_build_object('product_id',(select product_id from payment_fixture),'quantity',2)),
  'cash'
);

set local role postgres;

select is(
  (select payment_method from public.orders where id=(select order_id from cash_order)),
  'cash',
  'created order persists selected payment method'
);

select is(
  (select count(*) from public.notifications where entity_id=(select order_id from cash_order) and kind='order' and title='تم استلام طلبك'),
  1::bigint,
  'create_order emits one receipt notification'
);

select is(
  (select count(*) from public.notifications where entity_id=(select order_id from cash_order) and kind='order' and title='تحديث حالة الطلب'),
  1::bigint,
  'initial pending history emits one status notification'
);

select is(
  (select count(*) from public.notifications where entity_id=(select order_id from cash_order) and kind='order'),
  2::bigint,
  'customer order creation emits receipt plus status notification only'
);

select is(
  (select quantity from public.inventory_balances where organization_id=(select org_id from payment_fixture) and warehouse_id=(select warehouse_id from payment_fixture) and product_id=(select product_id from payment_fixture)),
  8,
  'payment-authoritative order decrements inventory once'
);

set local role authenticated;

select throws_ok(
  $$select * from public.create_order(
    'payment-authority-key-001',
    (select warehouse_id from payment_fixture),
    jsonb_build_array(jsonb_build_object('product_id',(select product_id from payment_fixture),'quantity',2)),
    'credit'
  )$$,
  '40001',
  'idempotency key payload conflict',
  'same key with different payment method is blocked'
);

select throws_ok(
  $$select * from public.create_order(
    'payment-invalid-key-001',
    (select warehouse_id from payment_fixture),
    jsonb_build_array(jsonb_build_object('product_id',(select product_id from payment_fixture),'quantity',1)),
    'bitcoin'
  )$$,
  '22023',
  'invalid payment method',
  'unsupported payment method is rejected before mutation'
);

set local role postgres;

select is(
  (select quantity from public.inventory_balances where organization_id=(select org_id from payment_fixture) and warehouse_id=(select warehouse_id from payment_fixture) and product_id=(select product_id from payment_fixture)),
  8,
  'rejected payment payload leaves inventory unchanged'
);

select * from finish();
rollback;
