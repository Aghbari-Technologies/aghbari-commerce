# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `82cb790c82c0125251008ac2dd915be025613232`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Active implementation is at exact HEAD `82cb790c82c0125251008ac2dd915be025613232` on `main`.
- Customer pricing preserves authorized server values and currency.
- Customer reorder from detail and list entry points resolves authorized products and performs one atomic cart merge.
- Quick-order lookup uses the account's active warehouse and the UI validates quantities against the 10,000 server line ceiling.
- Source migration/test are ready to normalize quick-order idempotency to 16–128; production remains unchanged under HOLD.

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
Inspect exact-SHA Actions for `82cb790c82c0125251008ac2dd915be025613232`; resolve failures immediately. Then close the remaining UI/reference/core/security gaps without reopening proven work.

## DO NOT REPEAT
Do not rebuild closed/proven work; do not transfer evidence between SHAs; do not retry the unchanged Vercel protection path; do not create duplicate reference packs or memory systems.
