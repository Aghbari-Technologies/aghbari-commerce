# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: `bbf595ee7657add03a7696f28a528d6e9b2cf3a9`
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Active browser entrypoint is `src/main.tsx -> AppV3Fixed`.
- Main contains customer finance documents, admin finance navigation, dynamic admin order deep-link routing, actionable Recovery Center, atomic permission-aware bulk order transitions, controlled purchase/receipt 16..128 migration source, scoped offline catalog cache/reconnect sync, operational trust provenance, persisted portal appearance settings, and explicit import reconciliation reporting.
- The purchase/receipt migration source is merged into main but remains unapplied to Production; live RPCs are still at the legacy 16..200 contract.
- Bulk-order migration source is merged but not applied to Production.
- 84 PNG reference blobs are 84/84 unique; visual-equivalence and full screen-pack proof remain open.
- Production has not been mutated by these execution changes.

## Exact proof status
- Source implementation: VERIFIED at exact main HEAD `bbf595ee7657add03a7696f28a528d6e9b2cf3a9`.
- Active runtime wiring: VERIFIED — `main.tsx` imports `AppV3Fixed`; active runtime includes cache scope, trust surface and persisted theme.
- Live purchase/receipt drift: VERIFIED read-only; both still expose legacy 200; anon EXECUTE remains false.
- Live bulk-transition RPC: NOT_PRESENT; repository migration is source-only.
- Current-main checks: QUEUED/IN_PROGRESS; combined status remains failure due the known external deployment/status path. No final PASS claimed.
- Browser/hosted exact-source proof: NOT_PROVEN.
- Supabase staging for destructive/certification workflows: BLOCKED/unavailable.
- Certification: NOT_PROVEN / NOT CLAIMED.
- Production: HOLD / NO TOUCH.

## OPEN GAPS
- Exact-SHA migration/concurrency/negative/Test-the-Test proof for purchase/receipt and bulk-order changes.
- Controlled production purchase/receipt migration after release gates only.
- Exact current-main browser/runtime/visual proof.
- Full 84-reference screen-pack equivalence and proof matrix.
- Remaining uncovered canonical product/quality gaps.

## NEXT EXECUTABLE ACTION
Inspect the newest exact-main check runs and logs; fix the first material failure once. In parallel, continue the next independent unproven reference-pack/core gap without touching closed implementation.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate Production directly. Do not retry unchanged Vercel rate-limit/protection. Do not reopen closed finance, deep-link, recovery, bulk-order, cache-isolation, trust/theme, or import-reconciliation implementation work.
