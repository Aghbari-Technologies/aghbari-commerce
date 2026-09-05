# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Integration branch: `execution/final-hardening-20260904`
- Current exact implementation HEAD: **the current `head_sha` of PR #15**
- Main/base HEAD: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Integration PR: **#15 — OPEN**

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | IMPLEMENTED — operational frontend, domain services, Supabase migrations/RPCs, PWA/offline, import/export, outbox foundation, R5 purchasing/receiving |
| INTEGRATED | PR #15 OPEN — implementation is not yet in `main` |
| VERIFIED | PRIOR POC gates proven; latest current-head CI checks failed before executing steps |
| RUNTIME PROVEN | BLOCKED — real staging Auth/RLS/browser environment not connected |
| PRODUCTION CERTIFIED | NOT PROVEN |

## Current phase
**PHASE 1 — executable operational implementation + reliability hardening.** The repository has crossed the former documentation-only boundary. Work now advances through real implementation verticals and evidence gates.

## Completed foundations
- Product identity and strict Report-Advisor/Aghbari ownership boundary.
- Owner-Level Protocol and autonomous `1` shorthand.
- Batch 1/2 forensic extraction and full re-engineering mandate.
- Engineering Requirements Baseline.
- Data Ownership & Transactional Invariants.
- API & Integration Contracts baseline.
- Security/RBAC/RLS baseline.
- Offline/Cache/Sync baseline.
- Operational Command Center IA.
- Canonical Operational Data Model V1.
- Certification Traceability Matrix V1.
- Technology Evaluation V1.
- Database & Migration Strategy V1.
- Consolidated Architecture Decision Log.
- Physical Schema Contract V1.
- Phase-0 Consistency Audit V1.
- Candidate Migration Skeleton V1.
- Domain/API Contract Map V1.
- Adversarial Architecture Review V1.
- Candidate RBAC/RLS Policy Matrix V1.
- Technology Proof Gates V1.
- Final Offline / Weak-Network Sync Contract V1.
- Architecture Enhancements V2: food-grade lot/expiry traceability, FEFO policy support, explicit order workflow state machine, consumer-side idempotency, deterministic cursor sync, scan-first warehouse UX, operational exception center, and release-gated infrastructure complexity.
- Intelligence Integration V1: one-way gateway boundary, canonical analytical dataset envelope, dataset lifecycle, server-bound tenant binding, provenance, idempotency, schema/contract versioning, data-quality gate, failure isolation, and least-privilege analytical credentials.
- Executable React/Vite operational shell and command center.
- Supabase migration/RPC implementation through the current order/cart/import/storage hardening boundary.
- R5 purchasing/receiving: suppliers, purchase orders, approval flow, atomic receiving, inventory movement, audit/outbox emission, and adversarial idempotency rejection.
- Typed purchasing client service and operational purchasing UI.
- Deployable generic outbox webhook worker with retry/ack/failure semantics.

## Executable evidence
- G1 deterministic domain proof: **PASS** at prior exact boundary `f7be8d752049e503e9e6aed650aacab3d9db65b4`.
- G1 PostgreSQL real-engine proof: **PASS** at prior exact boundary `f7be8d752049e503e9e6aed650aacab3d9db65b4`; this is regression evidence, not current-head evidence.
- Order workflow state-machine proof: **PASS** at prior exact boundary `f7be8d752049e503e9e6aed650aacab3d9db65b4`.
- Intelligence contract proof: **PASS** at prior exact boundary `486ee2940193b36a1a57d152b9c9fa53654c9b6b`.
- Latest observed current-head checks at PR #15 head `a71ac34eebf4b05629f149b6e2ab243448becac5`: `quality`, `security`, and `migration-proof` all completed with **failure before workflow steps executed**. No current-head PASS is asserted for later commits until the checks execute again.
- New R5 pgTAP suite: added to the migration test tree; execution remains pending a runner/local Supabase environment.

## Current implementation boundary
The implementation now includes the operational path:

`authenticated tenant → catalog → authorized price → cart → order → staff workflow → inventory → purchasing → receiving → audit/outbox`

The purchasing/receiving implementation is server-authoritative. UI role checks are convenience only; RPC role/tenant checks remain authoritative.

## Pending gates — execution order
1. Repair/re-run GitHub Actions so the current exact HEAD receives executable CI evidence.
2. G2 direct-request authorization + RLS negative tests against a real Supabase/PostgreSQL environment.
3. G3 typed API contract proof against the actual runtime.
4. G4 durable outbox delivery/retry + consumer idempotency proof against a real endpoint.
5. G5 offline/sync replay, conflict and tenant-isolation runtime proof.
6. G6 import/export runtime proof, including failure/rollback paths.
7. G7 performance budgets and p50/p95/p99 evidence.
8. G8 observability and operational recovery proof.
9. G9 deployment/recovery/rollback proof.
10. G10 deterministic full-suite certification against one frozen exact HEAD.
11. Intelligence gateway runtime proof: tenant isolation, least privilege, version rejection, quality gate, non-destructive activation, provenance, replay safety, failure isolation.
12. Food-grade lot/expiry/FEFO implementation proof where business data supports it.
13. Final API schemas/versioning, RBAC/RLS freeze, architecture freeze and production certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Report-Advisor has no operational write path into Aghbari. Intelligence recommendations are never operational commands. Aghbari does not depend on Report-Advisor availability for orders, inventory, pricing, customers, purchasing, or other core operations.

## No-false-closure
Documentation PASS means design consistency only. A domain-harness PASS does not prove database, runtime, security, deployment, or production. A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green CI run on an earlier SHA is not exact-HEAD evidence.

## Latest execution result
- PR #15 remains the controlled integration boundary into `main`.
- R5 purchasing/receiving has been materially implemented and connected to the command center.
- Outbox worker delivery runtime has been added as an executable Edge Function boundary.
- Current implementation changes are present on the PR branch; the exact frozen certification SHA is intentionally resolved only when the implementation work is stopped for certification.
- Current automated verification is **NOT PROVEN** until checks execute on that frozen SHA.
- No production certification has been issued.

**NEXT:** continue independent implementation while preserving evidence discipline: execute the R5 database suite, harden remaining runtime edges, then establish real Supabase/Auth/RLS/browser infrastructure and certify only one frozen exact HEAD after all gates pass.