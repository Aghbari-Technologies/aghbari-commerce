# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact integration HEAD: **`bf52f170846c6f7534217ff4534ea0f7b2be0d32`**
- Integrated PR: **#16 — MERGED**
- Source implementation boundary: PR #15 (`d9397480307a8f32808a7c2f1b3f7ea3e81e0a45`), reconciled with the three latest main operational additions.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | IMPLEMENTED — operational frontend, domain services, Supabase migrations/RPCs, PWA/offline, import/export, outbox worker, purchasing/receiving |
| INTEGRATED | **PASS — merged into `main` at `bf52f170846c6f7534217ff4534ea0f7b2be0d32`** |
| VERIFIED | **PENDING current-HEAD executable CI** |
| RUNTIME PROVEN | BLOCKED — real authenticated staging/browser runtime evidence not yet established |
| PRODUCTION CERTIFIED | NOT PROVEN |

## Current phase
**PHASE 1 — executable operational implementation + reliability hardening.** The repository has crossed the documentation-only boundary and now contains the executable operational application. Work proceeds through real runtime and evidence gates; prior POC evidence is regression evidence only until rerun on the frozen certification HEAD.

## Completed implementation surface
- React/Vite/TypeScript Arabic RTL operational application shell and command center.
- Authentication/session integration through Supabase Auth.
- Catalog/category reads with server-authoritative authorized pricing.
- Customer cart and order submission through server-side RPC commands.
- Staff order workflow and server-side status transition enforcement.
- Product/category management, price management, inventory adjustment.
- Product image processing/storage boundary.
- XLSX staged validation and atomic commit path.
- Offline cart/queue primitives with bounded retry behavior.
- Purchasing/receiving vertical: suppliers, purchase orders, submit/approve, atomic receiving and inventory movement evidence.
- Catalog/price CSV export.
- Durable outbox claim/ack/failure database boundary and deployable webhook worker.
- PWA manifest/service worker/offline fallback.
- Security headers/CSP and browser secret-boundary checks.
- Supabase migrations through purchasing/idempotency hardening (`0001`–`0027`, with intentional version gap where documented).
- pgTAP coverage for storage, outbox and purchasing/receiving; deterministic domain and order invariants.

## Current executable evidence
- Historical G1 domain/PostgreSQL/order-workflow evidence remains valid as **prior-boundary regression evidence**, not current-head certification evidence.
- Historical intelligence contract proof remains prior-boundary evidence.
- PR #15 current-head checks were not executable evidence because the observed jobs failed before workflow steps ran.
- PR #16 is now merged; the next mutation below will create the first fresh current-main evidence boundary.

## Baseline findings requiring execution
1. Current `main` has executable implementation, but exact-head CI evidence has not yet been observed after integration.
2. Real Supabase Auth/RLS negative tests require a connected staging target and two isolated tenants.
3. Browser E2E requires an authenticated executable browser runtime.
4. Outbox worker needs real endpoint delivery/retry/idempotency proof.
5. Offline replay/conflict/isolation needs runtime proof, not only unit tests.
6. Import/export needs runtime authorization, validation and rollback proof.
7. Performance/observability/deployment/recovery evidence remains open.
8. Food-grade lot/expiry/FEFO support is architectural scope and requires implementation evidence where applicable business data is present.
9. The source repository currently has no committed dependency lockfile; CI uses `npm install`, so dependency reproducibility remains a release-hardening item.

## Pending gates — execution order
1. Fresh current-HEAD application quality: test, lint, production build.
2. Fresh current-HEAD security audit and browser-secret boundary.
3. Fresh current-HEAD migration reset + pgTAP + migration inventory.
4. Repair any code/workflow failure found by these gates, then rerun on the resulting exact HEAD.
5. G2 direct-request authorization + RLS negative tests against real Supabase/PostgreSQL.
6. G3 typed API contract proof against actual runtime.
7. G4 durable outbox delivery/retry + consumer idempotency proof against a real endpoint.
8. G5 offline/sync replay, conflict and tenant-isolation runtime proof.
9. G6 import/export runtime proof, including failure/rollback paths.
10. G7 performance budgets and p50/p95/p99 evidence.
11. G8 observability and operational recovery proof.
12. G9 deployment/recovery/rollback proof.
13. G10 deterministic full-suite certification against one frozen exact HEAD.
14. Intelligence gateway runtime proof: tenant isolation, least privilege, version rejection, quality gate, provenance, replay safety and failure isolation.
15. Food-grade lot/expiry/FEFO implementation proof where business data supports it.
16. Final API schemas/versioning, RBAC/RLS freeze, architecture freeze, final regression and production certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Report-Advisor has no operational write path into Aghbari. Intelligence recommendations are never operational commands. Aghbari does not depend on Report-Advisor availability for orders, inventory, pricing, customers, purchasing, or other core operations.

## No-false-closure
Documentation PASS means design consistency only. A domain-harness PASS does not prove database, runtime, security, deployment, or production. A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green CI run on an earlier SHA is not exact-HEAD evidence.

## Latest execution result
- **Integration completed:** PR #16 merged to `main`.
- **Current implementation HEAD before this ledger mutation:** `bf52f170846c6f7534217ff4534ea0f7b2be0d32`.
- This ledger update intentionally establishes a new exact-head boundary so the complete CI stack can execute against the integrated source.
- No runtime or production certification is claimed.

**NEXT:** execute the fresh current-main CI gates, repair every genuine failure discovered, and repeat until the exact-head implementation is verified. Then establish real Supabase/Auth/RLS/browser/integration/deployment evidence and freeze one final certification HEAD.
