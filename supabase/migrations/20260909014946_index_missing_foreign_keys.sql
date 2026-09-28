-- Performance hardening identified by Supabase advisors.
-- These optional analytics/import/reconciliation tables may not exist in the
-- minimal operational schema. Apply each index only when its table exists.

do $$
begin
  if to_regclass('public.import_profiles') is not null then
    execute 'create index if not exists import_profiles_created_by_idx on public.import_profiles(created_by)';
  end if;
  if to_regclass('public.import_synonyms') is not null then
    execute 'create index if not exists import_synonyms_created_by_idx on public.import_synonyms(created_by)';
  end if;
  if to_regclass('public.intelligence_evidence') is not null then
    execute 'create index if not exists intelligence_evidence_created_by_idx on public.intelligence_evidence(created_by)';
  end if;
  if to_regclass('public.inventory_reconciliations') is not null then
    execute 'create index if not exists inventory_reconciliations_created_by_idx on public.inventory_reconciliations(created_by)';
    execute 'create index if not exists inventory_reconciliations_dataset_org_fk_idx on public.inventory_reconciliations(dataset_id, organization_id)';
    execute 'create index if not exists inventory_reconciliations_warehouse_org_fk_idx on public.inventory_reconciliations(warehouse_id, organization_id)';
  end if;
end $$;
