begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

create temp table fixture as
select
  '27272727-2727-4272-8272-272727272727'::uuid org_id,
  '27272727-2727-4272-8272-272727272728'::uuid user_a,
  '27272727-2727-4272-8272-272727272729'::uuid user_b,
  '27272727-2727-4272-8272-272727272730'::uuid customer_a,
  '27272727-2727-4272-8272-272727272731'::uuid customer_b,
  '27272727-2727-4272-8272-272727272732'::uuid branch_id,
  '27272727-2727-4272-8272-272727272733'::uuid warehouse_id,
  '27272727-2727-4272-8272-272727272734'::uuid product_id,
  '27272727-2727-4272-8272-272727272735'::uuid price_list_id;

grant select on fixture to authenticated;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
select user_a,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','order-idem-a@fixture.invalid','x',now(),now() from fixture
union all
select user_b,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','order-idem-b@fixture.invalid','x',now(),now() from fixture;

insert into public.organizations(id,name,is_active)
select org_id,'Order Idempotency Adversarial Tenant',true from fixture;
insert into public.customers(id,organization_id,name,tier,is_active)
select customer_a,org_id,'Order Idempotency A','wholesale'::customer_tier,true from fixture
union all
select customer_b,org_id,'Order Idempotency B','wholesale'::customer_tier,true from fixture;
insert into public.profiles(id,organization_id,customer_id,role)
select user_a,org_id,customer_a,'viewer'::user_role from fixture
union all
select user_b,org_id,customer_b,'viewer'::user_role from fixture;
insert into public.branches(id,organization_id,name,is_active)
select branch_id,org_id,'Order Idempotency Branch',true from fixture;
insert into public.warehouses(id,organization_id,branch_id,name,is_active)
select warehouse_id,org_id,branch_id,'Order Idempotency Warehouse',true from fixture;
insert into public.products(id,organization_id,sku,name,unit,status)
select product_id,org_id,'ORDER-IDEM-001','Order Idempotency Product','unit','active' from fixture;
insert into public.price_lists(id,organization_id,tier,name,currency,is_active)
select price_list_id,org_id,'wholesale'::customer_tier,'Wholesale Fixture','YER',true from fixture;
insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select org_id,price_list_id,product_id,10,now() from fixture;
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
select org_id,warehouse_id,product_id,10 from fixture;

set local role authenticated;
set local request.jwt.claim.role='authenticated';
select set_config('request.jwt.claim.sub',(select user_a::text from fixture),true);

create temp table first_order as
select * from public.create_order(
  'order-idem-adversarial-001',
  (select warehouse_id from fixture),
  jsonb_build_array(jsonb_build_object('product_id',(select product_id from fixture),'quantity',2))
);

select is((select count(*) from first_order),1::bigint,'First order creates exactly one canonical result');
select is((select total from first_order),20::numeric,'First order total is server-authoritative');
select is((select quantity from public.inventory_balances where organization_id=(select org_id from fixture) and warehouse_id=(select warehouse_id from fixture) and product_id=(select product_id from fixture)),8,'First order decrements inventory exactly once');
select is((select count(*) from public.order_items oi where oi.organization_id=(select org_id from fixture) and oi.order_id=(select order_id from first_order)),1::bigint,'First order creates exactly one order item');
select is((select count(*) from public.order_status_history h where h.organization_id=(select org_id from fixture) and h.order_id=(select order_id from first_order)),1::bigint,'First order creates exactly one status history row');

create temp table replay_order as
select * from public.create_order(
  'order-idem-adversarial-001',
  (select warehouse_id from fixture),
  jsonb_build_array(jsonb_build_object('product_id',(select product_id from fixture),'quantity',2))
);

select is((select order_id from replay_order),(select order_id from first_order),'Exact replay returns the same canonical order');
select is((select count(*) from public.orders where organization_id=(select org_id from fixture) and idempotency_key='order-idem-adversarial-001'),1::bigint,'Exact replay creates no duplicate order');
select is((select count(*) from public.order_items oi where oi.organization_id=(select org_id from fixture) and oi.order_id=(select order_id from first_order)),1::bigint,'Exact replay creates no duplicate order item');
select is((select quantity from public.inventory_balances where organization_id=(select org_id from fixture) and warehouse_id=(select warehouse_id from fixture) and product_id=(select product_id from fixture)),8,'Exact replay creates zero additional inventory effect');
select is((select count(*) from public.outbox_events where organization_id=(select org_id from fixture) and event_type='order.created' and aggregate_id=(select order_id from first_order)),1::bigint,'Exact replay creates no duplicate outbox event');

select throws_ok(
  $$select * from public.create_order(
    'order-idem-adversarial-001',
    (select warehouse_id from fixture),
    jsonb_build_array(jsonb_build_object('product_id',(select product_id from fixture),'quantity',3))
  )$$,
  '40001',
  'idempotency key payload conflict',
  'Same key with different quantity is blocked'
);

select set_config('request.jwt.claim.sub',(select user_b::text from fixture),true);
select throws_ok(
  $$select * from public.create_order(
    'order-idem-adversarial-001',
    (select warehouse_id from fixture),
    jsonb_build_array(jsonb_build_object('product_id',(select product_id from fixture),'quantity',2))
  )$$,
  '40001',
  'idempotency key payload conflict',
  'Same key from another customer is blocked'
);

select * from finish();
rollback;
