# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Source HEAD snapshot for this checkpoint: `60cea00bafd1ff82dd982f30aeaa35e97fea45f4`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Main now includes the customer finance document workspace, admin finance navigation, dynamic admin order deep-link routing, actionable offline Recovery Center, controlled purchase/receipt idempotency migration source, and atomic permission-aware bulk order transitions.
- Purchase/receipt production RPCs are still legacy 16..200 until the controlled migration release gate is passed.
- Recovery Center and bulk actions remain server-bound; UI cannot bypass authorization or transaction invariants.
- Actual Git HEAD is authoritative; this file is a checkpoint snapshot and must not override the live ref.

## Exact proof status
- Source implementation: VERIFIED at checkpoint source HEAD `60cea00bafd1ff82dd982f30aeaa35e97fea45f4`.
- Purchase/receipt migration source: present in main; Production NOT_APPLIED.
- Bulk order migration/source/tests: present in main; exact current-SHA migration/concurrency/security/browser proof is still pending.
- Recovery Center source/tests: present in main; exact current-SHA browser/runtime proof is pending.
- Certification: NOT_PROVEN / NOT CLAIMED.
- Production: HOLD / NO TOUCH.

## OPEN GAPS
- Exact-SHA proof for purchase/receipt 16..128 migration.
- Exact-SHA proof for bulk order transaction/concurrency/negative paths.
- Exact current-main browser/runtime proof.
- Dedicated non-production Supabase staging environment remains unavailable for full certification.
- 84-reference screen-pack implementation/proof remains incomplete; current index contains coverage rules but not a certified pack-by-pack proof set.

## NEXT EXECUTABLE ACTION
Read the actual `main` HEAD, inspect the newest affected migration/concurrency/Test-the-Test/security/browser runs, fix the first material failure once, then advance the next independent UI/core gap without touching proven work.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate Production directly. Do not retry unchanged Vercel rate-limit/protection. Do not recreate duplicate memory systems or reopen closed customer finance, admin finance navigation, dynamic order deep-link, recovery-center or prior security-contract work.
