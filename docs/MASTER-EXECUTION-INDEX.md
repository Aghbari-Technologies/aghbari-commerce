# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Stable baseline (`main`): **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Active execution branch: `execution/maximum-parallel-2026-09-04`
- Active execution exact HEAD: **`b7895c7c5e03a189faa79cfec1b47ecbc961257e`**
- Main has not been mutated by the execution track.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Completion stages
| Stage | Current evidence-bound state |
|---|---|
| BUILT | Executable application, operational migrations/RPCs, import, offline queue, security headers, and proof gates are present on the execution branch |
| INTEGRATED | Not yet proven on `main`; active implementation is isolated on the execution branch pending evidence-gated merge |
| VERIFIED | Historical exact-head evidence exists for G1 domain 5/5, PostgreSQL G1, and order workflow 4/4; current-head CI is presently blocked before job execution |
| RUNTIME PROVEN | Not proven; real authenticated application/Supabase runtime evidence remains required |
| PRODUCTION CERTIFIED | Not proven |

## Current phase
**PHASE 1 — EXECUTABLE COMMERCE & RELEASE HARDENING.**

The repository now contains a concrete React/Vite/TypeScript application, Supabase migration/RPC implementation, operational services, import parser/staging/commit path, offline queue primitives, security boundaries, PWA assets, and executable CI/proof gates. Work is now driven by real findings and evidence rather than by rebuilding foundations.

## Completed implementation foundations
- Product identity and operational ownership boundary.
- Owner-Level / Evidence-First execution protocol.
- Engineering requirements and transactional invariants.
- Operational data model and physical migration set.
- API/integration contracts.
- RBAC/RLS foundation and cross-tenant relational guards.
- Catalog, pricing, customer, warehouse, inventory, cart, and order services.
- Atomic server-authoritative checkout.
- Order state machine.
- Import validation, fingerprinting, staging, and atomic commit.
- Private product-media storage boundary.
- Offline cart operation queue with user scoping, bounded retries, payload ceiling, and queue ceiling.
- Outbox claim/recovery primitives.
- PWA manifest/service worker/offline fallback.
- Browser security headers and secret-boundary audit.
- Deterministic domain and order proof harnesses.

## Current hardening completed on execution branch
- Fixed checkout migration supersession so `create_order` retains atomic active-cart conversion while adding same-key advisory serialization and exact replay binding.
- Added a focused order invariant regression gate.
- Repaired the order invariant PR harness to check out the actual PR head rather than GitHub's synthetic merge commit.
- Applied exact-head checkout/binding to application quality, security, G1 domain, order workflow, intelligence contract, and Supabase migration proof workflows.
- Fixed strict TypeScript result typing in catalog/customer-order service paths.
- Fixed the offline cart identity path so offline cart writes use the locally persisted session identity instead of requiring a network-backed user lookup.
- Removed the duplicate module-level offline-cart online listener so the application has a single authoritative synchronization trigger.
- Aligned browser import money validation with the server's authoritative two-decimal precision rule and added a regression case for a three-decimal amount.
- Updated README release-phase documentation to match the executable repository state.

## Executable evidence
- Historical G1 deterministic domain proof: **PROVEN** — 5/5 at baseline `f7be8d752049e503e9e6aed650aacab3d9db65b4`.
- Historical PostgreSQL G1: **PROVEN** — real PostgreSQL service with atomic order mutation, canonical price, server total, replay idempotency, payload conflict, and concurrent oversell protection at the baseline exact head.
- Historical order workflow proof: **PROVEN** — 4/4 at baseline exact head.
- A previous exact execution boundary reached successful security and order invariant checks.
- Fresh workflows for the current execution HEAD were created, but GitHub currently reports completed failures with no runner steps/logs, so they cannot be interpreted as code failures or PASS evidence.

## Active CI boundary
Latest implementation changes are committed at:
- Exact HEAD: **`b7895c7c5e03a189faa79cfec1b47ecbc961257e`**.
- Unit tests previously verified: **63/63**.
- Lint previously repaired after four unused-binding failures.
- Build previously blocked by strict TypeScript result typing; the affected catalog/customer-order paths were repaired and require a fresh executable CI result.
- Import browser/server precision mismatch has been repaired with a focused regression test.
- Current GitHub Actions runs are failing before runner steps execute; the repository evidence therefore does not support attributing those failures to product code.

## Real remaining gates
1. Fresh exact-head full quality proof: test + lint + build + order invariants.
2. Fresh exact-head migration reset + pgTAP proof.
3. Fresh exact-head G1 and order workflow proofs.
4. G2 direct-request authorization + RLS negative tests in real PostgreSQL/Supabase execution.
5. Authenticated browser runtime: login, session refresh/logout/re-login, tenant identity, catalog, cart, checkout, orders.
6. Tenant A/B adversarial runtime: A cannot read/mutate B and B cannot read/mutate A.
7. Semantic business E2E: create/update/delete, child operations, import, calculations, recovery, and authorization boundaries.
8. Outbox worker delivery/retry/DLQ runtime proof.
9. Offline/sync runtime proof under real connectivity transitions.
10. Import/export runtime proof including atomicity and dedupe/retry/recovery.
11. Performance budgets and measured p50/p95/p99 evidence.
12. Observability/runtime evidence.
13. Deployment, rollback, backup/recovery and production proof.
14. Final deterministic full-suite proof at one frozen exact HEAD.
15. Final security/RLS/RBAC freeze and release certification.

## No-false-closure
Code presence is not runtime proof. A test file is not a passing test. CI success is not runtime certification. Local PostgreSQL proof is not production proof. Staging success is not production certification. Every final claim must be tied to an exact immutable HEAD and its evidence.

## Owner / environment boundary
Only the following classes are currently outside repository-only execution:
- a real connected Supabase target for authenticated multi-tenant runtime proof;
- production deployment credentials/authorization where required;
- production-only backup/restore or release operations;
- a real Windows host if native Windows packaging/runtime proof is required.

No secrets should be sent through chat. When an external gate is reached, request the smallest environment action required and continue all independent repository work first.

## Latest execution result
**ACTIVE — NOT CERTIFIED.** The execution branch contains the latest hardening and proof-gate repairs at exact HEAD `b7895c7c5e03a189faa79cfec1b47ecbc961257e`. The branch remains isolated from `main` until the fresh exact-head verification gates complete.

**NEXT:** once GitHub runner execution is available, consume the fresh CI results at the exact HEAD, repair the first real failure only, then continue directly into the highest-value independent P0/runtime-proof gap. Until then, continue repository-only forensic review without fabricating runtime evidence.