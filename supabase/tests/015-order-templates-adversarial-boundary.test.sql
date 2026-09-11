begin;

-- Adversarial contract: all checks below run as database roles, not through the UI.
-- The fixture is self-contained so a clean-source migration proof does not depend on
-- another test file leaving committed business rows behind.
select plan(13);

insert into auth.users (id, email)
values
  ('0e81be51-6102-43e7-993c-0d31fa822f5d', 'template-owner@test.local'),
  ('93de27e4-303d-4440-bab0-355ca75f89a3', 'template-tenant-b@test.local'),
  ('04837a6e-4b7c-433a-8c16-f2db75fd49bf', 'template-customer-b@test.local');

insert into public.organizations (id, name)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Template Tenant A'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Template Tenant B');

insert into public.customers (id, organization_id, name, tier)
values
  ('a0000000-0000-4000-8000-000000001001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Template Customer A', 'wholesale'),
  ('b0000000-0000-4000-8000-000000002002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Template Customer B', 'wholesale'),
  ('a0000000-0000-4000-8000-000000001002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Template Customer A2', 'wholesale');

insert into public.profiles (id, organization_id, customer_id, role)
values
  ('0e81be51-6102-43e7-993c-0d31fa822f5d', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a0000000-0000-4000-8000-000000001001', 'viewer'),
  ('93de27e4-303d-4440-bab0-355ca75f89a3', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'b0000000-0000-4000-8000-000000002002', 'viewer'),
  ('04837a6e-4b7c-433a-8c16-f2db75fd49bf', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a0000000-0000-4000-8000-000000001002', 'viewer');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub','0e81be51-6102-43e7-993c-0d31fa822f5d')::text, true);

select ok(
  (select relrowsecurity from pg_class where oid='public.order_templates'::regclass),
  'order_templates has RLS enabled'
);
select ok(
  not has_table_privilege('anon','public.order_templates','select'),
  'anon has no SELECT privilege on order_templates'
);
select ok(
  has_table_privilege('authenticated','public.order_templates','select,insert,update,delete'),
  'authenticated has table DML privileges required by the RLS boundary'
);

select lives_ok($$insert into public.order_templates(id,customer_id,name,lines)
  values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8','a0000000-0000-4000-8000-000000001001','P1','[{}]'::jsonb)$$,
  'authenticated owner can create a template');

select is(
  (select count(*)::int from public.order_templates where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8'),
  1,
  'owner can read own template'
);

select set_config('request.jwt.claims', json_build_object('sub','93de27e4-303d-4440-bab0-355ca75f89a3')::text, true);
select is(
  (select count(*)::int from public.order_templates where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8'),
  0,
  'different tenant cannot read template'
);
delete from public.order_templates where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8';
select is(
  (select count(*)::int from public.order_templates where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8'),
  0,
  'different tenant cannot delete template'
);

select set_config('request.jwt.claims', json_build_object('sub','04837a6e-4b7c-433a-8c16-f2db75fd49bf')::text, true);
select is(
  (select count(*)::int from public.order_templates where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8'),
  0,
  'different customer in same tenant cannot read template'
);

select set_config('request.jwt.claims', json_build_object('sub','0e81be51-6102-43e7-993c-0d31fa822f5d')::text, true);
select throws_ok(
  $$insert into public.order_templates(id,customer_id,name,lines)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee9','b0000000-0000-4000-8000-000000002002','FOREIGN','[{}]'::jsonb)$$,
  '42501',
  null,
  'owner cannot insert a foreign customer_id'
);

select throws_ok(
  $$insert into public.order_templates(id,customer_id,name,lines)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee10','a0000000-0000-4000-8000-000000001001','ZERO','[]'::jsonb)$$,
  '23514',
  null,
  'zero template lines are rejected'
);
select throws_ok(
  $$insert into public.order_templates(id,customer_id,name,lines)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11','a0000000-0000-4000-8000-000000001001','TOO-MANY',(select jsonb_agg(jsonb_build_object('i',g)) from generate_series(1,101) g))$$,
  '23514',
  null,
  '101 template lines are rejected'
);

select lives_ok(
  $$insert into public.order_templates(id,customer_id,name,lines)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee12','a0000000-0000-4000-8000-000000001001','ONE','[{}]'::jsonb)$$,
  'one template line is accepted'
);
select lives_ok(
  $$insert into public.order_templates(id,customer_id,name,lines)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee13','a0000000-0000-4000-8000-000000001001','HUNDRED',(select jsonb_agg(jsonb_build_object('i',g)) from generate_series(1,100) g))$$,
  'one hundred template lines are accepted'
);

select * from finish();
rollback;
