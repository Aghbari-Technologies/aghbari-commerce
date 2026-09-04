# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch under execution: `implementation/order-domain-foundation`
- Base exact HEAD: **`f7be8d752049e503e9e6aed650aacab3d9db65b4`**
- Current exact execution HEAD: **`89fab35827307fe3aecc93cc4de7f955b2699cae`**
- Current execution boundary: **order + inventory + outbox + cart domain slices and aligned transactional schema/security candidate implemented**
- Latest independently verified historical G1 evidence remains bound to its original exact HEAD.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Current certification state
| Stage | State |
|---|---|
| BUILT | **IN PROGRESS — operational foundation vertical slices implemented** |
| INTEGRATED | NOT PROVEN — implementation branch not merged |
| VERIFIED | Historical G1 evidence proven; current new boundary requires fresh CI proof |
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

### Cart domain
- `src/domain/cart.ts` — customer cart scope validation, deterministic item upsert/removal, duplicate-line prevention, aggregate quantity calculation.
- `src/domain/cart.test.ts` — executable cart invariant tests.

### Outbox domain
- `src/domain/outbox.ts` — explicit PENDING → PROCESSING → DELIVERED/RETRYABLE/DEAD_LETTER lifecycle with attempt accounting and terminal-state protection.
- `src/domain/outbox.test.ts` — executable delivery-state tests.

### Transactional PostgreSQL candidate
- `supabase/migrations/20260905000100_core_operational.sql` — operational core schema with explicit tenant scope on role assignments and inventory balances.
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
The implementation is **not certified** until fresh CI evidence succeeds on the exact current HEAD. No failure is converted into PASS. Local domain tests are intended to run through `npm run verify`; database behavior remains CI/runtime-bound until an actual PostgreSQL/Supabase environment is available.

## Next execution order
1. Fresh exact-HEAD CI verification and repair.
2. Add concurrency/adversarial proof for the real order transaction path.
3. Harden/test authenticated Supabase RLS with Tenant A/B direct requests when a real project is connected.
4. Add customer, catalog, pricing administration and inventory operation application services.
5. Add purchasing/receiving/returns/transfers and stock ledger workflows.
6. Add import/export with deterministic validation, fingerprinting, idempotency and failure recovery.
7. Add durable outbox worker/adapters, Onyx Pro and WhatsApp integration boundaries.
8. Build Arabic RTL customer PWA and operational command center.
9. Add offline/sync, media/storage, observability, performance, deployment/recovery, authenticated E2E.
10. Reconcile Batch 3, freeze final schema/architecture, then perform Exact-HEAD production certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No BI/forecasting/Decision Intelligence duplication is introduced into the operational core.

## No-false-closure
Implementation is not verification. CI PASS is not runtime PASS. Runtime PASS is not production certification. Every release claim must be bound to the exact HEAD and its executable evidence.
