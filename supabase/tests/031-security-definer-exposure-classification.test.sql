-- Exact security boundary contract for public SECURITY DEFINER routines.
-- This is intentionally a classification invariant, not a blanket revoke:
-- application RPCs may be callable by authenticated users when their server-side
-- tenant/role checks require that boundary. The contract below prevents accidental
-- anonymous exposure and search_path drift, while preserving RLS helper execution.

begin;

select plan(12);

select is(
  (select count(*)::int
     from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prosecdef
      and coalesce((select value from unnest(p.proconfig) c(value) where c.value like 'search_path=%' limit 1),'') <> 'search_path=""'),
  0,
  'every public SECURITY DEFINER function pins an explicit empty search_path'
);

select is(
  (select count(*)::int
     from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prosecdef
      and has_function_privilege('anon',p.oid,'execute')),
  0,
  'anonymous role cannot execute public SECURITY DEFINER functions'
);

select ok(
  has_function_privilege('authenticated','public.current_organization_id()','execute'),
  'authenticated execution remains available for current_organization_id RLS helper'
);

select ok(
  has_function_privilege('authenticated','public.current_customer_id()','execute'),
  'authenticated execution remains available for current_customer_id RLS helper'
);

select ok(
  has_function_privilege('authenticated','public.is_staff()','execute'),
  'authenticated execution remains available for is_staff RLS helper'
);

select ok(
  has_function_privilege('authenticated','public.is_staff_reader()','execute'),
  'authenticated execution remains available for is_staff_reader RLS helper'
);

select ok(
  not has_function_privilege('anon','public.current_organization_id()','execute')
  and not has_function_privilege('anon','public.current_customer_id()','execute'),
  'anonymous role cannot execute tenant-context RLS helpers'
);

select ok(
  (select count(*)::int
     from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prosecdef
      and has_function_privilege('authenticated',p.oid,'execute')) >= 1,
  'authenticated SECURITY DEFINER application boundary remains classified as intentionally callable'
);


select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname in ('client_ui_settings','notifications') and c.relrowsecurity),
  2,
  'customer control and notification tables keep RLS enabled'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='client_ui_settings'
         and cmd='UPDATE' and roles @> array['authenticated']::name[] and qual ilike '%is_staff%'),
  'client_ui_settings UPDATE remains staff-gated at the database boundary'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='notifications'
         and cmd='SELECT' and roles @> array['authenticated']::name[] and qual ilike '%current_customer_id%'),
  'notifications SELECT remains customer/recipient scoped'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='notifications'
         and cmd='UPDATE' and roles @> array['authenticated']::name[] and qual ilike '%auth.uid()%'),
  'notifications UPDATE remains recipient/customer scoped'
);

select * from finish();
rollback;
