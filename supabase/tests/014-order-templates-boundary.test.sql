begin;

create extension if not exists pgtap with schema extensions;
select plan(4);

select is(
  (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'order_templates'),
  true,
  'order_templates has RLS enabled'
);

select is(
  has_table_privilege('anon', 'public.order_templates', 'select,insert,update,delete'),
  false,
  'anon has no direct CRUD privilege on order_templates'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'order_templates' and policyname in ('order_templates_select_own','order_templates_insert_own','order_templates_update_own','order_templates_delete_own')),
  4::bigint,
  'order_templates has four explicit customer-owned RLS policies'
);

select is(
  (select count(*) from pg_constraint con join pg_class c on c.oid = con.conrelid join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'order_templates' and con.conname in ('order_templates_lines_is_array','order_templates_lines_count')),
  2::bigint,
  'order_templates has array and line-count payload constraints'
);

select * from finish();
rollback;
