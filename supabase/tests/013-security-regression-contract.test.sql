begin;

create extension if not exists pgtap with schema extensions;
select plan(4);

select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity),
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'),
  'Every public base table has RLS enabled'
);

select is(
  (select count(*) from information_schema.columns where table_schema = 'public' and column_name = 'organization_id' and is_nullable = 'NO'),
  (select count(*) from information_schema.columns where table_schema = 'public' and column_name = 'organization_id'),
  'Every organization_id column is NOT NULL'
);

select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')),
  0::bigint,
  'No public function is directly executable by anon'
);

select is(
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname in ('product_media_select', 'product_media_insert', 'product_media_update', 'product_media_delete')),
  4::bigint,
  'Product media storage has all four explicit CRUD boundary policies'
);

select * from finish();
rollback;
