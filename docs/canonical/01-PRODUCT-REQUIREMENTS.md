# 🔴 AGHBARI — CANONICAL PRODUCT & REQUIREMENTS

**Authority:** Product scope, business capability, acceptance criteria and completion definition.

## Product mission
Build a serious Arabic-first B2B operational commerce product for wholesale/distribution merchants. Commerce is the transactional system of record.

## Capability map
Catalog; products; SKU/barcodes/units/categories/media; pricing and customer/tier rules; customers; suppliers; carts; checkout; orders and lifecycle; purchasing/receiving; warehouses; inventory; transfers; stock count/reconciliation; operational finance (invoices/payments/expenses/cash); imports/exports; invitations; roles/permissions; notifications; audit/governance; PWA/weak-network; integrations/outbox; Admin/Staff operations; Customer Portal.

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

## 2026-09-28 — Customer delivery addresses
- Customer Portal requires a real saved delivery-address capability: create, read, update, delete and one optional default address per customer.
- Address records are customer-owned Commerce data, tenant-scoped and auditable. The UI may not fabricate addresses or imply persistence when offline.
- Checkout/order binding is deliberately outside this requirement until an explicit transactional shipping-address contract exists; saving an address must not mutate an existing order or invoice implicitly.

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


## 2026-09-28 — Customer Portal Home surface

- Customer Portal Home / الرئيسية is a first-class surface distinct from Catalog.
- Home is a derived operational overview of authorized customer context, current cart, order history, connection state and existing navigation actions.
- Home introduces no new transactional authority and does not duplicate Catalog, Orders, Finance or Account persistence.
- The canonical shopping surface remains Catalog; Home links to it through the existing customer contract.
