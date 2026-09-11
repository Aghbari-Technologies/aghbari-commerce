begin;

select plan(8);

-- Self-contained fixture for clean-source migration verification.
insert into auth.users (id, email)
values
  ('0e81be51-6102-43e7-993c-0d31fa822f5d', 'quick-order-owner@test.local');

insert into public.organizations (id, name)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Quick Order Tenant A'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Quick Order Tenant B');

insert into public.branches (id, organization_id, name)
values
  ('c0000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Quick Branch A'),
  ('d0000000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Quick Branch B');

insert into public.warehouses (id, organization_id, branch_id, name)
values
  ('c0000000-0000-4000-8000-000000000011', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000000001', 'Quick Warehouse A'),
  ('d0000000-0000-4000-8000-000000000022', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'd0000000-0000-4000-8000-000000000002', 'Quick Warehouse B');

insert into public.customers (id, organization_id, name, tier)
values
  ('a0000000-0000-4000-8000-000000000111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Quick Customer A', 'wholesale');

insert into public.profiles (id, organization_id, customer_id, role)
values
  ('0e81be51-6102-43e7-993c-0d31fa822f5d', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a0000000-0000-4000-8000-000000000111', 'viewer');

insert into public.products (id, organization_id, sku, name, unit, status)
values
  ('a0000000-0000-4000-8000-000000010011', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'PGTAP-Q001', 'Quick Test Product', 'كرتون', 'active');

insert into public.price_lists (id, organization_id, tier, name, currency, is_active)
values
  ('c0000000-0000-4000-8000-000000000101', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'wholesale', 'Quick Wholesale', 'YER', true);
insert into public.product_prices (organization_id, price_list_id, product_id, amount)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000010011', 1000);

insert into public.inventory_balances (organization_id, warehouse_id, product_id, quantity)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000010011', 10);

select ok(
  not has_function_privilege('anon','public.apply_quick_order(text,uuid,jsonb)','execute'),
  'anon cannot execute apply_quick_order'
);
select ok(
  has_function_privilege('authenticated','public.apply_quick_order(text,uuid,jsonb)','execute'),
  'authenticated can execute apply_quick_order'
);

set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub','0e81be51-6102-43e7-993c-0d31fa822f5d')::text,true);

select lives_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-20260911-001','c0000000-0000-4000-8000-000000000011','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  'authorized customer can commit a quick-order cart merge'
);
select lives_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-20260911-001','c0000000-0000-4000-8000-000000000011','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  'identical quick-order retry is idempotent'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-20260911-001','c0000000-0000-4000-8000-000000000011','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":2}]'::jsonb)$$,
  '40001',
  null,
  'changed quick-order payload is rejected for the same idempotency key'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-DUP-20260911','c0000000-0000-4000-8000-000000000011','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1},{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  '22023',
  null,
  'duplicate product lines are rejected server-side'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-OOS-20260911','c0000000-0000-4000-8000-000000000011','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1000}]'::jsonb)$$,
  'P0001',
  null,
  'insufficient inventory is rejected server-side'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-FOREIGN-20260911','d0000000-0000-4000-8000-000000000022','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  '42501',
  null,
  'foreign warehouse is rejected server-side'
);

select * from finish();
rollback;
