# Aghbari Commerce — Durable Project Memory

## Canonical execution rules
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Product: الأغبري / Aghbari Commerce
- Main branch is the current source-of-truth for implementation.
- Exact-SHA evidence never transfers to another SHA.
- Production remains `HOLD / NO TOUCH` until implementation + security + test + runtime/browser + exact candidate proof are complete.
- Do not retry unchanged Vercel free-plan build-rate-limit path.
- Preserve repository space: compact checkpoints, deduplicated UI reference packs, no duplicate logs.

## Current live branch state
- Branch: `main`
- Mutable HEAD is never cached here; read `refs/heads/main` at boot and record exact SHA only in the execution ledger/checkpoint.

## Current implemented closure
- Customer-bound `viewer` routing is separated from staff/admin surfaces; boot waits for account identity before releasing the app surface.
- Customer pricing preserves authorized server price/currency, including off-page saved-cart/template fallbacks.
- Customer reorder resolves authorized catalog items outside the visible page, uses active warehouse context, preflights existing-cart quantities, submits one atomic quick-order merge, and has duplicate-click mutex protection.
- Quick-order, Excel, order, cart and offline queue quantity ceilings use the central 10,000 line ceiling.
- Quick-order idempotency source contract is 16–128; the live production RPC remains 16–200 until deliberate migration application.
- Order-template source/client/DB boundary is prepared for 10,000 without rewriting historical oversized rows; legacy oversized apply fails closed in the migration source.
- Customer offline remote-load guard blocks remote reads unless authenticated, customer-bound, online and Supabase-ready.
- Application security contract suite 034 is on main with 15 assertions.
- Live read-only security verification for those 15 conditions is currently 15/15 true.

## CI/runtime execution improvements
- Same-branch CI concurrency was tightened to cancel stale proof runs for quality, migration, Test-the-Test, concurrency, and local browser workflows.
- Test-the-Test now uses `supabase db start` for a DB-only stack.
- Migration Proof and Concurrency Proof now use Postgres-only local startup because their scripts use direct psql/database operations.
- These changes reduce stale-run accumulation and avoid unnecessary Supabase service startup failures.

## Open blockers / environment drift
- Live `apply_quick_order` still uses 16–200 until the prepared migration is applied in an approved release window.
- Live order-template quantity behavior remains pre-migration until the prepared migration is applied.
- Vercel hosted UI is SSO-protected in this connection and free-plan build-rate-limit has blocked repeated builds; no unchanged retry.
- Some local heavy proofs have historically failed before assertions at Supabase startup; DB-only workflow changes are now in main to address this.

## Evidence status
- Prior exact SHA `627e4bba29b2b64f7faabf2fe43091f1b391377a`: application-quality, Security, G1, Order Workflow, Browser Contract and Bootstrap had successful exact-SHA results; these are historical and not transferred to `524d468837f0b613ab2eb17c659a3c7a8cd4227b`.
- Live security read-only proof: 15/15 current conditions true.
- Current SHA `524d468837f0b613ab2eb17c659a3c7a8cd4227b`: CI queued/pending after the latest CI workflow changes; no current-SHA PASS claimed yet.

## 2026-09-27 — Recovery / release execution contract
- Recovery Center is an in-scope operational surface for safe offline cart operations.
- Manual replay is permitted only for queued/retrying cart operations and preserves attempt history.
- Conflicted or terminal offline operations remain fail-closed and require review/removal; UI never bypasses server authorization.
- Purchase/receipt idempotency migration is source-controlled and remains unapplied to Production until exact migration, concurrency, negative and Test-the-Test evidence pass.
- Free-plan Vercel deployment rate-limit/protection remains a known unchanged blocker; do not spend quota by repeating the same path.

## 2026-09-27 — Bulk order operations contract
- Bulk order status transitions are a server-side transactional capability, not a client-side mutation loop.
- A bulk request is limited to 1–100 unique orders, validates organization and role/state authorization for every selected order, and uses one idempotency key bound to the canonical selected-order set plus target status.
- Cancellation batches prevalidate inventory balances and lock impacted balances in stable order before mutation; results are stored for safe idempotent replay.
- The UI must provide selection, common-transition validation and a precise preview before committing the server mutation; server authorization remains authoritative.

## 2026-09-27 — Low-bandwidth contract
- Server-fetched catalog snapshots may be cached locally only as bounded, TTL-limited, validated read-only data.
- Offline cached stock/price values are informational and never become transaction authority.
- On reconnect, only safe cart operations are revalidated and synchronized; conflicts/terminal failures remain visible in Recovery Center.

