# Aghbari — Master Execution Index

**Canonical status ledger.** This file is updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Default branch: `main`
- Current exact HEAD: `3d70cebf8efa58a4c078915bbde3fb0e4d5c26d5`

## Certification model
| Stage | Meaning | Current state |
|---|---|---|
| BUILT | Code/artifact exists | NOT STARTED — implementation has not begun |
| INTEGRATED | Correctly integrated into the canonical branch | NOT STARTED |
| VERIFIED | Automated/static/regression evidence passes | NOT STARTED |
| RUNTIME PROVEN | Real supported environments have been exercised | NOT STARTED |
| PRODUCTION CERTIFIED | Release boundary independently proven | NOT STARTED |

## Current phase
### PHASE 0 — Architecture & Requirements Forensics
**Status: IN PROGRESS — FULL RE-ENGINEERING MODE**

Completed:
- Repository/write baseline and product identity.
- Operational-vs-analytics boundary.
- Owner-Level / Evidence-First protocol.
- Architecture boundary and master index.
- Legacy Batch 1/2 extraction and classification.
- Provisional domain map, ADR log, and certification matrix.
- **Full system re-engineering mandate:** historical specifications are business evidence, not implementation blueprints.
- **Engineering transformation contract:** `Historical wording → Business capability → Engineering requirement → Acceptance criteria → Verification evidence`.
- Engineering quality gates for invariant, authorization, data ownership, contracts, failure modes, idempotency/concurrency, observability, testing, and runtime evidence.

Pending:
- Batch 3 incorporation and reconciliation.
- Final technology ADRs.
- Final database/data ownership model.
- Final API/integration contracts.
- Final admin/navigation model.
- Final security/RBAC/RLS model.
- Final offline/cache/sync model.
- Architecture Candidate freeze.

## Non-negotiable boundaries
1. No fake PASS.
2. Every PASS identifies exact evidence and exact HEAD.
3. `NOT PROVEN` remains `NOT PROVEN` until runtime evidence exists.
4. No duplicate Report-Advisor analytics/BI/forecasting/decision intelligence in الأغبري.
5. Old العامري implementation/technology is not binding.
6. Historical requirements must become measurable/testable engineering requirements before implementation.
7. Preserve business capability, not obsolete implementation mechanisms.
8. No production mutation as a substitute for proof.
9. External blockers are explicit and do not stop unaffected work.
10. Architecture/protocol may evolve when evidence proves a better approach.

## Decision record format
`ACTION → RESULT → EVIDENCE → BLOCKER (if any) → NEXT`

## Latest boundary
**ACTION:** Upgrade Phase 0 from legacy-specification interpretation to explicit full-system re-engineering and modernization mode.

**RESULT:** Updated the forensic synthesis, architecture decision log, and Batch 1/2 requirements matrix. Historical requirements are now explicitly treated as business evidence and converted into modern engineering requirements rather than copied into implementation.

**EVIDENCE:** `docs/PHASE-0-FORENSIC-SYNTHESIS.md`, `docs/ARCHITECTURE-DECISION-LOG.md`, and `docs/REQUIREMENTS-MATRIX-BATCH1-BATCH2.md` were updated. Exact HEAD after this boundary: `3d70cebf8efa58a4c078915bbde3fb0e4d5c26d5`.

**BLOCKER:** Batch 3 is still absent. Final architecture freeze remains intentionally withheld. No implementation or certification PASS is claimed.

**NEXT:** Continue Phase-0 synthesis: deepen data ownership/invariants, API/integration contracts, security/RBAC/RLS, offline/sync semantics, admin command-center IA, technology evaluation, and certification mapping. Reconcile Batch 3 against this baseline when it arrives, then freeze the architecture.
