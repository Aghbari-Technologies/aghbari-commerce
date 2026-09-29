# 🔴 AGHBARI — CANONICAL PRODUCT & REQUIREMENTS

**Authority:** Product scope, business capability, acceptance criteria and completion definition.

## Product mission
Build a serious Arabic-first B2B operational commerce product for wholesale/distribution merchants. Commerce is the transactional system of record.

## Capability map
Catalog; products; SKU/barcodes/units/categories/media; pricing and customer/tier rules; customers; suppliers; carts; checkout; orders and lifecycle; purchasing/receiving; warehouses; inventory; transfers; stock count/reconciliation; operational finance (invoices/payments/expenses/cash); imports/exports; invitations; roles/permissions; notifications; audit/governance; PWA/weak-network; integrations/outbox; Admin/Staff operations; Customer Portal including Home/merchant workspace.

## Completion contract
A capability is complete only when the UI, states, real interactions, domain/service behavior, persistence, authorization, audit, tests and applicable runtime evidence are complete.

## Business truth
Server/database are authoritative for price, stock, permissions and final order acceptance. Derived views and caches never become truth.

## Product evolution
Preserve business capability, redesign weak legacy implementation. Market signals may improve in-scope capabilities but must not create uncontrolled scope.

## Canonical source merge register
The consolidation manifest in docs/CANONICAL-DOCUMENT-SYSTEM.md lists the 9 source product documents that must be fully merged into this document before retirement. Their content must not be lost.


## 2026-09-27 — Final-closure acceptance rules

The remaining work is closure of the existing Commerce capability map, not expansion into unrelated products.

Reference-backed UI is an acceptance input for in-scope capabilities. A capability is not accepted when the implementation merely reproduces a screenshot; it must also satisfy the existing completion contract: real interaction, domain/service behavior, persistence, authorization, audit, tests and applicable runtime evidence.

The current `docs/ui-reference/` corpus contains 84 PNG assets captured from another application/context. They are visual reference material, not an Aghbari screen inventory or P0 completion denominator. A screenshot may influence an in-scope Aghbari experience only after reconciliation with the canonical Commerce business/data contract; unsupported behavior remains an explicit boundary.

No additional product scope is created solely because a legacy screenshot contains AI/BI/Onyx/Developer tooling or Promotions.

## 2026-09-27 — Reference-driven requirement ingestion

- Visual references are evidence for experience requirements, not permission to fabricate backend behavior.
- When reference review reveals a missing product requirement, classify it explicitly as in-scope Commerce requirement, boundary, or unsupported historical behavior.
- In-scope missing requirements must be added to this canonical document and converted into an executable gap in the same closure cycle where practical.
- Product closure for a UI surface requires real interaction, state, persistence where applicable, authorization and proof; visual presence alone is insufficient.

## 2026-09-29 — Customer delivery addresses + checkout binding
- Customer Portal requires a real saved delivery-address capability: create, read, update, delete and one optional default address per customer.
- Address records are customer-owned Commerce data, tenant-scoped and auditable. The UI may not fabricate addresses or imply persistence when offline.
- Checkout accepts an optional customer-owned delivery address and the canonical order command snapshots the selected address into the order. The snapshot is immutable historical order context; later address edits or deletion do not rewrite the order.
- The selected delivery address participates in order idempotency payload matching; the same key with a different delivery address is rejected as a payload conflict. The legacy order RPC signatures remain compatible through wrappers that omit the shipping address.

## 2026-09-28 — Supplier and warehouse administration
- Admin/Staff UI includes real supplier and warehouse edit surfaces within Commerce scope.
- Supplier updates cover name, contact fields and active state; warehouse updates cover name, active state and active-branch assignment.
- Update operations are server-authorized and auditable. Unsupported historical AI/BI/Onyx/Developer-AI edit screens remain boundaries rather than being implemented as transactional features.


## 2026-09-28 — Customer self profile
- Customer Portal profile supports self-service editing of display name and phone only.
- Email, customer tier and account active state remain outside customer self-service and are rendered as protected/read-only data.

## 2026-09-28 — Visual references are not product-scope expansion

The supplied `docs/ui-reference/` screenshots originate from another application/context and are used only as visual references. They do not enlarge the Aghbari Commerce product scope.

A screenshot may reveal:
- an applicable UX pattern;
- a missing in-scope Commerce capability;
- a reusable state/layout pattern;
- or an unsupported external capability.

Only the first three may influence Aghbari implementation, and only after reconciliation with the canonical Commerce contract. Unsupported functionality remains an explicit boundary.

The number of reference assets is not a completion denominator. Product closure is measured against the canonical Aghbari capability map and its implementation/evidence contract.


## 2026-09-29 — Customer statement view
- Customer Portal Finance includes a real **كشف الحساب** subview for authorized customer financial records.
- The statement aggregates operational invoices and their recorded payments through the existing RLS-scoped tables; it reports invoiced, paid and outstanding totals per currency and opens the existing invoice detail view.
- This is a read-only finance presentation over existing Commerce truth and adds no payment authority or mutation path.


## 2026-09-29 — Customer payment history
- Customer Portal Finance includes a real **سجل الدفعات** subview over authorized payment records linked to customer-owned operational invoices.
- The view is read-only, searchable/filterable/sortable/paginated and opens the existing invoice detail surface; no customer payment mutation authority is added.


## 2026-09-29 — Customer pricing surface
- Customer Portal Catalog includes a dedicated **الأسعار** subview showing the current authorized product price plus quantity-tier prices for the signed-in customer.
- Pricing presentation reuses the existing authorized pricing/tier data and does not create a client-side pricing authority or synthetic price.


## 2026-09-29 — Customer Home workspace
- Customer Portal has a first-class **الرئيسية / Home** workspace as the landing surface after authentication.
- Home is a read/read-through presentation layer over existing Commerce truth: customer identity, organization, warehouse, loaded catalog count, order count/latest order, cart state, authorized credit summary when available, template count, and connection/sync state.
- Home provides navigation shortcuts to existing customer capabilities and opening the real cart; it adds no new transactional authority or synthetic business data.
- Home remains fail-closed for financial/transactional meaning when offline and explicitly describes offline data as non-authoritative.


## 2026-09-29 — Buyer acceleration memory
- Customer Home and Catalog now expose local buyer-personalization helpers over real in-scope product records: favorites and recently viewed products.
- Customer Catalog also retains a bounded recent-search list on the same device. These memories are scoped by organization/customer context and never become pricing, stock, order or account truth.
- Saved/recent actions are convenience features only; they are fail-safe when local storage is unavailable and do not imply cross-device synchronization.
