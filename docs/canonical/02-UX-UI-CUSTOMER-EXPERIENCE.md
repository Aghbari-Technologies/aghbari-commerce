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


## 2026-09-25 — Current UI integrity hardening
- Every executable Admin deep-link target in `src/structure/admin-structure.ts` must resolve to a matching DOM anchor in the current live workspace; unresolved anchors are a navigation defect.
- Capability buttons may not be rendered as executable controls unless they have a real interaction. Unsupported capabilities such as image search remain explicit non-action boundaries.
- Customer voice search is implemented through the browser Speech Recognition API with Arabic locale, explicit unsupported-browser/permission recovery, and a visible listening state. 
- Dynamic customer-control settings expose only real controls; order limits, template limits and payment-method configuration are validated before persistence.


## 2026-09-27 — Reference-driven visual closure

`docs/ui-reference/` is now a mandatory visual reference source for UI execution. The current pack contains 84 PNG screenshots.

For every reference-backed surface, preserve the reference's visual intent across:
- page composition and information hierarchy;
- Arabic/RTL alignment and reading order;
- top navigation/header hierarchy;
- contextual right-side navigation where applicable;
- grouped pale-cyan panels, rounded operational cards and compact pill actions;
- dense tables with clear column hierarchy, badges and action affordances;
- KPI/summary cards and quick-action strips;
- responsive desktop/tablet/mobile composition;
- dialogs/drawers, focus behavior and progressive disclosure;
- loading/empty/error/success/disabled/permission/offline states.

Visual fidelity must be implemented through shared tokens/primitives and reused components before screen-specific overrides.

The screenshot pack is a visual contract only. A screenshot that shows AI/BI/Onyx/Promotions or other unsupported functionality does not authorize fabrication of a Commerce backend contract. Such surfaces must remain explicit boundaries until canonical product/data contracts exist.

Every applicable P0 reference must be mapped to a real in-scope route or an explicit boundary classification. A render-only approximation is not closure.

## 2026-09-27 — UI time-efficiency rule

UI work must proceed by closure batches:
`reference pack → shared design primitives → live screen → nested states → real actions → exact-SHA verification`.

Do not create a second design system, duplicate CSS family or duplicate asset copy for the same visual requirement.

## 2026-09-27 — Full reference pack closure

- All 84 current docs/ui-reference/ PNGs are P0 visual inputs until explicitly classified otherwise.
- Full UI construction means reference coverage across Admin/Staff and Customer Portal, including nested views, actions, validation, permissions and all applicable states; it is not limited to the first visible route.
- Use a shared visual system first, then close screens in dependency batches. Do not create duplicate CSS/component families to match isolated screenshots.
- Every reference-backed screen must have a route/surface, state, viewport, implementation status and exact-SHA visual/runtime proof, or an explicit boundary classification.
- Reference-derived UI requirements discovered during execution must be added here when they concern user experience, navigation, interaction or accessibility.
\n\n## 2026-09-27 — Customer finance document workspace\n\n- The Customer Portal finance section exposes the existing Commerce financial document contract as read-only UI: operational invoices, invoice line items and recorded payments.\n- Invoice lists use bounded loading, search, status filtering, sorting and pagination. Invoice details expose line-item totals, recorded payments, paid amount and remaining balance with loading, empty, error, retry and offline states.\n- The UI reads only the existing RLS-protected operational_invoices, operational_invoice_items and payments resources; it does not introduce customer-side financial mutations.\n- Customer financial document data is server-bound and is deferred while offline, consistent with the portal's offline reliability boundary.\n

## 2026-09-27 — Bulk order action workspace

- The Admin/Staff Orders workspace supports selecting visible orders, choosing only a transition common to all selected orders, previewing the exact affected orders, then committing through the atomic bulk RPC.
- The UI retains a reusable idempotency key across a preview/commit retry so a lost response cannot silently authorize a second mutation under a new key.
- The server remains authoritative for organization, role, current-state and inventory invariants; client preview is advisory and cannot bypass authorization.

## 2026-09-27 — Operational trust surface
- Customer Portal exposes a compact provenance strip for connection state, account pricing basis, warehouse stock source and transactional authority.
- Online state identifies server-backed data; offline state explicitly identifies cached data as display-only and non-authoritative.
- Trust messaging is descriptive UI only and does not become a second source of pricing, stock or transaction truth.

## 2026-09-27 — Persisted portal theme
- Owner/admin settings now include persisted portal appearance controls: validated accent color and compact/comfortable density.
- The Customer Portal applies those settings through the existing `client_ui_settings` contract; invalid colors fall back to the canonical Aghbari accent.
- Appearance is a live UI surface mapped to `/admin/settings`; no separate theme storage or business authority is introduced.


## 2026-09-28 — Customer account workspace closure wave
- Customer Portal account navigation is implemented as a dedicated reusable workspace with sub-surfaces for overview, profile, company/account context, live addresses and account settings.
- Profile/company/settings surfaces are read-only against existing Commerce contracts; no unsupported customer mutation is fabricated inside the portal.
- Addresses are now a live in-scope Customer Portal capability backed by the canonical `customer_addresses` migration; checkout/order shipping-address binding remains outside this requirement until its explicit transactional contract exists.
- Account workspace keeps Offline Recovery as an actionable operational surface and provides direct navigation back to catalog, orders, finance and order templates.

## 2026-09-28 — Customer delivery-address workspace
- The account workspace now exposes a live delivery-address surface rather than a placeholder boundary.
- Required states: loading, empty, validation/action error, success, offline/disabled, edit mode and destructive-action confirmation.
- Customer actions are CRUD plus explicit set-default; the server maintains a single default atomically. Offline mode fails closed for address reads/mutations instead of presenting fabricated or stale transactional data.
- Address management remains visually consistent with the existing account workspace and reuses the canonical customer UI system; it does not create a second design system.


## 2026-09-28 — Staff order detail workspace closure
- Admin/Staff order rows now open the real operational order-detail contract instead of a summary-only drawer.
- Detail loading is explicit; successful detail reads expose customer, state, totals, payment method and every authorized order line with quantity, unit price, line total and pricing tier.
- Client parsing rejects malformed order IDs, invalid line identifiers and inconsistent line totals; the service also verifies subtotal against the sum of line totals before rendering.
- Detail read failure preserves the record unchanged and exposes an explicit retry action. The drawer remains keyboard-accessible and reusable across operational record surfaces.


## 2026-09-28 — Staff reorder and template boundary
- Customer Portal `reorder` and `order_templates` remain live customer-owned capabilities with real persistence and server authorization.
- Admin/Staff navigation must not expose a fake management workspace for these customer-owned records until a canonical staff permission, read contract and mutation contract are defined.
- The Admin structure therefore classifies `/admin/reorder` and `/admin/order-templates` as explicit boundaries rather than render-only screens.
