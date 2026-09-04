# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact HEAD: **`PENDING_COMMIT_SHA` until this index write returns its commit SHA; then that returned SHA becomes canonical.**

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
**PHASE 0 — Architecture & Requirements Forensics — IN PROGRESS — FULL RE-ENGINEERING + ADAPTIVE EXECUTION**

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

## This wave
- Added a deny-by-default RBAC/RLS matrix covering customer, sales, warehouse, accounting, moderation, administration, and scope boundaries.
- Added field-level exposure rules for tier pricing, security material, private customer data, and integration credentials.
- Added adversarial authorization cases that must fail through direct API requests, not only through UI restrictions.
- Added technology proof gates covering transactional correctness, authorization, typed contracts, background delivery, weak-network/PWA behavior, bulk import/export, performance, observability, deployment/recovery, and deterministic testing.
- Kept technology and architecture freeze explicitly evidence-gated; no runtime or implementation PASS is claimed.

## Pending gates
1. Batch 3 reconciliation when supplied.
2. Execute technology proof-of-concept gates.
3. Exact physical schema/migrations after Batch-3 reconciliation.
4. Final API schemas/versioning.
5. Final RBAC/RLS policy matrix (candidate now exists; final freeze pending schema/Batch 3).
6. Final offline/sync implementation contract.
7. Architecture freeze.
8. Implementation vertical slices.
9. Automated and runtime certification.

## No-false-closure
Documentation PASS means only that the documented design check passed. It does **not** mean implementation PASS, runtime PASS, or certification PASS.

## Latest boundary
**ACTION:** Autonomous `1` — harden authorization and make technology selection evidence-driven without inventing Batch 3.

**RESULT:** Added `RBAC-RLS-POLICY-MATRIX-V1.md` and `TECHNOLOGY-POC-GATES-V1.md`. Authorization is now mapped to explicit roles/scopes/actions with direct-request negative tests; technology choices are mapped to executable proof gates rather than preference.

**EVIDENCE:**
- `ef1facd75011fe047f450bc5fe62374d2f831c6a` — candidate RBAC/RLS policy matrix.
- `bf93ffbdbc5be7297ecd08e481b1845460712e69` — technology proof gates.
- This index update's returned commit SHA is the final exact HEAD for this boundary.

**BLOCKER:** Batch 3 remains absent. Architecture is intentionally not frozen/certified.

**NEXT:** Execute the highest-value technology/architecture gates that can be completed without Batch 3, then begin the first implementation vertical slice only when its contract is sufficiently frozen. Continue adversarial testing and evidence capture.
