begin;

create extension if not exists pgtap with schema extensions;
select plan(10);

select ok(
  exists(
    select 1 from pg_trigger
    where tgrelid='public.orders'::regclass
      and tgname='orders_customer_notifications'
      and not tgisinternal
  ),
  'orders notification trigger exists'
);

select ok(
  (select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='notify_order_customer' and pg_get_function_identity_arguments(p.oid)=''),
  'notification trigger function is SECURITY DEFINER'
);

select is(
  (select proconfig @> array['search_path=""'] from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='notify_order_customer' and pg_get_function_identity_arguments(p.oid)=''),
  true,
  'notification trigger pins empty search_path'
);

create temp table notification_fixture as
select
  '29292929-2929-4292-8292-292929292928'::uuid org_id,
  '29292929-2929-4292-8292-292929292929'::uuid user_id,
  '29292929-2929-4292-8292-292929292930'::uuid customer_id,
  '29292929-2929-4292-8292-292929292931'::uuid branch_id,
  '29292929-2929-4292-8292-292929292932'::uuid warehouse_id,
  '29292929-2929-4292-8292-292929292933'::uuid product_id,
  '29292929-2929-4292-8292-292929292934'::uuid price_list_id;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
select user_id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated','notification-contract@fixture.invalid','x',now(),now()
from notification_fixture;

insert into public.organizations(id,name,is_active)
select org_id,'Notification Contract Tenant',true from notification_fixture;

insert into public.customers(id,organization_id,name,tier,is_active)
select customer_id,org_id,'Notification Customer','wholesale'::customer_tier,true from notification_fixture;

insert into public.profiles(id,organization_id,customer_id,role)
select user_id,org_id,customer_id,'viewer'::user_role from notification_fixture;

insert into public.branches(id,organization_id,name,is_active)
select branch_id,org_id,'Notification Branch',true from notification_fixture;

insert into public.warehouses(id,organization_id,branch_id,name,is_active)
select warehouse_id,org_id,branch_id,'Notification Warehouse',true from notification_fixture;

set local role postgres;

insert into public.orders(id,organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by)
select gen_random_uuid(),org_id,customer_id,warehouse_id,'pending','YER',25,25,'notification-contract-create-'||replace(gen_random_uuid()::text,'-',''),user_id
from notification_fixture
returning id;
-- The exact row is looked up by the idempotency prefix above.
select ok(
  exists(select 1 from public.notifications n where n.customer_id=(select customer_id from notification_fixture) and n.kind='order' and n.title='تم استلام طلبك'),
  'order insert creates customer notification'
);

select is(
  (select count(*) from public.notifications n where n.customer_id=(select customer_id from notification_fixture) and n.kind='order'),
  1::bigint,
  'order insert creates exactly one notification'
);

update public.orders o
set status='confirmed'
where o.organization_id=(select org_id from notification_fixture)
  and o.idempotency_key like 'notification-contract-create-%';

select is(
  (select count(*) from public.notifications n where n.customer_id=(select customer_id from notification_fixture) and n.title like 'تحديث حالة الطلب%'),
  1::bigint,
  'status transition creates exactly one notification'
);

update public.orders o
set total=30
where o.organization_id=(select org_id from notification_fixture)
  and o.idempotency_key like 'notification-contract-create-%';

select is(
  (select count(*) from public.notifications n where n.customer_id=(select customer_id from notification_fixture)),
  2::bigint,
  'non-status order update does not create duplicate notification'
);

select ok(
  not exists(select 1 from public.notifications where kind not in ('order','inventory','security','system','task')),
  'generated notification kind stays inside canonical vocabulary'
);

select * from finish();
rollback;
