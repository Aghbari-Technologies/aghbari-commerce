# 🔴 AGHBARI — CANONICAL ARCHITECTURE, DATA & DOMAIN

**Authority:** Architecture boundaries, domain ownership, data model, invariants and technology decisions.

## System role
Aghbari is the operational system of record. Prefer modular domain boundaries with PostgreSQL as transactional truth, explicit service contracts and asynchronous side-effect processing.

## Bounded contexts
Identity & Access; Customer Management; Catalog; Pricing; Inventory; Sales/Orders; Purchasing; Cash & Operational Finance; Promotions; Notifications; Import/Export; Integration Hub; Audit/Compliance; Media; Platform Operations.

## Ownership
Every business fact has one canonical owner. Analytics, reports, caches and export datasets cannot become a competing source of truth.

## Core invariants
Tenant isolation; server-authoritative pricing; atomic inventory mutations; explicit order state machine; idempotent commands; safe cart behavior; auditable finance; validated/staged imports; durable outbox; deterministic conflict handling; no silent integrity or authorization bypass.

## Re-engineering rule
Historical implementation choices are evidence, not commands. Optimize for security, reliability, maintainability, performance and cost.

## Canonical source merge register
The consolidation manifest lists the architecture/data source set that must be fully integrated here before retirement.

## 2026-09-25 — Executable UI structure and route authority
- src/structure/admin-structure.ts is the code-level information-architecture manifest for Admin/Staff groups, paths, permissions, actions and status (live, boundary, contract-gap).
- src/structure/customer-structure.ts is the code-level Customer Portal capability manifest for catalog, search, product detail, cart, checkout, orders, templates, quick order, account, notifications, invitations, offline recovery and finance.
- src/structure/role-matrix.ts centralizes the current staff-role permission visibility contract for the UI. Server/database authorization remains authoritative.
- vercel.json now rewrites application paths to index.html, allowing the SPA to resolve registered admin deep links without introducing a second routing source of truth.
- The legacy v2.0 route list is therefore an input to reconciliation, not permission to invent unsupported database contracts.

## 2026-09-25 — Migration lineage integrity
- A live schema object is not considered canonical merely because it exists in PostgreSQL; remote schema changes must be represented in the repository migration lineage.
- The barcode-aware catalog RPC is now recorded in the live migration history as canonicalize_barcode_catalog_rpc_lineage, while the repository retains the equivalent canonical migration SQL.
- Future drift checks must compare both the live function contract and migration history, not only object existence.


## 2026-09-27 — Reference assets and resource-efficient implementation

- `docs/ui-reference/` is documentation/reference data, not runtime data.
- Reference assets must not be duplicated into application bundles or parallel asset directories.
- UI visual fidelity must reuse existing domain/service/component boundaries; visual work must not introduce a second source of truth.
- Generated build/test/deployment outputs are disposable artifacts and remain outside the tracked source tree.
- When a UI reference implies unsupported business behavior, architecture authority remains with the canonical Commerce contract; do not introduce parallel AI/BI/Onyx/legacy transaction models.

## 2026-09-27 — Closure acceleration and requirement ownership

- Parallel UI implementation must reuse existing domain/service contracts; visual work is never a reason to create a second source of transactional truth.
- Newly discovered requirements are routed to their canonical bounded context and owner before implementation.
- UI reference assets remain documentation/reference data and must never enter runtime bundles merely to simplify visual matching.
- Expensive or unbounded local artifacts, caches, queues and generated outputs are non-authoritative and must remain bounded/disposable.

## 2026-09-27 — Atomic bulk order transition contract

- Staff bulk order status changes are a server-side transactional capability, not a client-side loop.
- `bulk_transition_orders(p_idempotency_key, p_order_ids, p_to_status)` accepts 1–100 unique order IDs, enforces organization isolation and role-specific transition authorization, and revalidates every selected order before mutation.
- Identical idempotency keys are serialized with an advisory transaction lock and payload-bound to the canonical order-ID set plus target status.
- Completed operations replay stored per-order results without repeating inventory, audit, history or outbox mutations.
- Cancellation prevalidates required inventory balances and acquires inventory locks in stable warehouse/product order before applying any mutation.
- Result records are kept in a non-client-readable RLS-protected table; authenticated clients execute only through the RPC.

## 2026-09-27 — Portal appearance contract
- `client_ui_settings.config` remains the persisted configuration boundary for Customer Portal presentation settings.
- `accentColor` accepts only six-digit hexadecimal colors and safely falls back to the canonical brand accent on malformed data.
- `compactMode` controls presentation density only; it cannot change pricing, stock, order or authorization semantics.

## 2026-09-27 — Active runtime cache scope
- `AppV3Fixed` is the active browser entrypoint and owns Customer Portal runtime behavior.
- Catalog cache identity is `organizationId:customerId:warehouseId:userId`; missing segments are omitted and an empty overall scope disables caching.
- This scope is a presentation/cache boundary only and does not replace tenant enforcement in Supabase/RLS.

## 2026-09-28 — Customer address domain contract
- public.customer_addresses is the canonical saved-delivery-address table. It stores organization/customer ownership plus recipient/contact/location fields and is_default.
- customer_addresses_one_default_idx enforces at most one default address per customer at database level. Address commands serialize per customer with an advisory transaction lock before changing the default flag.
- create_customer_address, update_customer_address and delete_customer_address derive tenant/customer context from authenticated server state; callers do not provide organization/customer identifiers.
- Address mutations are audited as customer_address.create, customer_address.update and customer_address.delete. No address table becomes an alternate order/invoice source of truth.

## 2026-09-28 — Supplier / warehouse update commands
- update_supplier and update_warehouse are canonical transactional commands; they derive organization from the authenticated profile and never accept caller-supplied organization identifiers.
- Both commands lock the target row, validate ownership, require owner/admin role, update updated_at, and emit canonical supplier.update / warehouse.update audit events.
- Warehouse branch reassignment is accepted only for an active branch inside the same organization.
