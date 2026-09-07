# Aghbari Commerce — Execution Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch: parallel tenant boundaries + import correctness + migration reconciliation

### Evidence-bound findings
- Supabase project `mrcyqezbhpncuvaehwgf` is active.
- All 23 public tables have RLS enabled; current table policies are authenticated-only.
- Anonymous execution remains blocked for the intended authenticated application RPC surface.
- Catalog warehouse isolation, RPC negative authorization, and Tenant A/B mutation isolation are already proven transactionally and are not being rebuilt.

### New tests committed
- `supabase/tests/014-cart-tenant-boundary.test.sql`: 8 assertions for customer-scoped carts, cross-tenant product rejection, Tenant A/B cart visibility, and non-mutation of the other tenant's cart.
- `supabase/tests/015-order-tenant-transition-boundary.test.sql`: 8 assertions for viewer denial, cross-tenant order targeting denial, same-tenant admin transition, order history, audit, and outbox evidence. Fixture corrected to satisfy the required `pricing_tier` column contract.
- `supabase/tests/016-import-tenant-boundary.test.sql`: 10 assertions for staff-only staging, tenant-scoped fingerprints, duplicate fingerprint rejection within a tenant, warehouse boundary, cross-tenant job rejection, and tenant-scoped rows.
- `supabase/tests/017-import-inventory-delta.test.sql`: 6 assertions for exact successive inventory deltas.

### Real defects found and fixed
1. **Import inventory delta:** previous implementation captured the post-upsert quantity as the old quantity. Corrected to lock/read the pre-commit balance before upsert.
2. **Import price timestamp collision:** successive imports in one PostgreSQL transaction could reuse stable `now()` and violate the unique price-version key. Corrected to use `clock_timestamp()` as the effective price-version timestamp.
3. **Migration-prefix collision:** repository scan found duplicate numeric migration prefixes across baseline and later hardening files. The corrective files were renumbered to `0041`–`0052` and the superseded duplicate corrective filenames were removed. Existing baseline migrations were preserved. Migration-proof's fail-fast duplicate-version gate is now satisfied at the source-tree level.

### Live proof
- An initial two-import runtime-equivalent proof exposed the price timestamp collision; it failed for that concrete reason and was fixed.
- The re-run completed without exception and verified import inventory transitions `0→4` with delta `4`, then `4→7` with delta `3`. Fixture data was rolled back.

### Current source migration boundary
- Existing repository baseline ends at `0040_import_definer_search_path_hardening.sql`.
- New corrective sequence is now `0041`–`0052`, with unique numeric prefixes.
- Live Supabase has the corresponding security/import fixes already applied under its own migration timestamps.

### CI evidence
- CI jobs were re-run, but GitHub still exposes `steps=[]` and no usable logs for the failed jobs. Therefore those failures remain **NOT DIAGNOSTICALLY PROVEN** as code failures.
- `package-lock.json` remains unproven and must be established before `npm ci` can be certified.

### Current branch
- Branch: `security/rpc-surface-final6`
- Latest branch HEAD: `ed36294cb50d28c80d2febf6340cf5e36d876396`
- PR: `#42`
- PR remains open and unmerged.

### Certification boundary
- Tenant/RPC/catalog/import security and runtime-equivalent proof: materially strengthened.
- Import correctness: fixed and re-proven.
- Migration duplicate-prefix source blocker: fixed.
- CI/lockfile/authenticated browser E2E/production runtime proof: still not certified.

**No production certification is claimed by this log.**
