# Aghbari Commerce — Evidence Log — 2026-09-17

## Current candidate
- `946176e695c11d03d3f10ad9b93ec857b9ec1cce`
- Branch: `execution/final-closure-surgery-20260917`
- Base: `main` at `fb6700fb7829c57f9dde5e00f0d54d2ee8039778`
- Main was not modified.

## Execution policy
- Existing gates were executed before adding further test surface.
- Any source/test HEAD change invalidates earlier code-dependent evidence.
- Browser deployment proof remains separate from local browser proof.

## Defects exposed and fixed
### C72 / ED replay
1. RBAC test used stale RPC signatures and temporal price fixtures.
2. Clean-source migrations lacked the production-required chunked import RPC lifecycle:
   - `begin_product_import(text,text,integer)`
   - `stage_product_import_chunk(uuid,integer,jsonb)`
   - `finalize_product_import(uuid)`
3. Clean-source migrations lacked the production-required customer/role RPCs:
   - `update_customer(uuid,text,text,customer_tier)`
   - `set_organization_user_role(uuid,user_role)`
4. Clean-source security regression found 3 public functions directly executable by `anon` after later function recreation.
5. Import adversarial test evaluated foreign-tenant cases at invalid lifecycle/query-visibility stages; fixtures were corrected to preserve the real tenant boundary proof.

## Changes now in branch
- `supabase/migrations/20260917170000_restore_import_chunk_lifecycle.sql`
  Restores the chunked import lifecycle with tenant/role guards, empty `search_path`, authenticated-only execute.
- `supabase/migrations/20260917172000_restore_customer_rbac_boundaries.sql`
  Restores customer update + owner-only organization role management, empty `search_path`, authenticated-only execute, and revokes `anon` execution across the public function surface.
- `supabase/tests/025-rbac-behavioral-matrix.test.sql`
  Uses exact RPC casts, distinct price lists without conflicting seed price rows, and the observed foreign-tenant inventory denial code.
- `supabase/tests/026-import-full-lifecycle.test.sql`
  Moves foreign-warehouse denial to a valid finalized lifecycle state, captures the Tenant-A job id before switching to Tenant-B actor context, and asserts no unauthorized business-side effects.

## Exact observed CI evidence
### `ed523b558d611dfef7ed162648b01c1356d5b22d`
- Application Quality: run `35171051497` — PASS.
- Order Workflow: run `35171051485` — PASS.
- Migration proof: run `35171051517` — empty-database migration application PASS; pgTAP exposed the defects recorded above.
- Test-the-Test: run `35171051535` — baseline FAIL because source/test drift was exposed; mutation phase correctly stopped fail-closed.
- Fresh Local Browser E2E: run `35171051544` — exact checkout/clean install/local Supabase path started; later evidence invalidated by the next source/test HEAD.

## Current head execution
At `946176e695c11d03d3f10ad9b93ec857b9ec1cce`, GitHub Actions created a fresh exact-SHA matrix including migration proof, browser-local proof, quality, and the other existing closure workflows.

## External blockers kept separate
- Vercel exact matching deployment: blocked externally by current build-capacity/rate-limit status.
- Report-Advisor handoff: blocked externally until its configured URL/token contract is available.
- Supabase leaked-password protection: external plan/configuration gate; no forced upgrade or workaround.

## Certification state
Not certified until current exact SHA proves internal gates and then the required matching deployment → artifact → live runtime → browser → production smoke chain.
