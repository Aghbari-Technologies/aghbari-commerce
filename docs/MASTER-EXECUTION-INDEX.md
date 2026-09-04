# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Stable baseline (`main`): **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Active execution branch: `execution/maximum-parallel-2026-09-04`
- Active execution exact HEAD: **`33442f06ff2291ba79fd394d87571619ffb01282`**
- Main has not been mutated by the execution track.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Completion stages
| Stage | Current evidence-bound state |
|---|---|
| BUILT | Executable application, operational migrations/RPCs, import, offline queue, security headers, PWA assets, and proof gates are present on the execution branch |
| INTEGRATED | Not yet proven on `main`; active implementation is isolated on the execution branch pending evidence-gated merge |
| VERIFIED | Historical exact-head evidence exists for G1 domain 5/5, PostgreSQL G1, and order workflow 4/4; current-head verification is not yet executable because current Actions jobs terminate before runner steps |
| RUNTIME PROVEN | Not proven; real authenticated application/Supabase runtime evidence remains required |
| PRODUCTION CERTIFIED | Not proven |

## Current phase
**PHASE 1 — EXECUTABLE COMMERCE & RELEASE HARDENING.**

The repository now contains a concrete React/Vite/TypeScript application, Supabase migration/RPC implementation, operational services, import parser/staging/commit path, offline queue primitives, security boundaries, PWA assets, and executable CI/proof gates. Work is driven by real findings and evidence rather than by rebuilding foundations.

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
- Repaired exact-head checkout/binding in proof workflows so PR checks can target the actual PR head rather than the synthetic merge commit.
- Fixed strict TypeScript result typing in catalog/customer-order service paths.
- Fixed the offline cart identity path so offline cart writes use the locally persisted session identity instead of requiring a network-backed user lookup.
- Removed the duplicate module-level offline-cart online listener so the application has a single synchronization trigger.
- Aligned browser import money validation with the authoritative server two-decimal precision rule and added a regression test for three-decimal input.
- Added a database security contract gate covering RLS enablement, anonymous function execute grants, SECURITY DEFINER search_path hardening, and product-media storage policies.
- Hardened browser image CSP to trusted application/Supabase origins only.
- Added exact-head evidence-boundary documentation.

## Executable evidence
- Historical G1 deterministic domain proof: **PROVEN** — 5/5 at baseline `f7be8d752049e503e9e6aed650aacab3d9db65b4`.
- Historical PostgreSQL G1: **PROVEN** — real PostgreSQL service with atomic order mutation, canonical price, server total, replay idempotency, payload conflict, and concurrent oversell protection at the baseline exact head.
- Historical order workflow proof: **PROVEN** — 4/4 at baseline exact head.
- Previous exact execution boundaries reached successful security, order invariant, and domain checks.
- Current execution-boundary GitHub Actions runs terminate before runner steps/logs, so their failures are not usable as product-code evidence.

## Active CI boundary
- Exact HEAD: **`33442f06ff2291ba79fd394d87571619ffb01282`**.
- Unit tests previously verified: **63/63** before the latest import-validation and security-gate mutations.
- Lint previously repaired after four unused-binding failures.
- Build previously blocked by strict TypeScript result typing; the affected paths were repaired and require fresh executable CI evidence.
- Import precision fix is covered by a focused regression case.
- Database security contract gate scans the migration set before database execution.
- Current GitHub Actions execution is unavailable at the runner/job-step boundary; no code PASS is inferred from that condition.

## Real remaining gates
1. Fresh exact-head full quality proof: test + lint + build + order invariants + database security contract.
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
- GitHub Actions runner/billing availability when jobs terminate before steps;
- production deployment credentials/authorization where required;
- production-only backup/restore or release operations;
- a real Windows host if native Windows packaging/runtime proof is required.

No secrets should be sent through chat. When an external gate is reached, request the smallest environment action required and continue all independent repository work first.

## Latest execution result
**ACTIVE — NOT CERTIFIED.** The execution branch contains the latest hardening and proof-gate work at exact HEAD `33442f06ff2291ba79fd394d87571619ffb01282`. The branch remains isolated from `main` until fresh exact-head verification gates complete.

**NEXT:** when GitHub runner execution is available, consume the fresh exact-head results and repair the first real failure only. Until then, continue repository-only forensic review and contract hardening without fabricating runtime evidence.