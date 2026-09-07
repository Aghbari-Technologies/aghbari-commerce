# Aghbari Commerce — Execution Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch: parallel tenant boundaries + import correctness + migration reconciliation

### Evidence-bound findings
- Supabase project `mrcyqezbhpncuvaehwgf` is active.
- All 23 public tables have RLS enabled and the current policy set is authenticated-only.
- Anonymous execution remains blocked for the intended authenticated application RPC surface.
- Catalog warehouse isolation, RPC negative authorization, and Tenant A/B mutation isolation have already been proven transactionally and are not being rebuilt.

### New implementation work
- Added `supabase/tests/014-cart-tenant-boundary.test.sql`: 8 assertions covering customer-scoped carts, cross-tenant product rejection, Tenant A/B cart visibility, and non-mutation of the other tenant's cart.
- Added `supabase/tests/015-order-tenant-transition-boundary.test.sql`: 8 assertions covering viewer denial, cross-tenant order targeting denial, same-tenant admin transition, order history, audit, and outbox evidence.
- Added `supabase/tests/016-import-tenant-boundary.test.sql`: 10 assertions covering staff-only staging, tenant-scoped fingerprints, duplicate fingerprint rejection within a tenant, warehouse boundary, cross-tenant job rejection, and tenant-scoped rows.
- Added `supabase/tests/017-import-inventory-delta.test.sql`: 6 assertions locking the expected 0→4 and 4→7 inventory deltas across successive imports.

### Real defects found and fixed
1. **Import inventory delta defect:** `commit_product_import` previously assigned the post-upsert quantity to `v_old_qty`, making the movement delta zero/incorrect. Fixed by locking and reading the pre-existing balance before the upsert.
2. **Import price-version timestamp defect:** successive imports inside one PostgreSQL transaction could reuse `now()` exactly and violate the `(organization_id, price_list_id, product_id, valid_from)` uniqueness constraint. Fixed by using `clock_timestamp()` for the effective price-version timestamp.

### Live runtime proof
- First attempted import proof exposed the timestamp collision above; this was treated as a real failure and fixed, not hidden.
- Re-ran a transactionally isolated runtime-equivalent import proof after the fix. It completed without exception and verified the first import delta = 4, second import delta = 3, and final inventory = 7. All fixture data was rolled back.

### Migration reconciliation
- Full repository scan exposed duplicate numeric migration prefixes in source (`0012` through `0026`), which directly conflicts with the migration-proof workflow's fail-fast duplicate-version check.
- The newly added security/catalog/import corrective migrations were renumbered above the existing baseline (0041–0047) and the duplicate 0020–0026 corrective filenames were removed.
- Existing baseline migrations were preserved; no previously existing migration implementation was deleted.
- This removes the source-level duplicate-prefix blocker for migration proof while preserving the corrective migration sequence after the repository's existing 0040 baseline.

### CI evidence
- Failed jobs were re-run again. GitHub still exposes `steps=[]` and no usable job logs for the failed jobs, so no code-level failure is inferred from those records.
- The exact runner failure remains **NOT DIAGNOSTICALLY PROVEN**.
- `package-lock.json` remains unproven; do not claim `npm ci` readiness until the lockfile exists and a fresh quality run proves it.

### Current branch
- Branch: `security/rpc-surface-final6`
- Latest branch HEAD at end of this batch: `116284268f756ae51443c8236585c6aa69e86045`
- PR: `#42`
- PR remains open and unmerged.

### Certification boundary
- Security / tenant / catalog runtime-equivalent evidence: materially strengthened.
- Import correctness: newly fixed and transactionally re-proven.
- Migration source uniqueness: corrective renumbering completed.
- CI / lockfile / authenticated browser E2E / production runtime proof: still not certified.

**No production certification is claimed by this log.**
