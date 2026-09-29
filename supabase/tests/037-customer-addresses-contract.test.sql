begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select ok(exists (
  select 1 from information_schema.columns
  where table_schema='public' and table_name='customer_addresses'
  having count(*) >= 14
),'customer_addresses exposes the canonical persisted address fields');

select ok(exists (
  select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='customer_addresses'
    and c.relrowsecurity and c.relforcerowsecurity
),'customer_addresses enforces RLS and FORCE RLS');

select ok(exists (
  select 1 from pg_indexes
  where schemaname='public' and tablename='customer_addresses'
    and indexname='customer_addresses_one_default_idx'
),'at most one default address is enforced per customer');

select ok(exists (
  select 1 from pg_trigger t
  join pg_class c on c.oid=t.tgrelid
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='customer_addresses'
    and t.tgname='customer_addresses_audit' and not t.tgisinternal
),'address mutations have an audit trigger');

select ok(exists (
  select 1 from information_schema.table_constraints
  where constraint_schema='public' and table_name='customer_addresses'
    and constraint_name='customer_addresses_customer_org_fk'
),'address rows are bound to the tenant/customer composite owner');

select ok(
  exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='customer_addresses'
      and policyname='customer_addresses_select_own'
      and qual like '%current_organization_id()%'
      and qual like '%current_customer_id()%'
  ),
  'address reads are restricted to the authenticated tenant/customer context'
);

select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='customer_addresses'
      and grantee='authenticated'
      and privilege_type in ('INSERT','UPDATE','DELETE')
  ),
  'authenticated clients cannot mutate the address table directly'
);

select ok(
  (select prosecdef and proconfig @> array['search_path=""']
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='audit_customer_address_change'
   limit 1),
  'address audit trigger runs as SECURITY DEFINER with empty search_path'
);

select ok(
  (select prosecdef and (proconfig @> array['search_path='] or proconfig @> array['search_path=""'])
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='save_customer_address'
   limit 1),
  'internal address save helper keeps SECURITY DEFINER with empty search_path'
);

select ok(has_function_privilege(
  'authenticated','public.create_customer_address(text,text,text,text,text,text,text,text,boolean)','execute'
) and not has_function_privilege(
  'anon','public.create_customer_address(text,text,text,text,text,text,text,text,boolean)','execute'
),'create_customer_address is authenticated-only');

select ok(has_function_privilege(
  'authenticated','public.update_customer_address(uuid,text,text,text,text,text,text,text,text,boolean)','execute'
) and not has_function_privilege(
  'anon','public.update_customer_address(uuid,text,text,text,text,text,text,text,text,boolean)','execute'
),'update_customer_address is authenticated-only');

select ok(has_function_privilege(
  'authenticated','public.delete_customer_address(uuid)','execute'
) and not has_function_privilege(
  'anon','public.delete_customer_address(uuid)','execute'
),'delete_customer_address is authenticated-only');

select ok(
  not has_function_privilege(
    'authenticated',
    'public.save_customer_address(uuid,uuid,text,text,text,text,text,text,text,text,boolean)',
    'execute'
  ),
  'internal save helper is not directly callable by authenticated clients'
);

select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='save_customer_address'
      and pg_get_functiondef(p.oid) like '%pg_advisory_xact_lock%'
      and pg_get_functiondef(p.oid) like '%is_default=false%'
  ),
  'default-address changes serialize and clear the prior default atomically'
);

select * from finish();
rollback;
