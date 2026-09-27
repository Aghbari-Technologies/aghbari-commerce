begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='create_purchase_order'
      and pg_get_function_identity_arguments(p.oid)='p_supplier_id uuid, p_warehouse_id uuid, p_idempotency_key text, p_lines jsonb, p_currency text, p_notes text'
      and pg_get_functiondef(p.oid) like '%length(key)>128%'
      and pg_get_functiondef(p.oid) not like '%length(key)>200%'
  ),
  'create_purchase_order uses the canonical 128-character maximum'
);

select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='receive_purchase_order'
      and pg_get_function_identity_arguments(p.oid)='p_purchase_order_id uuid, p_idempotency_key text, p_lines jsonb, p_notes text'
      and pg_get_functiondef(p.oid) like '%length(key)>128%'
      and pg_get_functiondef(p.oid) not like '%length(key)>200%'
  ),
  'receive_purchase_order uses the canonical 128-character maximum'
);

select is(
  'search_path=' = any(
    coalesce((select p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='create_purchase_order'
        and pg_get_function_identity_arguments(p.oid)='p_supplier_id uuid, p_warehouse_id uuid, p_idempotency_key text, p_lines jsonb, p_currency text, p_notes text'),'{}')
  ),
  true,
  'create_purchase_order retains empty search_path hardening'
);

select is(
  'search_path=' = any(
    coalesce((select p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='receive_purchase_order'
        and pg_get_function_identity_arguments(p.oid)='p_purchase_order_id uuid, p_idempotency_key text, p_lines jsonb, p_notes text'),'{}')
  ),
  true,
  'receive_purchase_order retains empty search_path hardening'
);

select is(
  has_function_privilege('anon','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'),
  false,
  'create_purchase_order is not executable by anon'
);

select is(
  has_function_privilege('authenticated','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'),
  true,
  'create_purchase_order remains executable by authenticated'
);

select is(
  has_function_privilege('anon','public.receive_purchase_order(uuid,text,jsonb,text)','execute'),
  false,
  'receive_purchase_order is not executable by anon'
);

select is(
  has_function_privilege('authenticated','public.receive_purchase_order(uuid,text,jsonb,text)','execute'),
  true,
  'receive_purchase_order remains executable by authenticated'
);

select * from finish();
rollback;
