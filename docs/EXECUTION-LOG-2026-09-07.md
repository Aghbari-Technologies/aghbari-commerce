# Aghbari Commerce — Execution Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch: parallel tenant boundaries + import correctness + migration reconciliation + cart/order runtime proof

### Completed implementation evidence
- Added cart/order tenant-boundary regression (`014`): 8 assertions.
- Added order transition tenant-boundary regression (`015`): 8 assertions; fixture contract corrected with required `pricing_tier`.
- Added import tenant-boundary regression (`016`): 10 assertions.
- Added import inventory-delta regression (`017`): 6 assertions.
- Added live import runtime-equivalent proof covering `0→4` delta `4` and `4→7` delta `3`; fixture data rolled back.
- Added live/runtime-equivalent cart/order tenant proof against temporary Tenant A/B fixtures; all security behaviors observed, with two initial assertion-expectation mismatches corrected in source test `014`.

### Cart/order runtime findings
- Tenant A successfully created its own order.
- Tenant A attempting to add Tenant B's product to its cart was rejected with `P0001 product unavailable`; the initial runtime harness incorrectly expected `42501`. This is a harness expectation correction, not an application bypass.
- Tenant A attempting to create against Tenant B's warehouse was rejected before cross-tenant access; the initial harness used an idempotency key shorter than the backend minimum and received `22023`. The source regression now uses a valid key so the intended warehouse-boundary assertion reaches the authorization guard.
- Tenant B successfully created its own order.
- Tenant B attempting to transition Tenant A's order was rejected with `P0002 order not found`.
- RLS hid Tenant A's order from Tenant B and Tenant B's order from Tenant A.
- Tenant A's cart did not expose Tenant B's product.

### Real defects found and fixed
1. `commit_product_import` previously captured post-upsert inventory as the old quantity. Corrected to lock/read the pre-commit balance before upsert.
2. Successive imports inside one PostgreSQL transaction could reuse stable `now()` for price versioning and hit the unique `(organization_id, price_list_id, product_id, valid_from)` constraint. Corrected with `clock_timestamp()`.
3. Repository migration files contained duplicate numeric prefixes caused by parallel baseline/hardening lines. Corrective migrations were renumbered above the existing `0040` baseline; duplicate corrective filenames were removed while preserving the baseline migrations.
4. A superseded order ambiguity migration was found to reference an undeclared `v_tier`; it was removed because the later canonical `0025_idempotency_race_authority_hardening.sql` already contains the required order-id/status fixes.
5. The cart/order runtime harness had two false-negative expectations (cart cross-tenant rejection code and an undersized idempotency key). The regression source was corrected instead of weakening the backend contract.

### Migration source state
- Repository migration numeric prefixes are now unique from `0001` through `0052` where present; no duplicate numeric-prefix blocker remains in the scanned migration tree.
- Current corrective files are `0041`–`0046`, with `0046` containing the combined import delta + timestamp correctness fix.
- Live Supabase already contains the corresponding import fixes under its own applied migration timestamps.

### Live RPC privilege verification
- Current live privilege matrix confirms anonymous execution is false for the application RPC surface, including the legacy 4-argument catalog function.
- Current authenticated surface is the intended application boundary; context helpers are authenticated-executable because RLS policies depend on them.
- Function-body audit confirms the cart/order/import RPCs use authenticated tenant context and the relevant customer/staff guards.

### CI / runner boundary
- A fresh `supabase-migration-proof` run for exact HEAD `501372b107043407f4c7a3cde04c5155f20b9190` completed as failure within seconds with no usable job steps/log payload. This remains **NOT PROVEN / runner-boundary blocked**; the failure cannot be attributed to source code without step evidence.
- The failed migration-proof run was explicitly re-run after the latest source correction; result still requires fresh job evidence before any PASS is claimed.
- `package-lock.json` remains absent/unproven; `npm ci` certification remains blocked until the lockfile is actually generated and a fresh quality run executes.

### Current branch
- Branch: `security/rpc-surface-final6`
- Latest branch HEAD: `501372b107043407f4c7a3cde04c5155f20b9190`
- PR: `#42`
- PR remains open and unmerged.

### Certification boundary
- Tenant/RPC/catalog/cart/order/import hardening: materially strengthened and transactionally exercised.
- Import correctness: fixed and live re-proven.
- Cart/order isolation: runtime-equivalent security behavior proven; source regression added.
- Migration numeric-prefix blocker: removed at source level.
- CI runner evidence, lockfile/npm-ci, authenticated browser E2E, and production runtime proof: **NOT CERTIFIED**.

**No production certification is claimed by this log.**
