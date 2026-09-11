-- Performance hardening identified by Supabase advisors.
-- Index only canonical tables present in the clean migration chain.
-- Legacy advisor findings for tables that are no longer part of the source schema
-- must not be encoded as migration dependencies, otherwise clean migration replay fails.

create index if not exists inventory_reconciliations_created_by_idx
  on public.inventory_reconciliations(created_by);

create index if not exists inventory_reconciliations_dataset_org_fk_idx
  on public.inventory_reconciliations(dataset_id, organization_id);

create index if not exists inventory_reconciliations_warehouse_org_fk_idx
  on public.inventory_reconciliations(warehouse_id, organization_id);
