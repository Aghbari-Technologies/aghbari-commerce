# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `627e4bba29b2b64f7faabf2fe43091f1b391377a`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Offline queue regression coverage is present again on main after the 2026-09-27 restore commit.
- Order/idempotency client boundaries continue to align with the canonical 16..128 minimum/maximum contract where already migrated in source.
- Live Supabase purchase/receipt RPCs still validate idempotency keys at 16..200; live migration history does not yet contain the pending 128-bound migration.
- Customer Portal currently has catalog/search/filter/sort/pagination/cart/checkout/orders/reorder/templates/finance/account/notifications/offline primitives; an additional offline remote-load guard is prepared on PR #113 but is not merged into main.

## Exact proof status
- Main source state: VERIFIED at exact HEAD `627e4bba29b2b64f7faabf2fe43091f1b391377a`.
- Live Supabase: VERIFIED ACTIVE_HEALTHY; purchase/receipt drift 200 remains OPEN.
- Security advisor: VERIFIED with 62 authenticated SECURITY DEFINER findings plus leaked-password-protection warning; no blanket revoke applied.
- Purchase/receipt 128 migration: IMPLEMENTED on PR #112, NOT_PROVEN by live runtime/concurrency until migration is deliberately applied/tested in the release workflow.
- Customer offline runtime guard: IMPLEMENTED on PR #113, NOT_PROVEN by exact-SHA CI/browser runtime.
- Hosted runtime: NOT_PROVEN for exact current HEAD; Vercel reports free-plan build-rate-limit failure; Netlify existing site is available but its deployment tool requires source upload/local repo execution.

## Open execution frontier
UI: 84-reference coverage → unique packs → remaining visual/state/action gaps → browser proof.
CORE: purchase/receipt 200 → 128 migration → 128 accept / 129 reject → concurrency → negative/Test-the-Test → exact-SHA evidence.
SECURITY: classify authenticated SECURITY DEFINER functions individually while preserving required tenant/RLS/RBAC/search_path boundaries.
QA: only affected/new exact-SHA proofs.
DEPLOY: free exact-source runtime proof; do not retry unchanged Vercel path.
DOCS: semantic consolidation only.

## ACTIVE BATCHES
- PR #112: `execution/purchase-receipt-idempotency-20260927` — purchase/receipt 128-bound migration + PGTAP contract test.
- PR #113: `execution/ui-offline-runtime-20260927` — customer offline remote-load guard + explicit offline state + unit test.

## NEXT EXECUTABLE ACTION
Use the repository's exact-SHA workflow path to validate PR #112's migration/test when workflow execution becomes available; otherwise continue the next independent UI/security gap without touching closed work.

## DO NOT REPEAT
Do not transfer evidence across SHAs; do not apply pending migrations to production; do not retry unchanged Vercel deployment; do not rebuild existing customer/admin screens that already have real states/actions; do not create duplicate reference packs or memory systems.
