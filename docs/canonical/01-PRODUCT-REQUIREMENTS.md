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

The current `docs/ui-reference/` pack contains 84 PNG reference screens. They are treated as P0 visual sources by default. Where a screenshot contains a capability that lacks a canonical Commerce business/data contract, the visual pattern may be reused but the unsupported transaction must remain an explicit boundary.

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


## 2026-09-28 — Customer Portal Home surface
- The Customer Portal exposes **Home / الرئيسية** as an explicit first-class surface, separate from the catalog.
- Home is a derived operational overview only: it summarizes authorized account context, order history, cart state, connection state and existing navigation actions.
- Home does not introduce new transactional authority or duplicate catalog, order, finance or account persistence.
- The catalog remains the authoritative customer shopping surface; Home links into it using the existing customer contract.
