# Aghbari — Master Execution Index

**Canonical status ledger.** This file is updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Default branch: `main`
- Current exact HEAD: `e671cbfd1a27cb05e648ef91c733dcb858ce5594`

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
- **Engineering Requirements Baseline** covering P0 transactional/security/integration requirements and P1 resilience/UX requirements.
- **Data Ownership & Transactional Invariants** defining canonical domain owners and high-risk concurrency boundaries.

Pending:
- Batch 3 incorporation and reconciliation.
- Final technology ADRs.
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
**ACTION:** Continue Phase 0 autonomously under the upgraded full-system re-engineering mandate, without waiting for routine owner decisions.

**RESULT:** Added the engineering requirements baseline and canonical data ownership/invariants baseline. These convert legacy business intent into measurable engineering constraints and establish authoritative ownership plus concurrency/security boundaries before implementation.

**EVIDENCE:** `docs/ENGINEERING-REQUIREMENTS-BASELINE.md` and `docs/DATA-OWNERSHIP-AND-INVARIANTS.md` are present on `main`. Exact HEAD after this boundary: `e671cbfd1a27cb05e648ef91c733dcb858ce5594`.

**BLOCKER:** Batch 3 is still absent. Final architecture freeze remains intentionally withheld. No implementation or certification PASS is claimed.

**NEXT:** Continue autonomous Phase-0 work on API/service contracts, integration contracts, security/RBAC/RLS, offline/sync semantics, admin command-center IA, technology evaluation, and certification mapping. Batch 3 will be reconciled when available before architecture freeze.
