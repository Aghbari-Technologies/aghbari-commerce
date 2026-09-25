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
