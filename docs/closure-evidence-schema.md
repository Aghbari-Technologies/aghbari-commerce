# Compact Closure Evidence Schema

Each closure record must use only:

`EXACT_SHA | FRONT | OWNER | TEST/RUN | RESULT | ROOT_CAUSE | FIX | DEPENDENTS`

Allowed lifecycle values:

`OPEN | IMPLEMENTED | TARGETED_VERIFIED | PROVEN | BLOCKED | CLOSED`

Rules:
- `PROVEN` requires evidence on the same exact SHA.
- `CLOSED` requires all affected regression gates to pass on that SHA.
- `BLOCKED` must name the external boundary; it must not stop unrelated work.
- Large raw logs stay in artifacts; this file stores summaries only.
