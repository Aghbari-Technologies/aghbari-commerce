# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`4ff7425bf5c70e83106c0af3e786575efe8e1b4b`**
- Latest integrated PR: **#24 — MERGED**
- Integrated execution batches: operational implementation (#16), offline cart security (#17), export/RLS hardening (#18), release documentation (#19), customer/inventory/finance hardening (#20/#21/#22), outbox worker security (#23), browser E2E gate (#24).

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfers/thresholds, purchasing/receiving, finance/invoices/payments/cash/expenses, import/export, outbox worker, PWA/offline primitives, security hardening |
| INTEGRATED | **PASS — current `main` HEAD `4ff7425bf5c70e83106c0af3e786575efe8e1b4b`** |
| VERIFIED | **PENDING fresh executable CI on current HEAD** |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated staging/browser runtime and external delivery evidence still required |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current phase
**PHASE 2 — operational product completion + evidence closure.** Multiple real operational vertical slices are now implemented and integrated. Remaining work is evidence-driven verification, the still-missing operational modules in the canonical roadmap, runtime/deployment proof, and final exact-HEAD certification.

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
- Inventory: atomic warehouse transfer, deterministic balance locking, idempotent replay, audit/outbox evidence, stock thresholds and low-stock detection/UI.
- Purchasing/receiving: suppliers, purchase orders, submit/approve, atomic receiving and inventory movement evidence.
- Operational catalog/price CSV export with spreadsheet formula-injection hardening and tenant-scoped staff price visibility.
- Operational finance: invoices from completed/ready orders, partial/full payments, audited cash-account provisioning, cash ledger entries, expenses, balance calculation and overdraft protection.
- Durable outbox claim/ack/failure database boundary and deployable webhook worker with fail-closed inbound worker authentication.
- PWA manifest/service worker/offline fallback.
- Security headers/CSP and browser secret-boundary checks.
- Playwright authenticated browser critical-path gate and manual deployment-target runtime workflow.

## Current executable evidence
- Historical G1/domain/PostgreSQL/order-workflow evidence remains **prior-boundary regression evidence** only.
- Historical intelligence contract proof remains prior-boundary evidence only.
- Recent GitHub Actions jobs were created for current execution branches, but observed jobs failed at runner/job startup before actionable test steps were exposed. Therefore no green current-head CI result is claimed.
- Runtime E2E is implemented but not executed against a real deployed target in this session because it requires the target URL and dedicated authenticated E2E credentials.
- Outbox delivery is implemented but external webhook delivery/retry/idempotency is not runtime-proven.

## Forensic defects discovered and repaired
1. Offline cart enqueue calls used the wrong `enqueueOfflineOperation` argument shape; repaired.
2. Offline cart replay was not authenticated-user scoped; repaired.
3. Staff price export lacked explicit tenant-scoped RLS access; migration 0028 added it.
4. CSV export was hardened against spreadsheet formula injection.
5. Purchase idempotency omitted currency/notes from payload binding; migration 0029 added conflict rejection.
6. Customer lifecycle commands/UI were missing; migration 0030 + service + UI + pgTAP added them.
7. Inventory transfer and actionable low-stock thresholds were missing; migration 0031 + service + UI + pgTAP added them.
8. Operational invoice/payment/cash/expense layer was missing; migrations 0032–0034 + service + UI + pgTAP added it.
9. Outbox worker accepted unauthenticated privileged invocation; it now fails closed behind `OUTBOX_WORKER_TOKEN`.
10. Browser E2E infrastructure was missing; Playwright gate and deployment-target workflow were added.
11. README contained stale prototype-phase claims; reconciled with the current executable phase.

## Remaining product gaps / gates
1. **Fresh current-HEAD CI:** application quality, lint, typecheck, production build, unit tests, security and migration proof.
2. **Real Supabase staging:** authenticated multi-tenant identities and database execution for RLS/authorization negative tests.
3. **Runtime E2E:** execute Playwright against the deployed target with a dedicated test account and real seeded operational data.
4. **Offline runtime:** prove catalog/cart cache after refresh, replay, conflict handling, recovery and tenant isolation; the queue is implemented but full offline UX/cache behavior still requires runtime proof and deeper cache work if required.
5. **Outbox runtime:** configure worker secret + real consumer endpoint, then prove claim → delivery → ack, failure/retry and consumer idempotency.
6. **Import/export runtime:** prove authorized export, malformed-file rejection, staged validation, atomic commit and failure/rollback behavior on real Supabase.
7. **Inventory completion:** add/verify stock count workflow, reservations where required, product identifiers/units and lot/expiry/FEFO if confirmed in canonical business scope.
8. **Sales completion:** verify invoice/collection/returns/refunds and order-to-cash lifecycle against actual business rules; invoice/payment foundation is now present.
9. **Finance completion:** verify cash opening/closing/transfer procedures and ledger reconciliation against real business data.
10. **Notifications/integrations:** implement and runtime-prove in-app notifications and the approved integration gateway/consumer contracts; no external credentials are committed.
11. **Performance:** establish real p50/p95/p99 budgets and evidence on representative catalog/order/inventory loads.
12. **Observability/recovery:** prove audit completeness, failure visibility, backups/recovery and deployment rollback.
13. **Dependency reproducibility:** repository has no committed lockfile and CI uses `npm install`; generate/commit a valid lockfile once dependency resolution is available in the build environment.
14. **Final certification:** deterministic full-suite regression, exact final HEAD verification, freeze and production certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Report-Advisor has no operational write path into Aghbari. Intelligence recommendations are never operational commands. Aghbari does not depend on Report-Advisor availability for orders, inventory, pricing, customers, purchasing, or other core operations.

## No-false-closure
Documentation PASS means design consistency only. A domain-harness PASS does not prove database, runtime, security, deployment, or production. A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green CI run on an earlier SHA is not exact-HEAD evidence.

## Latest execution result
- **Current exact `main` HEAD:** `4ff7425bf5c70e83106c0af3e786575efe8e1b4b`.
- Customer, inventory, finance, export, offline-cart and outbox security hardening are integrated.
- Playwright runtime certification gate is integrated.
- **No production certification is claimed.**

**NEXT EXECUTION LOOP:** establish fresh current-head CI evidence; repair every genuine failure; execute real Supabase/Auth/RLS/browser/integration/runtime/deployment evidence; complete only the remaining operational modules required by the canonical scope; then freeze one exact final certification SHA.
