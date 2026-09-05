# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact HEAD: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Latest independently verified G1 domain-proof boundary: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Latest PostgreSQL G1: **PROVEN** at `f7be8d752049e503e9e6aed650aacab3d9db65b4`; run `33890357708`, job `101080239898`
- Latest order-workflow proof: **PASS** at `f7be8d752049e503e9e6aed650aacab3d9db65b4`; run `33890357757`, job `101080240441`
- Latest intelligence-contract implementation/proof boundary: **`486ee2940193b36a1a57d152b9c9fa53654c9b6b`**; run `33890297796`, job `101080048316` **PASS**; this is prior to current HEAD and must not be treated as exact-head evidence until rerun.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | FOUNDATION / IMPLEMENTATION NOT YET PRESENT IN THIS REPOSITORY |
| INTEGRATED | NOT PROVEN |
| VERIFIED | G1 domain + PostgreSQL G1 + order workflow proven; intelligence contract proven at prior exact boundary |
| RUNTIME PROVEN | BLOCKED — no application/runtime implementation or connected Supabase project in this repository/session |
| PRODUCTION CERTIFIED | NOT PROVEN |

## Current phase
**PHASE 0 → PHASE 1 TRANSITION — executable proof foundation complete for current POC boundaries; implementation and real-runtime work remain open.**

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

## Executable evidence
- G1 deterministic domain proof: **PASS** — 5/5 tests at `f7be8d752049e503e9e6aed650aacab3d9db65b4`; run `33890357708`, job `101080239898`.
- G1 PostgreSQL real-engine proof: **PASS** — PostgreSQL 18.6 service, atomic order mutation, canonical price, server total, replay idempotency, payload conflict, and concurrent oversell protection. Same run/job as above.
- Order workflow state-machine proof: **PASS** — 4/4 tests at `f7be8d752049e503e9e6aed650aacab3d9db65b4`; run `33890357757`, job `101080240441`.
- Intelligence contract proof: **PASS** — 7/7 deterministic checks at `486ee2940193b36a1a57d152b9c9fa53654c9b6b`; run `33890297796`, job `101080048316`. This evidence is not current-head evidence because the proof workflow did not trigger on the later documentation-only commit.

## Important forensic discovery
The current `main` repository is still an architecture/requirements/proof-foundation repository: its tracked implementation surface is documentation, contracts, POCs, and CI proof workflows; there is no production React/Vite application, Supabase migration tree, operational API/service implementation, worker implementation, import/OCR pipeline, realtime/storage runtime, or production deployment implementation present in the repository at the current boundary. This is recorded as a repository-state fact, not as permission to invent runtime PASS.

## Pending gates — execution order
1. G2 direct-request authorization + RLS negative tests against a real Supabase/PostgreSQL environment.
2. G3 typed API contract proof.
3. G4 durable outbox/worker/delivery/retry + consumer idempotency proof.
4. G5 offline/sync implementation and executable evidence.
5. G6 import/export proof.
6. G7 performance budgets and p50/p95/p99 evidence.
7. G8 observability proof.
8. G9 deployment/recovery proof.
9. G10 deterministic full-suite proof.
10. Intelligence gateway runtime proof: tenant isolation, least privilege, version rejection, quality gate, non-destructive activation, provenance, replay safety, failure isolation.
11. Food-grade lot/expiry/FEFO implementation proof where business data supports it.
12. Exact physical schema/migrations after Batch-3 reconciliation and technology evidence.
13. Final API schemas/versioning.
14. Final RBAC/RLS freeze.
15. Architecture freeze.
16. Implementation vertical slices.
17. Authenticated product runtime.
18. Production runtime and certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Report-Advisor has no operational write path into Aghbari. Intelligence recommendations are never operational commands. Aghbari does not depend on Report-Advisor availability for orders, inventory, pricing, customers, purchasing, or other core operations.

## No-false-closure
Documentation PASS means design consistency only. A domain-harness PASS does not prove database, runtime, security, deployment, or production. A contract schema existing does not prove runtime enforcement. A successful publisher does not prove consumer-side exactly-once effects. A recommendation does not prove operational execution.

## Latest execution result
- PostgreSQL G1 is **PROVEN at the current exact HEAD** after the harness repair and real PostgreSQL execution.
- Order workflow is **PROVEN at the current exact HEAD** with 4/4 deterministic tests.
- Intelligence contract remains **PROVEN only at its prior exact implementation boundary**; current-head evidence is intentionally not overstated.
- No operational BI/AI duplication was introduced into Aghbari.

**NEXT:** advance to the highest-value real implementation/runtime boundary. G2 cannot be honestly marked PASS until a real Supabase/PostgreSQL target exists and direct-request/RLS negative tests execute against it. Until then, continue independent implementation/proof work without converting design into runtime evidence.