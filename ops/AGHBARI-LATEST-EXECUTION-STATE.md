# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `52c3ce9a52600e056ecfb6a6f847326693123cfd`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Main contains the restored offline queue regression coverage, canonical 10,000 quantity ceilings, customer offline remote-load protection, guarded SECURITY DEFINER application contracts, and CI path-scoping/DB-only startup optimizations.
- Customer Portal finance document workspace is prepared on PR #126: existing RLS-backed invoices, invoice items and payments, with read-only UI and focused tests.
- Admin finance navigation surfaces are prepared on PR #127 and map statements/invoices/payments/expenses to the existing finance workspace using the existing `finance.view` permission.
- Purchase/receipt idempotency normalization is prepared on PR #125: source migration 200→128, pgTAP contract, and fixture-based behavioral proof for 128 accepted / 129 rejected with no 129 side effects.
- Live Supabase remains unchanged for the pending purchase/receipt migration; live create/receive idempotency remains 16..200.
- Live quick-order idempotency remains 16..200 while its source migration is already prepared at 16..128.
- Security advisor still reports 62 authenticated SECURITY DEFINER warnings plus the leaked-password-protection warning; five high-impact RPC contracts were proven guarded 15/15 by read-only live checks.
- Vercel remains blocked by the free-plan build-rate-limit check; no unchanged retries.

## Exact proof status
- Source: VERIFIED at exact HEAD `52c3ce9a52600e056ecfb6a6f847326693123cfd`.
- Live security application contracts: PROVEN 15/15.
- Live customer finance read boundary: PROVEN 6/6.
- PR #125 purchase/receipt 128 behavior: IMPLEMENTED, exact-SHA runtime proof queued/not completed.
- PR #126 customer finance UI: IMPLEMENTED, exact-SHA CI/browser proof queued/not completed.
- PR #127 admin finance navigation: IMPLEMENTED, exact-SHA CI/browser proof queued/not completed.
- Hosted exact-current-SHA runtime: NOT_PROVEN.
- Certification: NOT CLAIMED.

## ACTIVE BATCHES
- #125 — purchase/receipt idempotency 128 boundary.
- #126 — customer finance document workspace.
- #127 — admin finance navigation surfaces.

## NEXT EXECUTABLE ACTION
Process the first non-queued exact-SHA result on PR #125. If migration proof passes, merge the core batch; if it fails, fix the exact failing step only. Then process #126/#127 without transferring evidence.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not apply pending migrations to production. Do not reopen the proven security contract set. Do not retry unchanged Vercel. Do not recreate duplicate UI screens or memory files.
