# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `524d468837f0b613ab2eb17c659a3c7a8cd4227b`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Customer portal routing, pricing/currency, atomic reorder, warehouse binding, cart-stock preflight, duplicate-submit lock and offline remote-load guard are implemented on main.
- Quick-order/Excel/order/cart/offline quantity ceiling is 10,000.
- Quick-order source migration/test and order-template source migration/test are prepared but not applied to production.
- SECURITY DEFINER application contract suite 034 is present and the corresponding 15-condition live read-only check is 15/15 true.
- CI proof workflows were optimized to collapse stale same-branch runs and DB-only checks now use Postgres-only startup where API/Storage services are unnecessary.
- Vercel remains a hosted gate, not a source-of-truth proof path.

## Exact proof status
- Current source: VERIFIED at exact HEAD `524d468837f0b613ab2eb17c659a3c7a8cd4227b`.
- Current CI: queued/pending; no PASS claimed until this exact SHA completes its relevant workflows.
- Live security contract: VERIFIED 15/15 read-only conditions.
- Production: HOLD / NO TOUCH.

## NEXT EXECUTABLE ACTION
Inspect exact-SHA CI for `524d468837f0b613ab2eb17c659a3c7a8cd4227b`; resolve any real failure immediately. Then close remaining pending migrations/runtime/browser evidence without reopening proven paths.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not apply pending migrations to production. Do not retry unchanged Vercel build-rate-limit. Do not duplicate UI reference packs.
