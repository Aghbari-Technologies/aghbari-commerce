begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select is(has_function_privilege('anon','public.adjust_inventory(uuid,uuid,integer,text)','execute'),false,'adjust_inventory rejects anonymous execution');
select is(has_function_privilege('authenticated','public.adjust_inventory(uuid,uuid,integer,text)','execute'),true,'adjust_inventory remains available to authenticated users');
select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='adjust_inventory'
    and 'search_path=""' = any(coalesce(p.proconfig,'{}'))
    and pg_get_functiondef(p.oid) ilike '%current_organization_id()%'
    and pg_get_functiondef(p.oid) ilike '%current_role()%'
    and pg_get_functiondef(p.oid) ilike '%organization_id=v_org%'
),'adjust_inventory keeps search_path, role and tenant guards');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='record_payment'
    and 'search_path=""' = any(coalesce(p.proconfig,'{}'))
    and pg_get_functiondef(p.oid) ilike '%auth.uid() is null%'
    and pg_get_functiondef(p.oid) ilike '%v_role not in (%'
    and pg_get_functiondef(p.oid) ilike '%organization_id=v_org%'
    and pg_get_functiondef(p.oid) ilike '%idempotency_key required%'
),'record_payment keeps authentication, tenant and idempotency guards');
select is(has_function_privilege('anon','public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)','execute'),false,'record_payment rejects anonymous execution');
select is(has_function_privilege('authenticated','public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)','execute'),true,'record_payment remains available to authenticated users');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='set_organization_user_role'
    and 'search_path=""' = any(coalesce(p.proconfig,'{}'))
    and pg_get_functiondef(p.oid) ilike '%v_actor_role <> ''owner''%'
    and pg_get_functiondef(p.oid) ilike '%organization_id = v_org%'
    and pg_get_functiondef(p.oid) ilike '%cannot change your own role%'
),'set_organization_user_role is owner-only and organization-bound');
select is(has_function_privilege('anon','public.set_organization_user_role(uuid,public.user_role)','execute'),false,'set_organization_user_role rejects anonymous execution');
select is(has_function_privilege('authenticated','public.set_organization_user_role(uuid,public.user_role)','execute'),true,'set_organization_user_role remains available to authenticated users');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='register_product_media'
    and 'search_path=""' = any(coalesce(p.proconfig,'{}'))
    and pg_get_functiondef(p.oid) ilike '%v_role NOT IN (''owner'',''admin'',''sales'')%'
    and pg_get_functiondef(p.oid) ilike '%tenant binding failed%'
    and pg_get_functiondef(p.oid) ilike '%organization_id=v_org%'
),'register_product_media keeps role, tenant and storage-binding guards');
select is(has_function_privilege('anon','public.register_product_media(uuid,text,text,integer,integer,bigint)','execute'),false,'register_product_media rejects anonymous execution');
select is(has_function_privilege('authenticated','public.register_product_media(uuid,text,text,integer,integer,bigint)','execute'),true,'register_product_media remains available to authenticated users');

select * from finish();
rollback;
