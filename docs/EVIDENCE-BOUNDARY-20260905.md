# Evidence Boundary — 2026-09-05

## Exact execution boundary

- Execution branch: `execution/maximum-parallel-2026-09-04`
- Exact HEAD: `4791669d7e8b2319a3bc9820c4e3b45f4c72bafd`
- Stable `main`: `f7be8d752049e503e9e6aed650aacab3d9db65b4`
- `main` remains untouched by the execution branch.

## Findings closed in this execution window

### F-ORDER-001 — checkout migration supersession
`0025_idempotency_race_authority_hardening.sql` now preserves the atomic active-cart conversion invariant while adding same-key transaction serialization and exact replay validation.

### F-OFFLINE-001 — duplicate synchronization trigger
The module-level `online` listener was removed from `src/services/cart.ts`; the application-level synchronization trigger is the single owner of online replay initiation.

### F-OFFLINE-002 — offline identity/network coupling
Offline cart writes use the locally persisted authenticated session identity before enqueueing. Replay remains user-scoped and server-authoritative.

### F-IMPORT-001 — client/server money precision drift
Browser import validation now rejects values that cannot be represented at two-decimal precision, matching the authoritative database staging rule. A regression test covers `1.001`.

### F-CI-001 — exact-head proof integrity
Proof workflows explicitly bind checkout to the pull-request head SHA where PR execution is used, rather than relying on GitHub's default synthetic merge checkout.

## Verification boundary

Historical executable evidence remains valid only for its original exact heads. Current implementation changes require fresh execution before they can be promoted to current-head PASS evidence.

Fresh GitHub Actions runs on the current execution boundary have repeatedly terminated before any job steps or logs were produced. This is an execution-environment condition, not evidence of a product-code failure. No certification claim is made from those failed runs.

## Runtime boundary

No connected Supabase project is available through the current tool connection. Therefore authenticated multi-tenant runtime, Tenant A/B adversarial access, real checkout, import commit, outbox delivery/retry, offline reconnect, and production deployment/recovery remain unproven.
