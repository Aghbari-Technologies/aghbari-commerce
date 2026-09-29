begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select ok(exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='create_purchase_order'
    and pg_get_function_identity_arguments(p.oid)='p_supplier_id uuid, p_warehouse_id uuid, p_idempotency_key text, p_lines jsonb, p_currency text, p_notes text'
), 'create_purchase_order keeps the canonical signature');

select ok(exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='create_purchase_order'
    and replace(pg_get_functiondef(p.oid),' ','') like '%length(key)<16orlength(key)>128%'
), 'create_purchase_order accepts the canonical 128-character maximum');

select ok(not exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='create_purchase_order'
    and position('length(key)>200or' in replace(replace(pg_get_functiondef(p.oid),' ',''),E'\n','')) > 0
), 'create_purchase_order no longer contains the legacy 200-character maximum');

select ok(exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='receive_purchase_order'
    and pg_get_functiondef(p.oid) like '%length(key)%128%'
), 'receive_purchase_order accepts the canonical 128-character maximum');

select ok(not exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='receive_purchase_order'
    and pg_get_functiondef(p.oid) like '%length(key)>200%'
), 'receive_purchase_order no longer contains the legacy 200-character maximum');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='create_purchase_order'
    and pg_get_functiondef(p.oid) like '%pg_advisory_xact_lock%' and pg_get_functiondef(p.oid) like '%hashtextextended%'
), 'create_purchase_order serializes idempotency keys with a transaction advisory lock');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='receive_purchase_order'
    and pg_get_functiondef(p.oid) like '%pg_advisory_xact_lock%' and pg_get_functiondef(p.oid) like '%hashtextextended%'
), 'receive_purchase_order serializes idempotency keys with a transaction advisory lock');

select ok(exists (
  select 1 from pg_indexes
  where schemaname='public' and tablename='purchase_orders'
    and indexdef ilike '%organization_id%idempotency_key%'
), 'purchase_orders retains an organization-scoped idempotency index/constraint');

select ok(exists (
  select 1 from pg_indexes
  where schemaname='public' and tablename='purchase_receipts'
    and indexdef ilike '%organization_id%idempotency_key%'
), 'purchase_receipts retains an organization-scoped idempotency index/constraint');

select ok(has_function_privilege(
  'authenticated','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'
), 'create_purchase_order remains executable by authenticated users');

select ok(not has_function_privilege(
  'anon','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'
), 'create_purchase_order is not executable by anon');

select ok(has_function_privilege(
  'authenticated','public.receive_purchase_order(uuid,text,jsonb,text)','execute'
), 'receive_purchase_order remains executable by authenticated users');

select ok(not has_function_privilege(
  'anon','public.receive_purchase_order(uuid,text,jsonb,text)','execute'
), 'receive_purchase_order is not executable by anon');

select ok(
  (select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='create_purchase_order' limit 1)
  and
  (select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='receive_purchase_order' limit 1),
  'purchase and receipt commands retain their reviewed SECURITY DEFINER contract'
);

select * from finish();
rollback;
