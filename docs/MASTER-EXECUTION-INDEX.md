# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Latest implementation boundary: **`7cf9dad42abd2bc5bf6cf9f2cd092cfab668f207`**
- Latest independently verified G1 domain-proof boundary: **`fbdcffe949b1e10ef03b892b58f7268063250560`**
- Latest verified PostgreSQL G1 boundary: **NOT YET PROVEN**
- Ledger update commit: recorded by GitHub after this file mutation.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | FOUNDATION / IMPLEMENTATION IN PROGRESS |
| INTEGRATED | NOT STARTED |
| VERIFIED | G1 DOMAIN PROVEN; REMAINDER OPEN |
| RUNTIME PROVEN | NOT STARTED |
| PRODUCTION CERTIFIED | NOT STARTED |

## Current phase
**PHASE 0 → PHASE 1 TRANSITION — executable proof foundation active; architecture hardened with V2 quality requirements.**

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
- **Architecture Enhancements V2:** food-grade lot/expiry traceability, FEFO policy support, explicit order workflow state machine, consumer-side idempotency, deterministic cursor sync, scan-first warehouse UX, operational exception center, and release-gated infrastructure complexity.

## G1 executable evidence — current boundary
- Added an executable Node test harness for high-value transactional domain invariants.
- Proved at harness level that unauthorized/stale price input is rejected without mutation.
- Proved at harness level that insufficient inventory causes no partial order mutation.
- Proved at harness level that repeated `operation_id` returns the original result and cannot create a duplicate order.
- Proved at harness level that reusing an `operation_id` with a changed command cannot alter the committed result.
- Proved at harness level that order totals are server-calculated.
- GitHub Actions executed the hardened harness against exact HEAD `fbdcffe949b1e10ef03b892b58f7268063250560`.
- Workflow run `33885023775`, job `101062583186`: **SUCCESS**.
- All 5 G1 domain tests passed; 0 failed, 0 skipped.
- This is **domain-level executable evidence only**. It is not a PostgreSQL transaction/concurrency PASS and not runtime/production proof.

## New executable proof surface
- Added `poc/order-workflow/invariants.mjs` covering valid lifecycle progression, terminal-state protection, invalid jumps, and non-silent rejection.
- Added `.github/workflows/order-workflow-proof.yml` to execute the state-machine proof on main/PRs.
- The new workflow has been committed but its GitHub Actions execution is **not yet observed in this ledger**; therefore it is not marked PASS.

## Pending gates
1. Batch 3 reconciliation when supplied.
2. Verify the hardened PostgreSQL G1 proof to completion; do not infer PASS from an in-progress run.
3. Verify the new order workflow proof on GitHub Actions.
4. G2 direct-request authorization + RLS negative tests.
5. G3 typed API contract proof.
6. G4 durable outbox/worker/delivery/retry + consumer idempotency proof.
7. G5 offline/sync implementation, monotonic cursor, tombstone, and executable evidence.
8. G6 import/export proof.
9. G7 performance budgets and p50/p95/p99 evidence.
10. G8 observability proof.
11. G9 deployment/recovery proof.
12. G10 deterministic test suite proof.
13. Food-grade lot/expiry/FEFO implementation proof where business data supports it.
14. Exact physical schema/migrations after Batch-3 reconciliation and technology evidence.
15. Final API schemas/versioning.
16. Final RBAC/RLS freeze.
17. Architecture freeze.
18. Implementation vertical slices.
19. Automated/runtime certification.

## No-false-closure
Documentation PASS means only that the documented design check passed. Domain-harness PASS does not mean database, runtime, security, deployment, or production PASS. A successful outbox producer does not prove exactly-once consumer effects. Offline contracts do not prove offline runtime behavior.

## Latest boundary
**ACTION:** Autonomous `1` — incorporate only high-value architecture improvements, make them evidence-gated, implement the first executable workflow proof, and preserve exact-HEAD provenance.

**RESULT:** Architecture V2 hardening was adopted and recorded. The canonical data model now includes food-grade lot/expiry traceability, explicit order state-machine semantics, consumer-side idempotency, and monotonic-cursor synchronization. The offline contract now requires atomic cursor advancement and tombstone-safe recovery. An executable order workflow proof and CI gate were added.

**EVIDENCE:**
- `dce8e3f2f24c43e8926b9e2883c8204c8581a9d5` — Architecture Enhancements V2.
- `0f1fdfe7c9e031776900f6e2b125634fc5b98637` — canonical data model hardening.
- `49e1543be87fe12c96d4a4bb98bc87b0d66af3a0` — offline synchronization hardening.
- `8af3a707085aee39148e950b6519da9a8d6b0c24` — executable order workflow invariants.
- `7cf9dad42abd2bc5bf6cf9f2cd092cfab668f207` — order workflow CI gate.

**BLOCKERS / NON-PROVEN:** Batch 3 remains absent. PostgreSQL G1 completion must still be independently verified. Authorization/RLS, API, integrations, offline runtime, deployment, and production behavior remain unproven.

**NEXT:** Verify all newly added evidence surfaces at exact HEAD, then proceed to G2 authorization/RLS before broad implementation. Do not freeze physical schema or claim runtime readiness without executable evidence.
