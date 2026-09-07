# Aghbari Commerce — Execution Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch: security surface + runtime contract reconciliation

### Evidence-bound findings
- Supabase project `mrcyqezbhpncuvaehwgf` is active and contains migrations through `0023_restore_app_rpc_boundaries`.
- Runtime privilege audit: 19 public functions exist; exactly 14 are executable by `authenticated`, 0 are executable by `anon`. The exposed set is limited to the intended customer-facing RPCs plus frontend-invoked staff RPCs whose implementations enforce role/tenant authorization internally.
- All 23 public tables have RLS enabled, and all 23 public RLS policies are `authenticated`-only; no public-role RLS policies remain.
- The live database currently has 0 auth users and 0 organizations after fixture cleanup.
- All 14 authenticated-executable SECURITY DEFINER RPCs inspected have `SET search_path TO 'public'` and tenant/customer or role guards appropriate to their function. Staff mutation RPCs enforce `current_role()`; customer RPCs enforce customer context.
- The storefront catalog service calls `get_catalog` with `p_warehouse_id`; the database now exposes the warehouse-aware 5-argument signature and the legacy 4-argument signature is not executable.

### Executed fixes
- `0020_catalog_warehouse_boundary`: added the warehouse-aware 5-argument `get_catalog` boundary, validated the requested warehouse against the current organization, and returned warehouse-specific inventory.
- `0021_remove_legacy_catalog_rpc_surface`: removed authenticated/anon/PUBLIC execution from the legacy 4-argument catalog SECURITY DEFINER surface.
- `0022_require_warehouse_for_catalog`: removed the optional/default warehouse behavior so the warehouse parameter is mandatory and fail-closed.
- `0023_restore_app_rpc_boundaries`: restored authenticated execution for frontend-invoked cart/admin/import/order RPCs while keeping anonymous and PUBLIC execution revoked. This corrected a real functionality regression caused by over-restricting authenticated execution in the prior security pass.
- Verified the live privilege matrix after `0023`: anonymous execution is false for all 14 exposed RPCs; authenticated execution is true only for the intended 14.
- Verified catalog/customer-context failure behavior and the 8-assertion warehouse boundary pgTAP scenario in the live database transactionally with rollback.

### GitHub branch
- Branch: `security/rpc-surface-final6`
- Latest branch HEAD: `906884c9b8934df52a939222d6fe4380bc2b847f`
- PR: `#42`
- PR remains open and unmerged until release gates have fresh execution evidence.

### CI evidence rule
Runs associated with the exact candidate HEAD are completed with `failure`, but the available job payload exposes no step data. A representative fresh job (`quality`, job `101585851003`) still reports `steps=null`; therefore the failure is **not diagnostically proven as a code/test failure**. Failed workflow jobs were re-run for application-quality, G1 Domain Proof, bootstrap-release-lockfile, security-audit, Order Workflow Proof, and Supabase migration proof, but the run records remain without usable step/log evidence in the current connector view.

### Remaining gates
- Obtain usable GitHub Runner step/log evidence on the exact candidate HEAD.
- Synchronize and prove `package-lock.json` with `npm ci`.
- Fresh typecheck/lint/unit/migration/security/build evidence.
- Authenticated browser E2E and production artifact verification.
- Only after those gates pass: merge PR #42 and certify the exact resulting main HEAD.

No production certification is claimed by this log.
