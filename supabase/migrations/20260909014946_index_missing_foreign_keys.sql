-- Performance hardening identified by Supabase advisors.
-- Cover foreign-key columns used by staff/import/reconciliation workflows.
-- Some deployments do not contain the optional legacy import/reconciliation tables;
-- guard each index creation so a clean database can replay the migration safely.

DO $$
BEGIN
  IF to_regclass('public.import_profiles') IS NOT NULL THEN
    EXECUTE 'create index if not exists import_profiles_created_by_idx on public.import_profiles(created_by)';
  END IF;
  IF to_regclass('public.import_synonyms') IS NOT NULL THEN
    EXECUTE 'create index if not exists import_synonyms_created_by_idx on public.import_synonyms(created_by)';
  END IF;
  IF to_regclass('public.intelligence_evidence') IS NOT NULL THEN
    EXECUTE 'create index if not exists intelligence_evidence_created_by_idx on public.intelligence_evidence(created_by)';
  END IF;
  IF to_regclass('public.inventory_reconciliations') IS NOT NULL THEN
    EXECUTE 'create index if not exists inventory_reconciliations_created_by_idx on public.inventory_reconciliations(created_by)';
    EXECUTE 'create index if not exists inventory_reconciliations_dataset_org_fk_idx on public.inventory_reconciliations(dataset_id, organization_id)';
    EXECUTE 'create index if not exists inventory_reconciliations_warehouse_org_fk_idx on public.inventory_reconciliations(warehouse_id, organization_id)';
  END IF;
END
$$;
