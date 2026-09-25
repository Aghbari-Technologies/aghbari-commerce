begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

create temp table payment_fixture as
select
  gen_random_uuid() org_id,
  gen_random_uuid() user_id,
  gen_random_uuid() customer_id,
  gen_random_uuid() branch_id,
  gen_random_uuid() warehouse_id,
  gen_random_uuid() order_id,
  gen_random_uuid() invoice_id,
  gen_random_uuid() cash_account_id,
  (extract(epoch from clock_timestamp()) * 1000000)::bigint invoice_number;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
select user_id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
       'payment-runtime-'||replace(user_id::text,'-','')||'@fixture.invalid','x',now(),now()
from payment_fixture;

insert into public.organizations(id,name,is_active)
select org_id,'Payment Runtime Contract',true from payment_fixture;

insert into public.customers(id,organization_id,name,tier,is_active)
select customer_id,org_id,'Payment Runtime Customer','wholesale'::customer_tier,true
from payment_fixture;

insert into public.profiles(id,organization_id,customer_id,role)
select user_id,org_id,customer_id,'admin'::user_role
from payment_fixture;

insert into public.branches(id,organization_id,name,is_active)
select branch_id,org_id,'Payment Runtime Branch',true
from payment_fixture;

insert into public.warehouses(id,organization_id,branch_id,name,is_active)
select warehouse_id,org_id,branch_id,'Payment Runtime Warehouse',true
from payment_fixture;

insert into public.orders(
  id,organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by
)
select order_id,org_id,customer_id,warehouse_id,'completed'::order_status,'YER',100,100,
       'payment-runtime-order-key-'||replace(order_id::text,'-',''),user_id
from payment_fixture;

insert into public.operational_invoices(
  id,organization_id,order_id,customer_id,status,currency,subtotal,total,created_by
)
select invoice_id,org_id,order_id,customer_id,'issued'::invoice_status,'YER',100,100,user_id
from payment_fixture;

insert into public.cash_accounts(id,organization_id,branch_id,name,currency,opening_balance,is_active)
select cash_account_id,org_id,branch_id,'Payment Runtime Cash','YER',100,true
from payment_fixture;

grant select on payment_fixture to authenticated;

set local role authenticated;
set local request.jwt.claim.role='authenticated';
select set_config('request.jwt.claim.sub',(select user_id::text from payment_fixture),true);

create temp table first_payment as
select * from public.record_payment(
  (select invoice_id from payment_fixture),
  40,
  'cash'::public.payment_method,
  (select cash_account_id from payment_fixture),
  'RCPT-001',
  'payment-runtime-key-001'
);

select is((select count(*) from public.payments where organization_id=(select org_id from payment_fixture)),1::bigint,'first payment creates exactly one payment');
select is((select amount from public.payments where id=(select id from first_payment)),40::numeric,'first payment stores exact amount');
select is((select status from public.operational_invoices where id=(select invoice_id from payment_fixture)),'partially_paid'::public.invoice_status,'invoice becomes partially paid');
select is((
  select opening_balance+coalesce(sum(case when direction='in' then amount else -amount end),0)
  from public.cash_accounts a left join public.cash_transactions t
    on t.organization_id=a.organization_id and t.cash_account_id=a.id
  where a.id=(select cash_account_id from payment_fixture)
  group by opening_balance
),140::numeric,'cash balance increases exactly once');
select is((select count(*) from public.audit_events where organization_id=(select org_id from payment_fixture) and action='payment.create' and target_id=(select id from first_payment)),1::bigint,'payment audit event is emitted');
select is((select count(*) from public.outbox_events where organization_id=(select org_id from payment_fixture) and event_type='payment.received' and aggregate_id=(select invoice_id from payment_fixture)),1::bigint,'payment outbox event is emitted');
select ok((select idempotency_payload_hash is not null from public.payments where id=(select id from first_payment)),'payment stores idempotency payload hash');

create temp table replay_payment as
select * from public.record_payment(
  (select invoice_id from payment_fixture),
  40,
  'cash'::public.payment_method,
  (select cash_account_id from payment_fixture),
  'RCPT-001',
  'payment-runtime-key-001'
);

select is((select id from replay_payment),(select id from first_payment),'same idempotency key replays the original payment');
select is((select count(*) from public.payments where organization_id=(select org_id from payment_fixture)),1::bigint,'idempotent replay does not create a duplicate payment');
select is((
  select opening_balance+coalesce(sum(case when direction='in' then amount else -amount end),0)
  from public.cash_accounts a left join public.cash_transactions t
    on t.organization_id=a.organization_id and t.cash_account_id=a.id
  where a.id=(select cash_account_id from payment_fixture)
  group by opening_balance
),140::numeric,'idempotent replay does not duplicate cash movement');

select throws_ok(
  $$select public.record_payment(
    (select invoice_id from payment_fixture),
    41,
    'cash'::public.payment_method,
    (select cash_account_id from payment_fixture),
    'RCPT-001',
    'payment-runtime-key-001'
  )$$,
  '40001',
  'payment idempotency payload conflict',
  'same key with changed amount is rejected'
);

select throws_ok(
  $$select public.record_payment(
    (select invoice_id from payment_fixture),
    'NaN'::numeric,
    'cash'::public.payment_method,
    (select cash_account_id from payment_fixture),
    'RCPT-002',
    'payment-runtime-key-002'
  )$$,
  '22023',
  'invalid payment amount',
  'NaN payment amount is rejected before mutation'
);

select is((select count(*) from public.payments where organization_id=(select org_id from payment_fixture)),1::bigint,'rejected payloads leave payment count unchanged');

select * from finish();
rollback;