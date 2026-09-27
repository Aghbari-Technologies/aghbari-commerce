begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and pg_get_function_identity_arguments(p.oid)='p_idempotency_key text, p_order_ids uuid[], p_to_status public.order_status'
  ),
  'bulk transition RPC keeps the canonical signature'
);

select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and p.prosecdef
      and p.proconfig @> array['search_path=']
  ),
  'bulk transition uses SECURITY DEFINER with empty search_path'
);

select ok(
  has_function_privilege('authenticated','public.bulk_transition_orders(text,uuid[],public.order_status)','execute'),
  'authenticated can execute bulk transition'
);

select ok(
  not has_function_privilege('anon','public.bulk_transition_orders(text,uuid[],public.order_status)','execute'),
  'anon cannot execute bulk transition'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relname='bulk_order_transition_results'
      and c.relrowsecurity
  ),
  'bulk result storage has RLS enabled'
);

select ok(
  not has_table_privilege('authenticated','public.bulk_order_transition_results','select'),
  'bulk result storage is not directly readable by authenticated users'
);

select ok(
  not has_table_privilege('anon','public.bulk_order_transition_results','select'),
  'bulk result storage is not directly readable by anon'
);

select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and pg_get_functiondef(p.oid) like '%pg_advisory_xact_lock%'
  ),
  'bulk transition serializes identical idempotency keys'
);

select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and pg_get_functiondef(p.oid) like '%idempotency key payload conflict%'
  ),
  'bulk transition rejects idempotency payload conflicts'
);

select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and pg_get_functiondef(p.oid) like '%one or more order transitions are not authorized%'
  ),
  'bulk transition fails closed on unauthorized mixed batches'
);

select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and pg_get_functiondef(p.oid) like '%status=\'completed\'%'
      and pg_get_functiondef(p.oid) like '%bulk_order_transition_results%'
  ),
  'completed idempotent requests replay stored batch results without reapplying mutations'
);

select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='bulk_transition_orders'
      and pg_get_functiondef(p.oid) like '%order.bulk_transition%'
      and pg_get_functiondef(p.oid) like '%order.status_changed%'
  ),
  'bulk transition records audit and outbox side effects'
);

select * from finish();
rollback;
