-- Performance hardening identified by Supabase advisors.
-- Cover foreign-key columns used by staff/import/reconciliation workflows.

create index if not exists import_profiles_created_by_idx
  on public.import_profiles(created_by);

create index if not exists import_synonyms_created_by_idx
  on public.import_synonyms(created_by);

create index if not exists intelligence_evidence_created_by_idx
  on public.intelligence_evidence(created_by);

create index if not exists inventory_reconciliations_created_by_idx
  on public.inventory_reconciliations(created_by);

create index if not exists inventory_reconciliations_dataset_org_fk_idx
  on public.inventory_reconciliations(dataset_id, organization_id);

create index if not exists inventory_reconciliations_warehouse_org_fk_idx
  on public.inventory_reconciliations(warehouse_id, organization_id);
