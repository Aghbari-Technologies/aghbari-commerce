begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email)
values ('0e81be51-6102-43e7-993c-0d31fa822f5d', 'template-apply-owner@test.local');

insert into public.organizations (id, name, is_active)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Template Apply Tenant A', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Template Apply Tenant B', true);

insert into public.customers (id, organization_id, name, tier, is_active)
values
  ('a0000000-0000-4000-8000-000000003001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Template Apply Customer A', 'wholesale', true),
  ('b0000000-0000-4000-8000-000000003002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Template Apply Customer B', 'wholesale', true);

insert into public.profiles (id, organization_id, customer_id, role)
values
  ('0e81be51-6102-43e7-993c-0d31fa822f5d', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a0000000-0000-4000-8000-000000003001', 'viewer');

insert into public.branches (id, organization_id, name, is_active)
values ('c0000000-0000-4000-8000-000000003011', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Apply Branch A', true);

insert into public.warehouses (id, organization_id, branch_id, name, is_active)
values ('c0000000-0000-4000-8000-000000003012', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000003011', 'Apply Warehouse A', true);

insert into public.products (id, organization_id, sku, name, unit, status)
values
  ('a0000000-0000-4000-8000-000000003021', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'TPL-A-001', 'Template Apply Product A', 'unit', 'active'),
  ('a0000000-0000-4000-8000-000000003022', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'TPL-A-002', 'Template Apply Product B', 'unit', 'active');

insert into public.price_lists (id, organization_id, tier, name, currency, is_active)
values ('c0000000-0000-4000-8000-000000003031', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'wholesale', 'Apply Wholesale', 'YER', true);

insert into public.product_prices (organization_id, price_list_id, product_id, amount, valid_from)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000003031', 'a0000000-0000-4000-8000-000000003021', 100, now()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000003031', 'a0000000-0000-4000-8000-000000003022', 200, now());

insert into public.inventory_balances (organization_id, warehouse_id, product_id, quantity)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000003012', 'a0000000-0000-4000-8000-000000003021', 20),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c0000000-0000-4000-8000-000000003012', 'a0000000-0000-4000-8000-000000003022', 20);

insert into public.order_templates (id, customer_id, name, branch_label, lines)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeee0021', 'a0000000-0000-4000-8000-000000003001', 'Apply Template', 'Apply Branch A',
   '[{"productId":"a0000000-0000-4000-8000-000000003021","sku":"TPL-A-001","name":"Template Apply Product A","unit":"unit","quantity":2},{"productId":"a0000000-0000-4000-8000-000000003022","sku":"TPL-A-002","name":"Template Apply Product B","unit":"unit","quantity":3}]'::jsonb);

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '0e81be51-6102-43e7-993c-0d31fa822f5d', true);

select ok(has_function_privilege('authenticated','public.apply_order_template(uuid)','execute'), 'authenticated can execute apply_order_template');
select ok(not has_function_privilege('anon','public.apply_order_template(uuid)','execute'), 'anon cannot execute apply_order_template');
select lives_ok($$select public.apply_order_template('eeeeeeee-eeee-4eee-8eee-eeeeeeee0021')$$, 'authorized customer can atomically apply a template');
select is((select count(*)::int from public.cart_items ci join public.carts c on c.id=ci.cart_id where c.organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and ci.product_id in ('a0000000-0000-4000-8000-000000003021','a0000000-0000-4000-8000-000000003022')), 2, 'template application writes both expected cart lines');
select is((select quantity::int from public.cart_items ci join public.carts c on c.id=ci.cart_id where c.organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and ci.product_id='a0000000-0000-4000-8000-000000003021'), 2, 'template application persists first quantity');
select is((select quantity::int from public.cart_items ci join public.carts c on c.id=ci.cart_id where c.organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and ci.product_id='a0000000-0000-4000-8000-000000003022'), 3, 'template application persists second quantity');
select is((select count(*)::int from public.audit_events where organization_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and action='cart.template.apply'), 1, 'template application creates an audit event');

select set_config('request.jwt.claim.sub', '0e81be51-6102-43e7-993c-0d31fa822f5d', true);
select throws_ok($$select public.apply_order_template('eeeeeeee-eeee-4eee-8eee-eeeeeeee9999')$$, '42501', null, 'unknown template is rejected');
select throws_ok($$select public.apply_order_template(null)$$, '22023', null, 'null template id is rejected');

select * from finish();
rollback;
