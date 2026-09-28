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


## 2026-09-27 — Reference-driven visual patterns

`docs/ui-reference/` is a visual inspiration/provenance corpus captured from another application/context. It is not an Aghbari screen inventory.

When a reference is relevant to an existing canonical Aghbari capability, preserve applicable visual intent across:
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

- The 84 supplied PNGs are provenance assets only; they are not automatically P0 implementation targets.
- Full UI construction means canonical Aghbari capability coverage across Admin/Staff and Customer Portal, including nested views, actions, validation, permissions and all applicable states; visual references only guide reusable presentation patterns.
- Use a shared visual system first, then close screens in dependency batches. Do not create duplicate CSS/component families to match isolated screenshots.
- Any reference-derived pattern that is used must map to an existing/in-scope Aghbari route or an explicit boundary classification; duplicate/equivalent source-app images must not produce duplicate Aghbari screens.
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

## 2026-09-28 — External reference corpus rule

The current `docs/ui-reference/` corpus is visual material captured from another application/context. It is not a list of Aghbari routes.

UI execution must therefore:
1. extract reusable visual patterns;
2. map only applicable patterns to existing canonical Aghbari surfaces;
3. merge genuinely missing UX requirements into this document;
4. avoid reproducing unsupported functionality;
5. avoid duplicate screen implementations for visually equivalent references.

The 84-asset count is provenance/accounting only. UI completion is measured by canonical Aghbari capability coverage, nested state coverage, real actions, accessibility/responsive behavior and exact-SHA runtime/browser proof.

## 2026-09-28 — Customer catalog filtering + contextual Staff navigation

- Customer Catalog now exposes real local presentation filters for stock availability and the presence of a positive base authorized price, with active-filter context, clear-all, empty-result recovery and a responsive modal filter surface.
- Catalog loading now renders a bounded skeleton state rather than a text-only placeholder. Filtering is presentation-only; server pricing/stock remain authoritative.
- The Customer Portal resets catalog pagination when query, category or catalog filters change.
- Admin/Staff navigation now surfaces the active workspace and highlights the matching operational target while preserving the existing anchor/deep-link contract and server-side authorization boundary.

## 2026-09-28 — Shared workspace-surface contract
- Admin/Staff and Customer Portal use a shared responsive workspace-surface rail for navigation context.
- Customer visibility is derived from the same live presentation configuration already used by the portal; hidden Finance/Templates surfaces are not rendered when their feature is disabled.
- Staff rail derives live targets from the canonical role-filtered Admin structure; the Boundary surface is shown only when the current role has declared non-live capabilities.
- The rail is presentation/navigation only. It does not grant permissions or create transactional authority.

## 2026-09-28 — UI-first full-surface closure gate

For the active closure wave, UI is a product surface closure problem, not a route/navigation problem.

An in-scope surface is closed only when its applicable path is implemented through:

```text
SCREEN / SUBVIEW
→ REAL CONTENT CONTRACT
→ REAL CONTROLS / FORMS
→ REAL STATES
→ REAL ACTIONS / PERSISTENCE
→ PERMISSION BEHAVIOR
→ RTL + RESPONSIVE
→ ACCESSIBILITY
→ FOCUSED TEST
→ BROWSER / RUNTIME PROOF
→ EXACT-SHA EVIDENCE
```

The Customer Portal and Admin/Staff surfaces are first-class product areas. Missing documented capabilities must be placed under their correct logical parent. When no correct parent exists, a new logical section/route is created instead of hiding the capability in an unrelated surface.

The 84 supplied PNGs are a visual reference corpus. Every asset remains accounted for through the UI reference index, while duplicate/equivalent references share one implementation target. An in-scope visual family cannot be closed through a registry row, route existence, generic cards, or a visually similar placeholder.

Requirements discovered from references or canonical specifications are not parked as notes: they are routed to the owning canonical contract and implemented in the same closure wave whenever they are in scope. Unsupported behavior is an explicit boundary, not a fake transaction.
