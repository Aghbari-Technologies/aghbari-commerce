begin;
select plan(9);

select ok(
  has_function_privilege('authenticated','public.update_customer_self_profile(text,text)','execute'),
  'authenticated can execute customer self-profile update'
);

select ok(
  not has_function_privilege('anon','public.update_customer_self_profile(text,text)','execute'),
  'anon cannot execute customer self-profile update'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='update_customer_self_profile' and p.prosecdef),
  1,
  'self-profile update is SECURITY DEFINER'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='update_customer_self_profile'
   and coalesce((select value from unnest(p.proconfig) c(value) where c.value like 'search_path=%' limit 1),'')='search_path=""'),
  1,
  'self-profile update pins empty search_path'
);

select ok(
  pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%public.is_staff()%'
  and pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%v_customer%'
  and pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%organization_id=v_org%',
  'self-profile update derives authenticated customer and tenant context'
);

select ok(
  pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%name=v_name%'
  and pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%phone=v_phone%',
  'self-profile update is limited to name and phone'
);

select ok(
  position('set tier=' in lower(pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure))) = 0
  and position('set is_active=' in lower(pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure))) = 0,
  'self-profile update cannot change pricing tier or account status'
);

select ok(
  pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%customer_profile.self_update%',
  'self-profile update emits canonical audit action'
);

select ok(
  pg_get_functiondef('public.update_customer_self_profile(text,text)'::regprocedure) ilike '%active customer not found%',
  'self-profile update requires an active customer row'
);

select * from finish();
rollback;
