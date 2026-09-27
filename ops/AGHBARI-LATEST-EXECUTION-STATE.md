# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `226f4403f565981ed40ecb81293d34830335c6b4`
Functional baseline: `52c3ce9a52600e056ecfb6a6f847326693123cfd`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Main functional baseline remains unchanged from `52c3ce9a52600e056ecfb6a6f847326693123cfd`.
- Two accidental off-branch migration/proof files were reverted from main; the controlled purchase/receipt migration remains only on execution branch `execution/purchase-receipt-idempotency-128-20260927`.
- Customer routing/pricing/reorder/quantity/offline hardening, order-template source migration and security contract suite remain on main.
- Live production quick-order and order-template migrations remain intentionally unapplied.

## Exact proof status
- Main source: VERIFIED at exact HEAD `226f4403f565981ed40ecb81293d34830335c6b4`.
- Live security read-only proof: 15/15 current conditions true.
- Purchase/receipt live drift: VERIFIED read-only — both production RPCs still use the legacy 16..200 idempotency bound; anon EXECUTE remains false.
- No current main certification claim.

## OPEN GAPS
- PR #128 exact-SHA proof for controlled purchase/receipt 16..128 migration.
- Remaining controlled quick-order/order-template production migrations and final runtime/browser evidence.

## NEXT EXECUTABLE ACTION
Complete PR #128 exact-SHA migration/concurrency/Test-the-Test/application proof. If green, keep the migration on the controlled branch until the release gate authorizes production application.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate production directly. Do not retry unchanged Vercel build-rate-limit/protection. Do not reopen proven customer routing, quick-order, order-template or security-contract work.
