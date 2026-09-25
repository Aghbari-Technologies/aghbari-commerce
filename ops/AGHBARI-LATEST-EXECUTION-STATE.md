# 🔴 AGHBARI LATEST EXECUTION STATE

**Actual Git HEAD:** 37cc8687bb89e47357c96e04d0921662be2fa4e4
**Latest functional UI HEAD:** 37cc8687bb89e47357c96e04d0921662be2fa4e4
**Branch:** main
**Production:** NO TOUCH
**Certification:** NOT CLAIMED

## CURRENT REALITY

- Admin now exposes dedicated Catalog, Category, Pricing, Customer, Purchasing, Receiving, Supplier, Warehouse, Inventory Ledger, Finance, Notifications, Governance and Access workspaces.
- Customer Portal now has catalog offset pagination, filtered/paged order history, detail/tracking/reorder, richer account summary, finance center, templates, Excel quick order, offline/recovery states and controlled payment-aware checkout.
- New read-oriented workspaces are backed by existing tenant-scoped commerce tables; no presentation feature was invented without an existing data contract.
- Promotions remains intentionally absent because its business/data contract is not defined in the current canonical schema.

## EXACT-SHA PROOF

Current functional SHA: `37cc8687bb89e47357c96e04d0921662be2fa4e4`.

- Exact current CI runs are queued; no PASS is claimed.
- Earlier PASS evidence belongs to earlier SHAs and is not transferable.
- Local build verification could not run because this execution environment has no outbound DNS/network access for cloning dependencies; no local PASS is claimed.
- Current Vercel status is blocked by deployment rate limiting, so hosted runtime proof for this SHA is not available yet.

## OPEN UI FRONTIER

- Purchasing: deeper receipt/order detail views and line-level receiving history.
- Inventory: reconciliation history and stock-count history/detail.
- Finance: richer payment/expense detail and account-level filtering.
- Pricing: richer active-list matrix only where existing backend read contracts support it.
- Customer: further mobile/accessibility refinement and profile fields only from existing backend columns.
- Admin governance/access: nested audit/outbox detail and recovery states.

## OPEN CORE / SECURITY / RELEASE

- Finish exact-SHA CI gates and repair regressions.
- Continue routine-by-routine SECURITY DEFINER classification.
- Continue semantic consolidation/reference audit of legacy Markdown.
- Certification and production remain HOLD / NO TOUCH.

## CURRENT RESUME POINTER

START FROM ACTUAL HEAD 37cc8687bb89e47357c96e04d0921662be2fa4e4.

UI FRONT:
Admin → Catalog/Category/Pricing → Customers → Purchasing/Receiving/Suppliers → Warehouses/Inventory Ledger → Finance → Governance/Access.
Customer → Catalog → Orders → Account → Finance → Templates → Notifications → Checkout/Offline recovery.

CORE FRONT:
Preserve current create_order/payment method, tenant/RLS, audit/outbox and idempotency contracts.

VERIFY:
Use only exact 37cc868 evidence; no PASS transfer.

DEPLOY:
Vercel is currently rate limited for new deployments. Do not treat failed Vercel status as an application failure; use the last known good hosted runtime only as historical proof, never as evidence for 37cc.

DO NOT REPEAT:
Do not reopen proven order/idempotency/offline foundations unless exact 37cc CI or runtime evidence shows regression.