## 2026-09-27 — Active runtime and cache isolation
- `src/main.tsx` boots `AppV3Fixed`; active-runtime changes must be implemented there, not only in legacy `App.tsx`.
- Offline catalog snapshots are scoped by organization, customer, warehouse and authenticated user; unscoped cache records are rejected.
- Customer Portal now surfaces connection/data provenance and persisted presentation settings without changing transactional authority.
- Import reconciliation reports are derived from the existing server-generated import job/correlation identity and commit result; they are reporting views, not a second source of truth.


## 2026-09-28 — Customer delivery-address contract
- Saved delivery addresses are a canonical Customer Portal capability: CRUD plus one default address per customer, tenant/customer scoped, audited, and server-authorized through dedicated RPCs.
- Address writes fail closed while offline; checkout/order binding is deliberately separate until an explicit shipping-address transactional contract is approved.


## 2026-09-28 — Staff order detail contract
- Admin/Staff order details use the real `orders` + `order_items` + `products` read contract through `getStaffOrderDetail`; the UI must not substitute fabricated line data.
- The detail service validates UUIDs, monetary fields and line totals and rejects a subtotal that does not equal the sum of returned line totals within the repository tolerance.
- The reusable operational detail drawer supports rich content and an explicit retry footer without adding mutation authority.


## 2026-09-28 — Staff reorder/template scope boundary
- Reorder and order templates are implemented for Customer Portal ownership. Do not fabricate a Staff management surface: current template storage/RPCs derive customer context and are not a Staff-authority contract.
- A future Staff contract must define permission, tenant/customer visibility, read model, mutation semantics and audit before the boundary is converted to a live surface.

## 2026-09-28 — Supplier / warehouse administration contract
- Supplier and warehouse edit surfaces are now in Commerce scope and implemented through authenticated server-side update RPCs.
- `update_supplier` and `update_warehouse` derive tenant context server-side, require owner/admin authorization, validate target ownership/active branch, and emit audit events.
- Unsupported AI/BI/Onyx/Developer-AI edit surfaces remain explicit UI boundaries; they are not transactional Commerce features.

## 2026-09-28 — Customer self profile
- Customer Portal self-service profile now permits only display name and phone updates through update_customer_self_profile.
- Email, pricing tier, active state and tenant ownership remain protected/read-only. The command rejects staff contexts and is audited.

## 2026-09-28 — Durable UI reference coverage contract

- The canonical visual source remains `docs/ui-reference/UI-REFERENCE-ASSET-INDEX.md`.
- `src/structure/ui-reference-packs.ts` is the compact code registry for exactly 84 current reference PNGs grouped into 8 implementation packs.
- `src/UiReferenceCoveragePanel.tsx` provides a real Admin QA/coverage workspace; it is not a second transactional data source.
- `src/structure/ui-reference-packs.test.ts` enforces exact 84-file registry parity and uniqueness.
- `src/brand-identity.test.ts` guards runtime source against historical product-identity residue and intentionally excludes test/spec sources.
- Classification/mapping is not browser proof; final P0 visual closure still requires exact-SHA runtime/browser evidence bound to viewport/state.

## 2026-09-28 — Customer mobile navigation and Admin boundary integrity

- The active Customer Portal mobile navigation now covers all six logical sections without crowding the primary dock: Catalog, Orders, Cart and Account are primary; Templates, Notifications and Finance are available in the compact More sheet.
- `src/customer-mobile-more.css` contains the responsive secondary navigation sheet and reduced-motion-safe behavior.
- `src/customer-mobile-navigation.test.ts` guards section reachability and the More-sheet mount.
- `src/admin-boundary-navigation.test.ts` guards every safe Boundary alternative against missing Admin anchors.
- These are source contracts, not browser certification evidence; exact-SHA runtime/browser proof remains a separate gate.

## 2026-09-28 — Current UI/core closure additions

- Mobile Portal now has a compact More sheet for Templates, Notifications and Finance, preserving a five-item primary dock and full six-section reachability.
- Boundary safe alternatives are guarded against missing Admin DOM targets by `src/admin-boundary-navigation.test.ts`.
- Customer Portal six-section coverage is guarded by `src/customer-portal-section-coverage.test.ts`.
- Customer order-search copy now matches its actual queryable fields.
- Purchasing input boundary test is included in the bounded quality workflow; canonical purchase/receipt 128-bound migration remains in source and not applied to Production.

## 2026-09-28 — Execution wave closure additions

- Current exact source state includes 84-reference UI registry + coverage workspace, full mobile portal section navigation, Boundary safe-target contract, six-section portal coverage contract, customer order-search copy correction, and purchasing migration source guard.
- Compound source verification on current main: 84 unique reference entries; 27 Admin anchors; 13 Boundary safe alternatives all resolve to live anchors.
- Production migration state remains intentionally old: migration `20260927041500` is present in source but not in live migration history; no production mutation was performed.
- Never interpret source-level verification as browser certification or production migration proof.
