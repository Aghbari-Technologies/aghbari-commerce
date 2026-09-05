# Aghbari — Implementation Status V1

**Boundary:** current operational implementation through stock-count reconciliation; verification and runtime certification remain evidence gates.

## Status

- Architecture: RECONCILED
- Canonical ownership: ACCEPTED
- Physical relation families: IMPLEMENTED IN MIGRATION TREE
- Transactional domain POC invariants: PROVEN at prior exact boundary
- Order workflow POC: PROVEN at prior exact boundary
- Operational frontend/PWA: IMPLEMENTED and integrated
- Operational domain/services: IMPLEMENTED and integrated
- Supabase operational migrations/RLS/RPC layer: IMPLEMENTED in migration tree
- Catalog, cart, orders, import, image pipeline and offline queue: IMPLEMENTED
- Purchasing + receiving vertical slice: IMPLEMENTED — migrations `0026`/`0027`, typed service, adversarial pgTAP coverage, operational command-center UI
- Customer lifecycle: IMPLEMENTED — create, tier, activation state, RBAC, audit and UI
- Inventory transfer + thresholds/low-stock: IMPLEMENTED — transactional RPCs, audit/outbox and UI
- Stock count/reconciliation: IMPLEMENTED — migration `0035`, typed service, command-center UI and adversarial pgTAP test
- Finance: IMPLEMENTED — invoices, payments, cash accounts, expenses and non-negative cash protection
- Catalog export: AVAILABLE through the existing operational export panel
- Outbox: durable claim/recovery contract implemented; deployable webhook worker now present; production delivery proof remains open
- Real Auth/RLS E2E: BLOCKED pending connected staging Supabase target
- Browser E2E: IMPLEMENTED as an executable Playwright gate; runtime execution remains pending target + dedicated credentials
- Production deployment: OPEN — runtime target and deployment proof not yet established
- Production certification: NOT CERTIFIED

## Current implementation boundary
**Exact current `main` HEAD:** `6fa2c4fa164dec30dd1f87a1cbdad71a5b4bec34` (documentation update after implementation boundary `dbddc90877ee067b60af6a18169e4cac6e0e6eb2`).

The repository contains a real React/Vite operational application, Supabase migration/RPC implementation, domain services/tests, offline/PWA assets, import pipeline, catalog export, order/cart hardening, purchasing/receiving, customer lifecycle, inventory reconciliation and operational finance.

## R5 purchasing/receiving
- tenant-bound suppliers;
- purchase-order creation with server-side validation;
- submit → approve workflow;
- atomic receiving into warehouse inventory;
- inventory movement evidence;
- audit/outbox evidence;
- operation-level idempotency;
- rejection of same-key/different-payload replay;
- adversarial pgTAP coverage;
- staff command-center controls for supplier creation, purchase creation, approval and receiving.

## R3 stock count
- stock-count session is tenant/warehouse bound;
- only owner/admin/warehouse may operate it;
- start operation is idempotent;
- expected quantity is captured without mutating inventory;
- every line must be counted before completion;
- completion locks the session and current inventory row;
- reconciliation targets the physical counted quantity rather than blindly overwriting from a stale snapshot;
- non-zero variance becomes an inventory movement tied to the count session;
- audit + outbox evidence is emitted;
- pgTAP covers the critical invariants and idempotent replay.

## Verification boundary
Historical G1/domain/PostgreSQL/order evidence is prior-boundary regression evidence only. The current post-stock-count code has not received a fresh executable CI PASS. Recent GitHub Actions infrastructure failures are recorded as verification infrastructure failures rather than code PASS. Any new implementation commit invalidates earlier exact-HEAD evidence.

## Immediate execution order
1. Execute fresh current-head application quality and migration proof; repair every actionable failure.
2. Connect/provision staging Supabase and execute Auth/RLS Tenant A/B negative tests.
3. Execute all current pgTAP suites against empty/reset and upgrade paths.
4. Execute authenticated Playwright browser proof on the deployed target.
5. Complete offline cache/replay/conflict/recovery runtime proof.
6. Complete outbox delivery/retry/backoff/DLQ/consumer-idempotency runtime proof.
7. Complete import/export runtime proof.
8. Close remaining Sales/Inventory/Notifications/Integration Hub requirements that are confirmed by the canonical scope.
9. Add performance, observability, backup/recovery and deployment rollback evidence.
10. Freeze one exact final HEAD and certify only after every gate has evidence.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction remains:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## Evidence rule
Every future PASS claim must name the exact HEAD, execution environment, test path, and evidence artifact. A commit alone is never a runtime PASS.
