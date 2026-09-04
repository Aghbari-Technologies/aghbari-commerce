# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch under execution: `implementation/order-domain-foundation`
- Base exact HEAD: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Current execution boundary: **typed domain + candidate transactional schema implemented**
- Latest independently verified G1 domain-proof boundary: **`6b0759f3ae10e01ea6953268ac2eea9897863771`**
- Latest PostgreSQL G1: **PROVEN** at `6b0759f3ae10e01ea6953268ac2eea9897863771`; run `33890218264`, job `101079788325`
- Latest order-workflow proof: **PASS** at `6b0759f3ae10e01ea6953268ac2eea9897863771`; run `33890218212`, job `101079787892`
- Latest intelligence-contract proof: **PASS** at `486ee2940193b36a1a57d152b9c9fa53654c9b6b`; run `33890297796`, job `101080048316`

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Current certification state
| Stage | State |
|---|---|
| BUILT | **IN PROGRESS — typed domain + candidate transactional schema now exist** |
| INTEGRATED | NOT PROVEN — implementation branch not merged |
| VERIFIED | Existing G1 evidence proven; new domain/schema slice awaiting its CI boundary |
| RUNTIME PROVEN | BLOCKED — no connected production application/runtime or Supabase target yet |
| PRODUCTION CERTIFIED | NOT PROVEN |

## Current phase
**PHASE 1 — IMPLEMENTATION VERTICAL SLICES.**

## New implementation boundaries
### Typed domain foundation
- `src/domain/orders.ts` — typed order command/model, explicit workflow state machine, role-aware transitions, scope validation, duplicate-line rejection.
- `src/domain/pricing.ts` — server-authoritative effective-price resolution and server-side monetary total calculation.
- `src/domain/orders.test.ts` — executable adversarial unit coverage for pricing, totals, duplicate lines, legal/illegal transitions, terminal states, and versioning.
- `package.json` + strict `tsconfig.json` — reproducible TypeScript verification.
- `.github/workflows/domain-unit-proof.yml` — CI gate for typecheck and domain tests.

### Transactional database foundation
- `supabase/migrations/20260905000100_core_operational.sql` — candidate PostgreSQL operational core covering organization/branch/warehouse scope, users/roles/customer tiers/customers, catalog, pricing, inventory balances/movements, carts, orders/order items/status history, durable outbox, and audit events.
- `poc/schema-proof/schema-proof.sql` — executable PostgreSQL schema/constraint proof covering core table presence, numeric money, duplicate cart-line rejection, and negative inventory rejection.
- `.github/workflows/schema-proof.yml` — PostgreSQL 18 CI gate applying the migration and running the schema proof.

The schema remains a **candidate** until Batch-3 reconciliation and final technology/schema freeze. It contains no analytical/BI tables and does not claim Supabase RLS/runtime certification.

## Evidence boundary
- Existing G1 PostgreSQL/domain/order evidence remains bound to its original exact HEAD and is not relabeled.
- New typed domain implementation: **IMPLEMENTED; CI evidence pending**.
- New candidate schema: **IMPLEMENTED; PostgreSQL schema proof pending CI execution**.
- No runtime, RLS, deployment, or production PASS is inferred from implementation alone.

## Pending execution — next highest-value work
1. CI-verify the new domain and schema slices; repair failures immediately.
2. Implement the transactional order persistence function against the candidate schema: authoritative price lookup, locked inventory decrement, idempotency, immutable committed line price/total, status history, audit, and outbox emission in one transaction.
3. Add negative and concurrency tests for that real transactional path.
4. Add the remaining purchasing/import-export/integration persistence boundaries.
5. Implement direct-request authorization + RLS against a real Supabase target when available.
6. Build the customer/PWA and admin operational command-center runtime on top of the verified service/domain boundaries.
7. Implement offline/sync, media, notifications, Onyx and WhatsApp adapters with durable delivery evidence.
8. Complete performance, observability, deployment/recovery, E2E, Exact-HEAD, and production certification gates.
9. Reconcile Batch 3 before final architecture/schema freeze.

## Product boundary — non-negotiable
Aghbari owns operational truth. Analytics, BI, forecasting, Decision Intelligence, and recommendations remain outside the operational core. No duplicate analytical platform is introduced here.

## No-false-closure
Documentation PASS means design consistency only. Domain/unit PASS does not prove database/runtime security. A migration applied once does not prove upgrade safety. A queued integration is not a delivered integration. A commit existing on GitHub is not evidence that runtime behavior is correct.

**NEXT:** obtain CI evidence for this exact implementation boundary, then continue directly into transactional order persistence.
