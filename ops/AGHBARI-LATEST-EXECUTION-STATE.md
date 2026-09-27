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

## LATEST CLOSURE BATCH — 2026-09-28
- Real Staff/Order detail read contract added to `src/services/staffOrders.ts` with UUID, money, line-total and subtotal reconciliation checks.
- `AdminPanel` now loads the real order detail and shows loading/error/retry plus line-level information inside the reusable detail drawer.
- `RecordDetailDrawer` now supports rich content and an explicit retry/close footer without adding mutation authority.
- Focused negative/positive contract test added at `src/services/staffOrders.detail.test.ts`.
- Bounded GitHub quality workflow added: typecheck + focused detail test + build, canceling stale runs.

## NEXT EXECUTABLE ACTION
Read the live refs/heads/main, inspect the current exact application-quality / G1 Domain Proof / security-audit / Test-the-Test results, fix only the first material failure on that exact SHA, then continue the next unproven 84-reference screen-pack gap. Do not transfer evidence from prior SHAs.

## DO NOT REPEAT
Do not transfer evidence across SHAs. Do not mutate Production directly. Do not retry unchanged Vercel rate-limit/protection. Do not reopen closed finance, deep-link, recovery, bulk-order, cache-isolation, trust/theme, import-reconciliation, or the now-closed Staff order-detail implementation work.


## 2026-09-28 — Customer delivery-address closure
- Customer address domain policy, typed service, live account UI, RLS/privilege migration and contract test are present on main.
- Required UI states include loading, empty, action error, success, offline/disabled, edit and destructive confirmation.
- Address migration is NOT_PROVEN in a live environment until the exact migration workflow completes; no production mutation performed.


## 2026-09-28 — Inventory activity deep-link anchor closure
- Closed the live navigation defect where `#admin-inventory-activity` had no matching `AdminPanel` DOM anchor.
- Added `src/structure/admin-structure.anchor.test.ts` to assert every live Admin structure target resolves to an actual `AdminPanel` id.
- Extended the bounded quality workflow to include the anchor contract test.
- Purchase/receipt live 200-character idempotency bound remains unchanged and is still a controlled migration gate; no production mutation performed.


## 2026-09-28 — Full UI closure wave / current checkpoint
- Current live HEAD: 2361acda811159bfa7f8e0d414c2ebc70c16fe92 (must be re-read at every resume; not cached as mutable truth).
- Implemented: Customer Account workspace (overview/profile/company/addresses/settings); canonical customer-address source contract (domain/service/UI/migration/RLS/RPC/audit/contract test); executable Stock Count workspace; Admin inventory screen pack for transfers/count/reconciliations; real Staff order-detail surfaces; explicit Admin contract-boundary center; safe boundary links for unsupported warehouse/supplier edits.
- Verified: Admin live-target scan currently resolves all unique DOM targets with zero missing anchors; active customer IA exposes catalog/orders/finance/templates/account/notifications and nested invoice/order/address surfaces.
- Exact current proof: Browser E2E passed on immediately preceding exact SHA a7d41f43152e18d281a72e0720e1a49d070ad71c; this is historical because HEAD is now 2361acda811159bfa7f8e0d414c2ebc70c16fe92. Current exact Quality/G1/Security/Test-the-Test must finish on the current SHA before certification claims.
- Known quality correction: older 741f7c1c quality failure was an unclosed JSX expression in InventoryActivityPanel; fixed at a4cd8b63 and carried forward to current main.
- Production: HOLD / NO TOUCH. Purchase/receipt 16..128 and customer-address migrations remain source-only until exact migration/runtime proof.


## 2026-09-28 — Staff reorder/template boundary
- `src/structure/admin-structure.ts` explicitly represents Staff reorder and order-template surfaces as boundaries, not fake live screens.
- Customer Portal continues to own the real reorder/template workflows and persistence.
- No new Staff permission or mutation contract was invented.

## 2026-09-28 — Supplier / warehouse edit closure
- Current live HEAD must be re-read from refs/heads/main; latest observed during this checkpoint: e002456ab8f40f084047c970ebd1f95381491c35.
- Implemented: audited owner/admin update RPCs for suppliers and warehouses; typed client services; Admin/Staff edit forms for both surfaces; IA status changed from boundary to live; bounded SQL/UI tests.
- Verified: no production mutation; unsupported AI/BI/Onyx/Developer-AI boundaries remain explicit and non-fake.
- Not proven yet on this exact SHA: build/typecheck/runtime/browser/visual and migration application.
- Open gaps: exact current Quality/G1/Security/Test-the-Test results; 16..128 production migration gate; 84-reference screen-pack visual proof.
- Next executable action: inspect exact-current CI results, fix first material failure once, then continue the next independent reference/core gap.


