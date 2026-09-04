# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact HEAD: **`e8a05c2af6d71f0a4ca3484b88c29bd3ecb137dd`**
- Latest independently verified G1 domain-proof boundary: **`fbdcffe949b1e10ef03b892b58f7268063250560`**
- Latest PostgreSQL G1: **NOT YET PROVEN at current HEAD; prior run exposed and fixed a harness quoting defect**
- Latest order-workflow proof: **PASS** at `0610d332d5008566af2273ad4468dbff721dc84c` / run `33887409980`
- Latest intelligence-contract implementation: **`65507ce84eef2d17643c76ace7572ba15acd960b`**
- Latest intelligence-contract CI execution: **NOT YET OBSERVED as a dedicated run**

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | FOUNDATION / IMPLEMENTATION IN PROGRESS |
| INTEGRATED | NOT STARTED |
| VERIFIED | G1 domain proof PASS; order workflow proof PASS; PostgreSQL G1 open |
| RUNTIME PROVEN | NOT STARTED |
| PRODUCTION CERTIFIED | NOT STARTED |

## Current phase
**PHASE 0 → PHASE 1 TRANSITION — executable proof foundation active; transactional and workflow invariants are being converted from design into real-engine evidence.**

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
- G1 hardened Node domain harness: **PASS** at `fbdcffe949b1e10ef03b892b58f7268063250560`; run `33885023775`, job `101062583186`.
- Order workflow state-machine proof: **PASS** at `0610d332d5008566af2273ad4468dbff721dc84c`; run `33887409980`, job `101070497477`.
- PostgreSQL G1 proof: the first real-engine run reached the database successfully, then failed on a shell SQL-quoting assertion after the successful transaction; this is a harness defect, not a proven product PASS. The assertion was corrected in `e8a05c2af6d71f0a4ca3484b88c29bd3ecb137dd` and must be re-executed.

## Intelligence Integration V1
- `docs/INTELLIGENCE-INTEGRATION-CONTRACT-V1.md` — one-way analytical integration contract.
- `docs/ARCHITECTURE-INTELLIGENCE-ADDENDUM-V1.md` — architecture boundary.
- `contracts/intelligence-analytics-dataset.v1.schema.json` — versioned dataset envelope.
- `poc/intelligence-gateway/contract-proof.mjs` — deterministic contract proof.
- `.github/workflows/intelligence-contract-proof.yml` — CI gate.
- The CI gate is not marked PASS until a dedicated GitHub Actions execution is observed.

## Pending gates — execution order
1. Re-run and verify PostgreSQL G1 at exact current HEAD after the harness fix.
2. Verify Intelligence Contract CI at exact current HEAD.
3. G2 direct-request authorization + RLS negative tests.
4. G3 typed API contract proof.
5. G4 durable outbox/worker/delivery/retry + consumer idempotency proof.
6. G5 offline/sync implementation and executable evidence.
7. G6 import/export proof.
8. G7 performance budgets and p50/p95/p99 evidence.
9. G8 observability proof.
10. G9 deployment/recovery proof.
11. G10 deterministic full-suite proof.
12. Intelligence gateway runtime proof: tenant isolation, least privilege, version rejection, quality gate, non-destructive activation, provenance, replay safety, failure isolation.
13. Food-grade lot/expiry/FEFO implementation proof where business data supports it.
14. Exact physical schema/migrations after Batch-3 reconciliation and technology evidence.
15. Final API schemas/versioning.
16. Final RBAC/RLS freeze.
17. Architecture freeze.
18. Implementation vertical slices.
19. Runtime and production certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Report-Advisor has no operational write path into Aghbari. Intelligence recommendations are never operational commands. Aghbari does not depend on Report-Advisor availability for orders, inventory, pricing, customers, purchasing, or other core operations.

## No-false-closure
Documentation PASS means design consistency only. A domain-harness PASS does not prove database, runtime, security, deployment, or production. A contract schema existing does not prove runtime enforcement. A successful publisher does not prove consumer-side exactly-once effects. A recommendation does not prove operational execution.

## Latest execution result
- The order workflow gate is now independently proven on `main`.
- The PostgreSQL G1 gate exposed a real harness defect through actual PostgreSQL execution; the defect was corrected rather than bypassed.
- The corrected PostgreSQL proof is now the next hard evidence boundary.
- Intelligence architecture remains one-way and independent; no BI/AI duplication was introduced into Aghbari.

**NEXT:** Execute the corrected PostgreSQL G1 proof, verify the Intelligence Contract CI gate, then advance to G2 authorization/RLS and real persistence evidence. Continue until blocked by a genuine external dependency; never convert an unobserved result into PASS.
