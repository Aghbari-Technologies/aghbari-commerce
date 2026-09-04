# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact HEAD: **`b3cf2a1dfb900acbf0ad2eecf0265dda3f7e9dee`**

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | NOT STARTED |
| INTEGRATED | NOT STARTED |
| VERIFIED | NOT STARTED |
| RUNTIME PROVEN | NOT STARTED |
| PRODUCTION CERTIFIED | NOT STARTED |

## Current phase
**PHASE 0 → PHASE 1 TRANSITION — executable proof foundation started; architecture remains evidence-gated.**

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

## This wave — executable G1 foundation
- Added an executable Node test harness for the highest-value transactional domain invariants.
- Proved at harness level that unauthorized/stale price input is rejected without mutation.
- Proved at harness level that insufficient inventory causes no partial order mutation.
- Proved at harness level that repeated `operation_id` returns the original result and cannot create a duplicate order.
- Proved at harness level that order totals are server-calculated.
- Added GitHub Actions execution for the G1 domain proof using Node.js 20.
- Explicitly classified this as **domain-level executable evidence only**, not a PostgreSQL transaction/concurrency PASS.
- Preserved the requirement that database, RLS, runtime, deployment, and production behavior require independent evidence.

## Pending gates
1. Batch 3 reconciliation when supplied.
2. Execute G1 against a real transactional persistence candidate, including concurrency/atomicity evidence.
3. G2 direct-request authorization + RLS negative tests.
4. G3 typed API contract proof.
5. G4 durable outbox/worker/delivery/retry proof.
6. G5 offline/sync implementation and executable evidence.
7. G6 import/export proof.
8. G7 performance budgets and p50/p95/p99 evidence.
9. G8 observability proof.
10. G9 deployment/recovery proof.
11. G10 deterministic test suite proof.
12. Exact physical schema/migrations after Batch-3 reconciliation and technology evidence.
13. Final API schemas/versioning.
14. Final RBAC/RLS freeze.
15. Architecture freeze.
16. Implementation vertical slices.
17. Automated/runtime certification.

## No-false-closure
Documentation PASS means only that the documented design check passed. Domain-harness PASS does not mean database, runtime, security, deployment, or production PASS.

## Latest boundary
**ACTION:** Autonomous `1` — move from architecture-only artifacts into executable proof without inventing Batch 3.

**RESULT:** Created the first G1 executable domain-invariant harness and wired it into GitHub Actions. The harness covers authoritative pricing, atomic-failure semantics at domain level, idempotent replay, and server-calculated totals.

**EVIDENCE:**
- `aa4316b1c8330607d29e91d6c32ac3442c2a53dd` — executable G1 invariant tests.
- `a385442398042d80dfa4da03b927b6ce2907cb91` — proof-boundary documentation.
- `b3cf2a1dfb900acbf0ad2eecf0265dda3f7e9dee` — GitHub Actions workflow and current implementation boundary.
- GitHub Actions workflow was created, but no workflow run is currently exposed by the connector for this commit; therefore **execution result is NOT PROVEN here**.

**BLOCKER:** Batch 3 remains absent. In addition, G1 is only partially evidenced until the same invariants are proven against real transactional persistence under concurrency.

**NEXT:** Complete database-backed G1 proof without freezing architecture prematurely; then advance to G2 authorization/RLS and G3 typed-contract proof. Continue exact-HEAD verification and update this index after each meaningful boundary.
