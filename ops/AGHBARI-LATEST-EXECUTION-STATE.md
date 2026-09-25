# AGHBARI LATEST EXECUTION STATE

Latest verified functional code baseline: 3b38d2eb058bc5d9b752d6c61b68e529c45acf0f
Observed main HEAD before this state write-back: 915d080c2d15d2f52f1e8b6301b3a19d098402fc
Branch: main
Production: NO TOUCH
Certification: NOT CLAIMED

## CURRENT REALITY

- Customer Portal remains the active `AppV3Fixed` experience with catalog/search/categories, backend pagination, product detail, cart, Excel quick order, templates, order history/detail/reorder, account dashboard, finance center, notifications, offline/recovery and payment-aware checkout.
- Customer finance now uses bounded ledger pagination. Customer order/quick-order/Excel/cart modal surfaces expose dialog semantics.
- Admin/Staff contains dedicated operational workspaces for Catalog, Categories, Customers, Pricing, Purchasing, Receiving, Suppliers, Warehouses, Inventory Ledger/Activity, Finance History, Notifications, Governance and Access.
- Dense operational records now use a shared accessible detail drawer where existing backend fields are available.
- Supplier, Warehouse, Inventory Activity, Governance/Outbox, Notifications, Organization Access and Customer Finance collections use bounded pagination with filter/tab resets.
- No reporting or Promotions transactional model was fabricated.

## EXACT-SHA PROOF

- Implementation code before the documentation-only checkpoint: `3b38d2eb058bc5d9b752d6c61b68e529c45acf0f`.
- Documentation write-back commits preserve the same implementation tree; however PASS must only be claimed from a CI/browser run whose `head_sha` equals the final observed main SHA.
- Final exact-SHA gates are currently queued/pending; no PASS is claimed.
- The current Vercel connected-app check returned HTTP 403, so no new hosted runtime proof is claimed.
- Production remains NO TOUCH.

## OPEN UI FRONTIER

- Customer: deeper mobile/accessibility refinements and additional profile fields only where an existing service/schema contract exists.
- Admin/Staff: nested recovery/detail for governance/outbox, receiving and reconciliation where current contracts expose actionable state.
- Pricing/Catalog: richer edit/history only through existing mutation contracts.

## OPEN CORE / SECURITY / RELEASE

- Exact-SHA application-quality, security, G1/domain, migration, concurrency, Test-the-Test, browser-local and deployment workflows.
- Individual SECURITY DEFINER classification remains open; required authenticated RLS-helper privileges must not be revoked blindly.
- Legacy Markdown semantic consolidation remains 50/50 classified but not certified retired.
- Vercel deployment/protection remains an external gate; do not weaken artifact identity.
- Certification and production remain HOLD / NO TOUCH.

## CURRENT RESUME POINTER

START FROM ACTUAL MAIN HEAD, THEN VERIFY THE FINAL SHA BEFORE ANY NEW CODE.
UI: Customer mobile/a11y -> Admin Governance/Outbox -> Receiving/Reconciliation recovery -> Pricing edit/history, only with existing contracts.
CORE: consume exact-SHA CI/security/domain/migration/concurrency/Test-the-Test results and repair regressions.
PROOF: one exact SHA at a time; no evidence transfer between code, CI, artifact, deployment or production.
RESOURCE: avoid additional push-triggered builds until current final SHA gates are consumed.
DO NOT REOPEN: checkout payment/idempotency, canonical RBAC RPC boundary, offline cart queue, tenant/RLS helper boundary, or already-closed UI surfaces unless exact evidence shows regression.
