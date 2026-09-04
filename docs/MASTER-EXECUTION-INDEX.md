# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Base: `main`
- Active execution branch: `execution/phase-1-operational-core`
- Exact execution HEAD: **`9708325989f1067669b9d35b043e950c40f1f93b`**
- PR: **#13** — executable operational core

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **IMPLEMENTATION STARTED** — typed domain core + executable PostgreSQL core schema + RLS + order RPC |
| INTEGRATED | **IN PROGRESS** — implementation is isolated in an execution branch and covered by CI |
| VERIFIED | **PARTIAL** — prior G1 domain/order proofs exist; new Phase-1 proof is awaiting successful CI observation |
| RUNTIME PROVEN | **NOT PROVEN** — no connected Supabase project is available to this session |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Phase-1 implementation completed in this boundary
- Strict TypeScript configuration with no-unused and exact optional-property checks.
- Canonical domain error taxonomy.
- Typed operational entities for orders, pricing, and inventory.
- Server-authoritative price resolver; no client price input is accepted by the domain API.
- Inventory reservation operation with positive-quantity validation, availability protection, and version increment.
- Explicit order state machine; arbitrary status jumps are rejected.
- Idempotent `createOrder` application boundary.
- Executable PostgreSQL core schema covering organization/scope, identity, customers, suppliers, catalog, pricing, inventory, carts, orders, outbox, and audit.
- Deny-by-default RLS baseline.
- Customer direct-read paths narrowed to own customer/orders; broad inventory/outbox/audit reads are intentionally denied until explicit permission policies exist.
- PostgreSQL `create_order` RPC implementing authentication, customer/branch/warehouse scope validation, server price resolution, transactional stock reservation, order persistence, order history, outbox emission, audit emission, and idempotency fingerprint conflict detection.
- Price-period overlap guard using a PostgreSQL exclusion constraint.
- Executable CI gate for TypeScript tests and PostgreSQL migration/domain proof.
- Executable SQL fixture/proof for idempotent replay, price authority, stock reservation, cross-customer order isolation, payload conflict, oversell rejection, and rollback preservation.

## Evidence policy
No PASS is claimed for the new Phase-1 boundary until its exact HEAD has a successful GitHub Actions execution. Prior proof artifacts remain historical evidence and are not silently promoted to current-head proof.

## Next execution queue
1. Observe and repair the Phase-1 CI failures until the exact HEAD passes.
2. Add the remaining staff/admin authorization permission model and negative RLS tests.
3. Implement catalog/customer/pricing read contracts without leaking alternative-tier prices.
4. Implement cart command/query vertical slice.
5. Extend order lifecycle commands with authorization, optimistic concurrency, cancellation/release behavior, and audit/outbox coverage.
6. Implement purchasing + receipt → inventory domain operations.
7. Implement durable outbox delivery records, worker/retry/dead-letter and consumer idempotency.
8. Implement staged import/export pipeline with fingerprints and row diagnostics.
9. Implement offline reference-data cache and deterministic replay/sync.
10. Add typed API contracts and contract tests.
11. Add observability/correlation/error classification.
12. Add performance and concurrency evidence.
13. Add deployment/recovery automation and configuration validation.
14. Build authenticated web/PWA runtime only after the domain/API boundary is executable.
15. Run full E2E/security/runtime certification against a real environment.
16. Freeze architecture and release only after exact-HEAD evidence closes every required gate.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The only permitted analytical direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Report-Advisor has no operational write path into Aghbari. Intelligence recommendations are never operational commands. Aghbari core operations do not depend on Report-Advisor availability.

## No-false-closure
`DOCUMENTED` ≠ `IMPLEMENTED`.
`IMPLEMENTED` ≠ `VERIFIED`.
`VERIFIED` ≠ `RUNTIME PROVEN`.
`RUNTIME PROVEN` ≠ `PRODUCTION CERTIFIED`.

Every final PASS must identify the exact commit, executable test, environment, and result.

## Current execution result
The repository has crossed the architecture-only boundary: an actual operational core implementation now exists in the execution branch. The highest-value next action is therefore **repairing the executable Phase-1 CI boundary and then expanding the vertical slices**, not writing more architecture-only documentation.
