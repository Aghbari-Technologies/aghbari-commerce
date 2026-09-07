# Aghbari — Implementation Status V1

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Status

- Architecture: RECONCILED
- Canonical ownership: ACCEPTED
- Physical relation families: IMPLEMENTED IN MIGRATION TREE
- Transactional domain invariants: prior evidence exists; fresh current-head CI execution evidence remains required
- Order workflow: prior evidence exists; fresh current-head CI execution evidence remains required
- Operational frontend/PWA: IMPLEMENTED and integrated
- Operational domain/services: IMPLEMENTED and integrated
- Supabase operational migrations/RLS/RPC layer: IMPLEMENTED; current live operational runtime reconciliation has been applied, while GitHub/CI parity must still be proven
- Catalog, cart, orders, import, image pipeline and offline queue: IMPLEMENTED
- Purchasing + receiving: IMPLEMENTED
- Customer lifecycle: IMPLEMENTED
- Inventory transfer + thresholds/low-stock: IMPLEMENTED
- Stock count/reconciliation: IMPLEMENTED
- Finance: IMPLEMENTED
- Catalog export: AVAILABLE
- Outbox: durable claim/recovery contract implemented; deployable worker present; production delivery proof remains open
- Offline cart/queue: hardened for user scoping, retry exhaustion and duplicate online-event replay
- Real Auth/RLS/E2E: staging/browser proof remains open
- Browser E2E: IMPLEMENTED as an executable Playwright gate; authenticated runtime execution remains pending target + credentials
- Production deployment: OPEN
- Production certification: NOT CERTIFIED

## Current authoritative implementation boundary

**Candidate branch:** `execution/live-runtime-reconciliation-20260907`

**Candidate HEAD:** `26c8cb082f15d80cb885d562e2003c3c121dad44`

This execution branch contains the operational runtime reconciliation migration and its privilege regression boundary. The previously authoritative `security/rpc-surface-final6` candidate remains open separately; it has not been silently advanced or certified by this batch.

## Verified current Supabase boundary

- Operational runtime reconciliation is present in the live Aghbari Supabase project.
- 11 newly reconciled operational tables have RLS enabled (11/11).
- Live operational RPC privilege audit after explicit anonymous/PUBLIC revocation: `anon_exposed=0`, `authenticated_exposed=13` for the reconciled operational surface.
- The operational SECURITY DEFINER functions inspected retain fixed `search_path = public` where applicable.
- The reconciled operational commands are intended for authenticated execution and remain subject to their own tenant/role guards.
- Existing temporary runtime fixtures remain governed by the cleanup policy; no certification is inferred from schema existence alone.

## Latest execution batch

- `77b3fe687f753f5b7c9b6db945019b75b2ceeaa9` — added `0047_operational_runtime_reconciliation.sql` to mirror the live operational RPC execution boundary and explicitly deny anonymous/PUBLIC execution.
- `26c8cb082f15d80cb885d562e2003c3c121dad44` — added `supabase/tests/021-operational-rpc-privilege-boundary.test.sql` covering anonymous/PUBLIC denial across the operational RPC surface and fixed-search-path contract evidence.

## Evidence state

- Live operational schema reconciliation: APPLIED.
- Live operational privilege boundary: `anon_exposed=0`, `authenticated_exposed=13`.
- Fresh CI: NOT PROVEN. No job-step evidence is available yet for this candidate.
- `package-lock.json`: NOT PROVEN present on the candidate; `npm ci` therefore remains a closure blocker.
- Fresh unit/domain execution: NOT PROVEN on current candidate until a runner exposes execution evidence.
- Fresh pgTAP/PostgreSQL CI execution: NOT PROVEN on current candidate.
- Authenticated Browser E2E: NOT PROVEN against a real target.
- Outbox external delivery: NOT PROVEN.
- Production deployment/certification: OPEN / NOT CERTIFIED.

## Remaining closure gates

1. Reconcile every live operational migration/function/table with GitHub source and remove source/runtime drift.
2. Obtain usable GitHub Runner step/log evidence on the exact candidate HEAD.
3. Generate and commit a valid synchronized `package-lock.json` and prove `npm ci`.
4. Run fresh typecheck, lint, unit/domain, migration/pgTAP, security, regression and build gates.
5. Provision/connect staging Supabase with real Tenant A/B identities.
6. Execute adversarial tenant isolation across operational data paths and RPCs.
7. Execute the authenticated Golden Path and verify persisted order after refresh.
8. Execute full order state-machine and inventory runtime scenarios.
9. Execute purchasing/receiving and finance runtime scenarios.
10. Execute real import/export, offline/replay and outbox delivery/recovery proofs.
11. Execute security adversarial, performance, backup/restore and rollback evidence.
12. Deploy to production and verify artifact SHA against the tested candidate.
13. Perform final regression, exact-head audit and certification.

## Evidence rule

Every PASS must identify the exact SHA, execution environment, command/test path and evidence artifact. A commit, workflow definition or source-code presence alone is never a runtime PASS.

## Protocol binding

Command `1` means immediate execution continuation. The execution loop is: LOAD STATE → RESCAN → PRIORITIZE → FIX → TEST → REGRESSION → ADVERSARIAL CHECK → VERIFY → EXACT-HEAD CHECK → DOCUMENT → NEXT. Work continues in parallel across independent fronts; external blockers do not stop independent executable work.
