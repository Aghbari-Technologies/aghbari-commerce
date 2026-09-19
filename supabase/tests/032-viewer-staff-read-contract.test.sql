begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select ok(
  has_function_privilege('authenticated','public.is_staff_reader()','EXECUTE'),
  'authenticated can execute viewer read-only helper'
);

select ok(
  not has_function_privilege('anon','public.is_staff_reader()','EXECUTE'),
  'anon cannot execute viewer read-only helper'
);

select ok(
  (select pg_get_functiondef(oid)
   from pg_proc
   where pronamespace='public'::regnamespace
     and proname='is_staff_reader'
     and prokind='f'
   limit 1) ilike '%viewer%',
  'read-only helper explicitly includes viewer'
);

select ok(
  (select pg_get_functiondef(oid)
   from pg_proc
   where pronamespace='public'::regnamespace
     and proname='is_staff'
     and prokind='f'
   limit 1) not ilike '%viewer%',
  'write-sensitive staff helper still excludes viewer'
);

select ok(
  (select qual from pg_policies
   where schemaname='public'
     and tablename='customers'
     and policyname='customers_read') ilike '%is_staff_reader()%',
  'customers read policy uses the viewer read-only helper'
);

select ok(
  (select qual from pg_policies
   where schemaname='public'
     and tablename='orders'
     and policyname='orders_customer_read') ilike '%is_staff_reader()%',
  'orders read policy uses the viewer read-only helper'
);

select ok(
  (select qual from pg_policies
   where schemaname='public'
     and tablename='inventory_balances'
     and policyname='inventory_read_staff') ilike '%is_staff_reader()%',
  'inventory read policy uses the viewer read-only helper'
);

select * from finish();
rollback;
