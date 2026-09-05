# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`dbddc90877ee067b60af6a18169e4cac6e0e6eb2`**
- Latest execution: stock-count reconciliation vertical slice.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfer/adjustment/thresholds/low-stock/**stock count**, purchasing/receiving, finance, import/export, outbox worker, PWA/offline primitives, security hardening |
| INTEGRATED | **PASS — exact implementation HEAD `dbddc90877ee067b60af6a18169e4cac6e0e6eb2`** |
| VERIFIED | **NOT CLAIMED** — fresh executable CI has not yet produced evidence for this post-stock-count boundary |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated staging/browser runtime and external delivery evidence still required |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current phase
**PHASE 2 — operational product completion + evidence closure.** Multiple real operational vertical slices are implemented. The current execution focus is closing remaining domain gaps and converting implementation into exact-HEAD evidence.

## Completed implementation surface
- React/Vite/TypeScript Arabic RTL operational application shell and command center.
- Authentication/session integration through Supabase Auth.
- Catalog/category reads with server-authoritative authorized pricing.
- Customer cart and order submission through server-side RPC commands.
- Staff order workflow and server-side status transition enforcement.
- Product/category management, price management, inventory adjustment.
- Product image processing/storage boundary.
- XLSX staged validation and atomic commit path.
- Offline cart queue with authenticated user scoping and bounded retry behavior.
- Customer lifecycle: create, tier change, activation state, server-side RBAC, audit evidence and UI.
- Inventory: atomic warehouse transfer, deterministic balance locking, idempotent replay, stock thresholds, low-stock detection and transactional stock-count reconciliation.
- Purchasing/receiving: suppliers, purchase orders, submit/approve, atomic receiving and inventory movement evidence.
- Operational catalog/price CSV export with spreadsheet formula-injection hardening and tenant-scoped staff price visibility.
- Operational finance: invoices, partial/full payments, audited cash-account provisioning, cash ledger entries, expenses, balance calculation and overdraft protection.
- Durable outbox claim/ack/failure database boundary and deployable webhook worker with fail-closed inbound worker authentication.
- PWA manifest/service worker/offline fallback.
- Security headers/CSP and browser secret-boundary checks.
- Playwright authenticated browser critical-path gate and manual deployment-target runtime workflow.
- Workspace ignore rules and non-secret environment-variable example.

## New execution — stock count
- Migration `0035_stock_count_reconciliation.sql` adds stock-count sessions and lines with tenant-scoped foreign keys and indexes.
- `start_stock_count` snapshots expected quantities without mutating inventory and is idempotent.
- `set_stock_count_line` requires an open session, authorized staff role, and non-negative counted quantity.
- `complete_stock_count` locks the session/current inventory rows, rejects incomplete counts, reconciles to the physical count, records variance in the movement ledger, writes audit evidence, and emits an outbox event.
- Inventory command center now exposes start/count/complete workflow instead of treating reconciliation as a manual adjustment only.
- pgTAP test `010-stock-count-reconciliation.test.sql` covers creation, snapshot, incomplete-completion rejection, persisted count, reconciliation, movement evidence, variance and idempotent replay.
- A concrete implementation bug found during self-review in `set_stock_count_line` was repaired before closure: session matching now uses `l.session_id = p_session_id`, and completion stores the actual counted quantity.

## Current executable evidence
- Historical G1/domain/PostgreSQL/order evidence remains prior-boundary regression evidence only.
- Current post-stock-count implementation has **NOT PROVEN** CI until GitHub Actions executes the migration and application tests successfully.
- Runtime E2E remains implemented but not executed against a real deployment.
- Live Supabase Auth/RLS/DB execution remains unavailable through the current authorized Supabase connection; no live PASS is claimed.
- Outbox external delivery remains unproven.

## Remaining closure work
1. Fresh current-head CI: test → lint → production build → security → migration/pgTAP.
2. Fix every executable CI failure and rerun on the resulting exact SHA.
3. Real Supabase staging: Tenant A/B identities, Auth, RLS, role-negative tests, migration reset/upgrade/repeat proof.
4. Runtime browser E2E for the full critical customer/staff path.
5. Offline runtime proof including refresh/cache/replay/conflict/recovery/tenant isolation.
6. Outbox runtime proof including delivery, retry/backoff, terminal failure/DLQ and consumer idempotency.
7. Import/export runtime proof including malformed input, quarantine/staging, atomic commit and authorization.
8. Sales closure: returns/refunds and any remaining order-to-cash state transitions required by business scope.
9. Inventory closure: reservations and lot/expiry/FEFO/product identifiers/units only where required by confirmed operational scope.
10. Notifications + approved integration gateway implementation and runtime proof.
11. Performance evidence under representative load.
12. Observability, audit completeness, backup/recovery and rollback proof.
13. Production deployment smoke and exact deployed artifact verification.
14. Final regression → exact final HEAD → release candidate → certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green run on an earlier SHA is not exact-HEAD evidence. A documentation PASS is not a runtime PASS.

**NEXT EXECUTION LOOP:** establish executable current-head CI, repair failures, then continue the independent operational completion fronts while runtime/database evidence blockers remain isolated to their own tracks.
