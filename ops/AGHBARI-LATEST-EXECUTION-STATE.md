# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Branch: `main`
Current Git HEAD: READ LIVE FROM `refs/heads/main` at every boot; this file intentionally does not cache a mutable SHA.
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current reality
- Active browser entrypoint is `src/main.tsx -> AppV3Fixed`.
- Main contains customer finance documents, admin finance navigation, dynamic admin order deep-link routing, actionable Recovery Center, atomic permission-aware bulk order transitions, controlled purchase/receipt 16..128 migration source, scoped offline catalog cache/reconnect sync, operational trust provenance, persisted portal appearance settings, and explicit import reconciliation reporting.
- The purchase/receipt migration source is merged into main but remains unapplied to Production; live RPCs are still at the legacy 16..200 contract.
- Bulk-order migration source is merged but not applied to Production.
- 84 PNG reference blobs are 84/84 unique; visual-equivalence and full screen-pack proof remain open.
- Customer delivery-address capability is implemented in source (domain policy, service, UI, migration, and contract test); the migration is source-controlled and must still pass migration/runtime proof before it can be treated as live persistence.
- Production has not been mutated by these execution changes.

## Exact proof status
- Source implementation: VERIFIED in the live repository; re-read `refs/heads/main` for the exact current SHA.
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
Read the live `refs/heads/main`, inspect newest check runs/logs, fix the first material failure once; then continue the next independent uncovered reference-pack/core gap. Keep address migration source-only until exact migration/runtime proof.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate Production directly. Do not retry unchanged Vercel rate-limit/protection. Do not reopen closed finance, deep-link, recovery, bulk-order, cache-isolation, trust/theme, or import-reconciliation implementation work.


## 2026-09-28 — Customer delivery-address closure
- Customer address domain policy, typed service, live account UI, RLS/privilege migration and contract test are present on main.
- Required UI states include loading, empty, action error, success, offline/disabled, edit and destructive confirmation.
- Address migration is NOT_PROVEN in a live environment until the exact migration workflow completes; no production mutation performed.
