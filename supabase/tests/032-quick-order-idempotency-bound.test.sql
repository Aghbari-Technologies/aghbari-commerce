begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public'
      and p.proname='apply_quick_order'
      and pg_get_function_identity_arguments(p.oid)='p_idempotency_key text, p_warehouse_id uuid, p_lines jsonb'
  ),
  'quick-order RPC exists with the canonical signature'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public'
      and p.proname='apply_quick_order'
      and pg_get_functiondef(p.oid) like '%length(v_key) < 16 or length(v_key) > 128%'
  ),
  'quick-order RPC enforces the canonical 128-character maximum'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public'
      and p.proname='apply_quick_order'
      and pg_get_functiondef(p.oid) like '%length(v_key) < 16 or length(v_key) > 200%'
  ),
  'quick-order RPC no longer contains the legacy 200-character maximum'
);

select ok(
  has_function_privilege('anon','public.apply_quick_order(text,uuid,jsonb)','execute') = false
  and has_function_privilege('authenticated','public.apply_quick_order(text,uuid,jsonb)','execute'),
  'quick-order RPC remains authenticated-only'
);

select * from finish();
rollback;
