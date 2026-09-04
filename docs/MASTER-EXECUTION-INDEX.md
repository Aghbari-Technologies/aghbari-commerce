# Aghbari — Master Execution Index

**Canonical status ledger.** This file is updated after every meaningful execution boundary.

## Identity

- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Default branch: `main`
- Current baseline HEAD: `33295a2cfe157729b7578666835612559dbfe021`

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

**Status: IN PROGRESS**

Completed in this boundary:
- Repository existence and ownership/access verified.
- New repository confirmed empty before initialization.
- Product identity fixed as الأغبري.
- Operational-vs-analytics boundary documented.
- Evidence-first execution protocol established in-repo.
- Existing architecture is preserved as the starting knowledge base and will be evolved, not blindly recreated.

Pending:
- Incorporate the third legacy requirement batch when supplied.
- Full cross-batch requirements matrix.
- Conflict/duplication/risk classification.
- Final domain map and bounded contexts.
- Final technology selection based on requirements and current engineering trade-offs.
- Final database/data ownership model.
- Final API/integration contracts.
- Final admin/navigation model.
- Final security/RBAC/RLS model.
- Final offline/cache/sync model.
- Final testing and certification matrix.

## Non-negotiable boundaries

1. No fake PASS.
2. Every PASS must identify its exact evidence and exact HEAD.
3. `NOT PROVEN` remains `NOT PROVEN` until runtime evidence exists.
4. Do not duplicate Report-Advisor analytics/BI/forecasting/decision intelligence inside الأغبري.
5. Do not treat the old العامري implementation or technology choices as binding.
6. No production mutation as a substitute for proof.
7. External blockers are recorded explicitly and do not stop unaffected engineering work.
8. The architecture/protocol may be revised when evidence proves a better approach.

## Decision record format

Every material execution update records:

`ACTION → RESULT → EVIDENCE → BLOCKER (if any) → NEXT`

## Next execution boundary

Complete the architecture/requirements forensic pass as soon as the full input set is available, then freeze the first **Architecture Candidate** and begin implementation in small, independently verifiable vertical slices.
