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