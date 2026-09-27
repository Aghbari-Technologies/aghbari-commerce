# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `fc20773575e330b03ff83e5cb13ca0b2cb505ef9`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Active implementation is at exact HEAD `fc20773575e330b03ff83e5cb13ca0b2cb505ef9` on `main`.
- Customer catalog preserves and consistently displays server-authorized price/currency.
- Customer reorder from detail/list flows resolves authorized items outside the current catalog page and performs a single atomic cart merge.
- Quick-order lookup uses the account's active warehouse.
- Quick-order source migration/test now defines the canonical 16–128 idempotency contract; production remains unchanged under HOLD.

## Exact proof status
- Implementation: VERIFIED by exact repository content at current HEAD.
- Purchase idempotency 128 fixture: NOT_PROVEN by CI/runtime until an exact-SHA proof completes.
- New UI polish: NOT_PROVEN by browser/visual runtime until exact current-SHA evidence completes.
- Current GitHub status: Vercel check `pending`; this is not certification evidence.
- Prior exact-SHA evidence remains historical and is not transferred to the current HEAD.

## Open execution frontier
UI: 84-reference coverage → unique screen packs → remaining unclosed screens/states/actions → browser/visual proof.
CORE: purchase/receipt idempotency 200 → 128 reconciliation → exact migration/runtime/concurrency/Test-the-Test proof → remaining material domain gaps.
SECURITY: per-RPC SECURITY DEFINER classification while preserving required tenant/RLS/RBAC/privilege boundaries.
QA: run only affected/new exact-SHA proofs.
DEPLOY: free exact-source hosted runtime proof; no unchanged Vercel retries.
DOCS: semantic consolidation only when it closes an active requirement/proof gap.

## NEXT EXECUTABLE ACTION
Inspect the newest exact-SHA GitHub Actions for `fc20773575e330b03ff83e5cb13ca0b2cb505ef9`; resolve any failure immediately, then continue the next independent UI/core/security gap.

## DO NOT REPEAT
Do not rebuild closed/proven work; do not transfer evidence between SHAs; do not retry the unchanged Vercel protection path; do not create duplicate reference packs or memory systems.
