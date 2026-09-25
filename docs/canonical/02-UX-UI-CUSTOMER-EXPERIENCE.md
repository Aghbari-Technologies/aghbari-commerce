# 🔴 AGHBARI — CANONICAL UX/UI & CUSTOMER EXPERIENCE

**Authority:** All user-facing experience, navigation, interaction and visual-system requirements.

## UI closure rule
A route is not complete merely because it renders. Close route, nested views, dialogs/drawers, forms, cards/tables, search, filters, sort, pagination, bulk actions and all applicable loading/empty/error/success/disabled/permission/offline states.

## Admin/Staff information architecture
Command Center; Orders; Customers; Catalog & Products; Pricing; Inventory; Purchasing; Promotions; Imports & Exports; Integrations; Notifications; Audit & Security; Settings. Use contextual actions, command/search patterns and safe bulk operations to reduce navigation depth.

## Customer journey
Discover → Search/Filter → Product Detail → Quantity → Cart → Checkout/Order → Order Status/History → Templates/Quick Order → Account.

## Quality bar
Arabic/RTL-first, responsive Desktop/Tablet/Mobile, accessible, visually coherent, high-information-density without clutter, clear hierarchy, no dead controls, no fake data, no placeholder-as-feature.

## Interaction-to-core rule
Every meaningful action must terminate in real state and real persistence or a deliberate safe read-only behavior. UI permission visibility never replaces server authorization.

## Canonical source merge register
docs/CANONICAL-DOCUMENT-SYSTEM.md identifies the legacy UI document that must be merged before retirement.


## 2026-09-25 — Deep operational UI rule

- Dense operational records must expose progressive disclosure instead of forcing every field into the table/list. Where the current backend contract supports it, rows open an accessible read-only detail drawer with Escape/backdrop close, focus entry, responsive fields and reduced-motion behavior.
- Operational collections use bounded page sizes and reset pagination when the active tab/filter/search changes. The UI must not imply that the first loaded page is the complete dataset.
- Detail drawers are presentation-only unless an existing service/RPC mutation contract is already available; no new backend authority is fabricated to make a screen look complete.


## 2026-09-25 — Customer/Admin progressive disclosure

- Customer and Staff directories use the same progressive-disclosure rule: dense records expose a focused detail surface while the primary list remains scan-friendly.
- Customer finance uses bounded pages for ledger movements; modal surfaces for product/order/quick-order/Excel workflows carry dialog semantics and remain compatible with keyboard dismissal patterns.

## 2026-09-25 — Legacy v2.0 UI structure reconciled into Aghbari
- The supplied بوابة العامري الذكية v2.0 information architecture is retained as a structural reference, but the active brand and product boundary are الأغبري | Aghbari Commerce.
- The executable UI hierarchy is represented by src/structure/admin-structure.ts and src/structure/customer-structure.ts.
- Admin deep-link paths are mapped to real current workspaces by adminTargetForPath() and served through the Vite entry via vercel.json.
- Live items are wired to existing Commerce workspaces; external/boundary items remain visible as explicit scope boundaries rather than fake features.
- Promotions is retained as a documented contract gap until a canonical business/data contract exists.
- Advanced BI/AI, legacy Onyx analytical snapshots, Developer AI and unrelated operational surfaces remain outside Commerce transactional truth unless a separate canonical contract exists.