## 2026-09-28 — Customer Home + exact quality recovery checkpoint
- Execution branch: `execution/ui-customer-home-20260928`
- Exact current branch HEAD: `6c47355a2108ec6df16018c638615392ecdfc43c`
- Implemented: Customer Portal Home as a first-class surface separate from Catalog; real Home navigation on desktop/mobile; reused existing source-backed hero/overview/quick-action primitives; focused customer IA coverage test; responsive six-item mobile dock.
- Implemented quality corrections exposed on the exact branch: Admin pagination selection declaration order, Staff order-detail currency contract, anchor test no longer depends on missing Node types, and removal of unused OfflineRecoveryPanel import.
- Exact-SHA proven: application-quality run `36356907360` passed typecheck, 44 test files / 286 tests, lint, production build and release audit; G1 run `36356907318` passed; security-audit run `36356907324` passed; Browser E2E / Exact Deployment run `36356907411` passed its exact-source deployment contract job (not hosted visual/runtime proof).
- In progress at checkpoint: Test-the-Test `36356907328`; Browser E2E / Local Production Artifact `36356907301`; Browser E2E / Fresh Local Supabase `36356907285`.
- Live read-only proof: production `create_purchase_order` and `receive_purchase_order` still expose 16..200; anon EXECUTE false; source migration remains 16..128 and is intentionally unapplied to production.
- Hosted Vercel proof remains BLOCKED by the free-plan deployment-rate-limit path; no unchanged retry and no production mutation.
- Visual completion: Home surface implemented, but full 84-reference screen-pack visual equivalence/proof remains OPEN because the index is only the visual authority and every P0 pack still needs exact visual/runtime evidence.
- Certification: NOT_PROVEN / NOT CLAIMED.
- Production: HOLD / NO TOUCH.

### OPEN GAPS
- Current exact-SHA Test-the-Test and customer/admin local browser runtime proofs.
- Full 84-reference screen-pack mapping/equivalence and exact visual evidence.
- Purchase/receipt 16..128 migration proof + concurrency + 129-negative runtime proof on exact candidate SHA; production application remains gated.
- Hosted exact-source browser proof via a free deployment path; Vercel free-plan rate limit remains the current external blocker.
### NEXT EXECUTABLE ACTION
After current exact-SHA Test-the-Test and local browser runs finish, consume their evidence only on SHA `6c47355a2108ec6df16018c638615392ecdfc43c`; merge PR #147 only if all required checks pass, then re-read the resulting main HEAD and open the next unproven screen-pack/core gap. 
### DO NOT REPEAT
Do not transfer evidence from `c9c797823f6ef6245ebae7c61be5455e2e1244f4` or older SHAs; do not reapply the Vercel rate-limit retry; do not mutate production for the purchase/receipt drift.


## 2026-09-28 — Exact current checkpoint: Home + migration chain repairs
- Execution branch: `execution/ui-customer-home-20260928`
- Exact current HEAD before this checkpoint: `fd22d1b55d97d9ca386fd8f491de1c0cb2f02985`
- Implemented on this branch: Customer Home first-class surface, customer IA contract, responsive Home navigation, Admin quality corrections, finance payment idempotency migration repair, and order-template migration statement repair.
- Root causes fixed:
  - `20260925110000_harden_finance_payment_idempotency.sql`: `record_payment` had a required parameter after parameters with defaults; `p_idempotency_key` now has a SQL default while runtime validation still rejects missing/invalid keys.
  - `20260927010000_normalize_order_template_quantity_bound.sql`: missing statement terminators after `save_order_template` and `apply_order_template` function definitions; both fixed.
- Exact proof currently attached to `fd22d1b55d97d9ca386fd8f491de1c0cb2f02985`: Order Workflow PASS; G1 Domain Proof PASS; Security Audit PASS; Exact Deployment contract PASS. Runtime/browser/migration/concurrency/Test-the-Test remain not yet final at this checkpoint.
- Vercel combined status remains externally blocked by the free-plan build-rate-limit path; no unchanged retry and no production mutation.
- Production purchase/receipt `16..200` drift remains read-only and intentionally unapplied; the prepared source migration remains the release candidate.

### OPEN GAPS
- Current exact-SHA migration proof, concurrency proof, Test-the-Test and local browser runtime proof.
- Full 84-reference screen-pack visual equivalence and browser evidence.
- Controlled production purchase/receipt `200→128` migration after exact migration/concurrency/negative evidence.
- Free exact-source hosted browser proof; existing Netlify site is free but its current ready deploy has no commit_ref/source identity, so it is not used as exact-source proof.

### NEXT EXECUTABLE ACTION
Read the exact new HEAD created by this checkpoint, consume only its own fresh checks, fix the first material runtime/DB/browser failure once, then continue the next uncovered customer/admin screen-pack or core gap.
### DO NOT REPEAT
Do not transfer any proof from `fd22d1b55d97d9ca386fd8f491de1c0cb2f02985` or older SHAs to the next checkpoint SHA. Do not mutate production. Do not retry the blocked Vercel build path unchanged.
