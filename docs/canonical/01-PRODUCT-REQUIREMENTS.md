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
