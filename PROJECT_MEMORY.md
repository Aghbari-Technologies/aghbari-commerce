# Aghbari Commerce — Durable Project Memory

## Canonical execution rules
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Product: الأغبري / Aghbari Commerce
- Main branch is the current source-of-truth for implementation.
- Exact-SHA evidence never transfers to another SHA.
- Production remains `HOLD / NO TOUCH` until implementation + security + test + runtime/browser + exact candidate proof are complete.
- Do not retry unchanged Vercel free-plan build-rate-limit path.
- Preserve repository space: compact checkpoints, deduplicated UI reference packs, no duplicate logs.

## Latest exact main HEAD
- SHA: `524d468837f0b613ab2eb17c659a3c7a8cd4227b`
- Branch: `main`
- Production: HOLD / NO TOUCH
- Certification: NOT CLAIMED

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
