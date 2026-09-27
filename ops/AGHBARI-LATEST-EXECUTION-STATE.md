# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Source HEAD snapshot for this checkpoint: `c94ed49fa6d367b5bf8bcb36882078d234bea9d4`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Main now contains the customer finance document workspace, admin finance navigation, dynamic admin order deep-link routing, Recovery Center safe-replay flow, and the controlled purchase/receipt 16..128 migration source.
- Recovery Center is available in Staff/Admin and Customer account contexts for offline cart operations.
- Purchase/receipt Production RPCs remain on the legacy 16..200 contract until the controlled migration release gate is passed.
- Actual Git HEAD must always be read from `refs/heads/main`; this file is a checkpoint snapshot, not an authority over Git.

## Exact proof status
- Source implementation: VERIFIED at checkpoint source HEAD `c94ed49fa6d367b5bf8bcb36882078d234bea9d4`.
- Purchase/receipt migration source is present on main; Production migration is NOT_APPLIED.
- Recovery queue logic has focused source/tests; exact current-SHA CI/browser proof remains pending until workflows complete.
- Certification: NOT_PROVEN / NOT CLAIMED.
- Production: HOLD / NO TOUCH.

## OPEN GAPS
- Exact-SHA proof for the purchase/receipt 16..128 migration: migration, concurrency, negative/Test-the-Test and affected application tests.
- Exact current-SHA browser/runtime proof.
- Dedicated non-production Supabase staging environment for destructive/RLS/browser certification remains a blocker.
- 84-reference visual coverage is documented by pack rules but full pack-by-pack implementation/proof is not yet certified.

## NEXT EXECUTABLE ACTION
Read actual `main` HEAD, inspect the newest affected CI/proof results for purchase/receipt and Recovery Center, fix the first material failure only, then close the next highest-value unproven UI/core gap without touching proven work.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate Production directly. Do not retry unchanged Vercel rate-limit/protection paths. Do not recreate duplicate memory systems or re-open closed customer routing, finance workspace, admin finance navigation, deep-link, quick-order or security-contract work.
