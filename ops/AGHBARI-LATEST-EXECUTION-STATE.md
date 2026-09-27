# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `62fc9c88acb73ac435ff0a18605f402304959b64`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Customer-bound `viewer` accounts route to the B2B customer portal; unbound viewer remains on the admin/staff surface.
- Customer catalog preserves server-authorized price and currency; off-page saved-cart/template fallbacks preserve both.
- Customer reorder uses current authorized catalog, active warehouse context, cart-stock preflight, one atomic quick-order merge and duplicate-click mutex.
- Quick-order, Excel, order, cart and offline queue quantity ceilings align to the central 10,000 line ceiling.
- Quick-order source migration/test is ready to normalize server idempotency to 16–128; live production RPC remains 16–200 until deliberate release migration.
- Order-template source/client/DB boundary is prepared to align to 10,000 without rewriting historical oversized rows; legacy oversized apply fails closed in the migration source.
- Customer offline remote loads are guarded by signed-in + customer identity + online + Supabase availability.
- Application SECURITY DEFINER contract suite 034 is present on main.
- Live read-only security proof: 15/15 corresponding conditions are true across five high-impact application RPCs.
- Vercel free-plan build-rate-limit remains a deployment blocker; no unchanged retry is being made.
- Production remains untouched.

## Exact proof status
- Source: VERIFIED at exact HEAD `62fc9c88acb73ac435ff0a18605f402304959b64`.
- Application quality for the previous exact source SHA `627e4bba29b2b64f7faabf2fe43091f1b391377a`: SUCCESS (typecheck, 235 tests, lint, production build, release audit). This is historical and is not transferred to `62fc9c88acb73ac435ff0a18605f402304959b64`.
- Security audit / G1 / Order Workflow / Browser Contract results for `627e4bba29b2b64f7faabf2fe43091f1b391377a`: SUCCESS, historical only.
- Latest `62fc9c88acb73ac435ff0a18605f402304959b64` CI: new workflow runs are queued; no PASS claimed until they complete.
- Live security read-only contract: VERIFIED 15/15.
- Live Supabase: ACTIVE_HEALTHY; pending quick-order/template migrations not applied.

## Open execution frontier
UI: unique reference packs → remaining visual/state/action gaps → exact current-SHA browser runtime.
CORE: release pending quick-order 128 migration + template 10k migration → 128/129 and template negative proofs → concurrency/Test-the-Test.
SECURITY: classify remaining SECURITY DEFINER advisor findings individually; preserve required tenant/RLS/RBAC/search_path boundaries.
QA: exact current-SHA workflows only.
DEPLOY: free exact-source runtime proof; avoid unchanged Vercel rate-limit path.
DOCS: compact canonical updates only.

## NEXT EXECUTABLE ACTION
Wait only on already-triggered exact-SHA workflows for `62fc9c88acb73ac435ff0a18605f402304959b64`; resolve failures immediately, then continue the next independent material UI/core/security gap.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not apply pending migrations to production. Do not retry unchanged Vercel build-rate-limit. Do not rebuild already-complete customer/admin surfaces without a new requirement or evidence invalidation.
