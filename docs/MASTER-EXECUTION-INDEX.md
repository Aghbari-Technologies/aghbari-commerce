# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch under execution: `implementation/order-domain-foundation`
- Base exact HEAD: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Current execution boundary: **typed order/inventory/outbox domains + candidate transactional persistence implemented**
- Latest independently verified historical G1 evidence remains bound to its original exact HEAD.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Current certification state
| Stage | State |
|---|---|
| BUILT | **IN PROGRESS — core domain and first transactional persistence slice implemented** |
| INTEGRATED | NOT PROVEN — implementation branch not merged |
| VERIFIED | Historical G1 evidence proven; new implementation boundary awaiting CI evidence |
| RUNTIME PROVEN | **BLOCKED** — no connected Supabase project/application runtime currently available |
| PRODUCTION CERTIFIED | NOT PROVEN |

## Current phase
**PHASE 1 — IMPLEMENTATION VERTICAL SLICES.**

## Implemented execution boundaries
### Order + pricing domain
- `src/domain/orders.ts` — typed order command/model, explicit state machine, role-aware transitions, scope validation, duplicate-line rejection.
- `src/domain/pricing.ts` — server-authoritative effective-price resolution and canonical total calculation.
- `src/domain/orders.test.ts` — executable invariant tests.

### Inventory + FEFO domain
- `src/domain/inventory.ts` — available-quantity invariant, movement validation, deterministic FEFO allocation that excludes expired lots.
- `src/domain/inventory.test.ts` — executable availability/movement/FEFO tests.

### Outbox domain
- `src/domain/outbox.ts` — explicit PENDING → PROCESSING → DELIVERED/RETRYABLE/DEAD_LETTER lifecycle with attempt accounting and terminal-state protection.
- `src/domain/outbox.test.ts` — executable delivery-state tests.

### Transactional PostgreSQL candidate
- `supabase/migrations/20260905000100_core_operational.sql` — operational core schema: organization/branch/warehouse, identity/roles, customers/tiers, catalog, pricing, inventory, carts, orders, status history, outbox, audit.
- `supabase/migrations/20260905000200_create_order_transaction.sql` — atomic order transaction boundary.
- `supabase/migrations/20260905000300_harden_order_idempotency.sql` — payload-bound idempotency hardening.
- `supabase/migrations/20260905000400_enforce_scope_integrity.sql` — organization/branch/warehouse ownership constraints at FK boundaries.
- `supabase/migrations/20260905000500_rls_core.sql` — deny-by-default Supabase RLS policies and private security-definer scope helpers.
- `supabase/migrations/20260905000600_secure_order_command.sql` — authenticated-actor binding for the order command; client-supplied actor identity is not trusted.

### Executable proof
- `.github/workflows/domain-unit-proof.yml` — strict TypeScript + domain test gate.
- `.github/workflows/schema-proof.yml` — PostgreSQL 18 schema/constraint gate.
- `.github/workflows/order-transaction-proof.yml` — PostgreSQL order transaction gate.
- `poc/schema-proof/schema-proof.sql` — schema/constraint proof.
- `poc/schema-proof/order-transaction-proof.sql` — canonical price, server total, inventory mutation, idempotent replay, payload conflict, audit/outbox/movement persistence proof.

## Evidence boundary — strict
The new code is **implemented but not certified** until its CI evidence is successful on the exact current HEAD. Existing GitHub Actions failures were observed and rerun; no failure was converted into PASS without evidence. Local TypeScript domain logic was independently transpiled and exercised successfully, but local PostgreSQL tooling is unavailable, so database proof remains CI/runtime-bound.

## Next execution order
1. Verify/repair the current CI boundary on the exact branch HEAD.
2. Add concurrency proof for the real `create_order_transaction` path.
3. Harden and test Supabase RLS with authenticated direct requests when a real Supabase project exists.
4. Implement typed service/API adapters around the domain and transaction boundaries.
5. Implement customer, catalog, pricing administration, inventory operations, purchasing, import/export, and operational notification vertical slices.
6. Implement durable worker/adapters for outbox delivery, Onyx Pro, and WhatsApp.
7. Build the Arabic RTL customer PWA and operational command center.
8. Add offline/sync, media/storage, observability, performance, deployment/recovery, and authenticated E2E.
9. Reconcile Batch 3, freeze final schema/architecture, then perform Exact-HEAD production certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No BI/forecasting/Decision Intelligence duplication is introduced into the operational core.

## No-false-closure
Implementation is not verification. CI PASS is not runtime PASS. Runtime PASS is not production certification. Every release claim must be bound to the exact HEAD and its executable evidence.
