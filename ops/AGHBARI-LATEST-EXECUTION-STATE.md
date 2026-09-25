# 🔴 AGHBARI LATEST EXECUTION STATE

**Project:** Aghbari Commerce | الأغبري
**Actual Git HEAD at execution checkpoint:** `c765e87bb08a32f684e3438c00d8ac7f98ca9e52`
**Branch:** `main`
**Production:** HOLD / NO TOUCH
**Certification:** NOT CLAIMED

## Current Reality
- Scope remains Aghbari Commerce only.
- Continued directly from the verified `main` line; no rollback to historical UI commits.
- Two real UI closure improvements were implemented on the current head: notification bulk-read workflow and stricter dynamic customer-control validation.
- No new dependency, fake transaction source, Promotions placeholder, or Report-Advisor/BI authority was introduced.

## UI Changes
- `src/NotificationPanel.tsx`: added bounded bulk marking of currently actionable notifications as read, per-row/bulk busy states, partial-progress handling, disabled pagination/actions during mutation, and explicit reload/error recovery.
- `src/ClientControlPanel.tsx`: normalized numeric controls to safe integers, bounded saved templates to 0–500, rejects inverted order-value bounds, requires at least one payment method when payment-method display is enabled, and reports the validated save state.

## Exact Code Commits
- `3955a9c0a630d910c3af995896cef40a0368f267` — notification bulk-read workflow.
- `c765e87bb08a32f684e3438c00d8ac7f98ca9e52` — dynamic customer-control validation hardening.

## Verification Boundary
- Git ref update to `main` was fast-forwarded to `c765e87bb08a32f684e3438c00d8ac7f98ca9e52`.
- Source-level implementation is confirmed by exact Git objects.
- Fresh exact-SHA CI/build/browser/security evidence has NOT been claimed for `c765e87...`.
- Existing evidence from earlier SHAs is historical and is not transferred.
- Hosted runtime/candidate/production proof remains NOT_PROVEN.

## Known Open Gates
1. Consume fresh exact-SHA application-quality/security/migration/concurrency/domain/Test-the-Test/order-workflow/browser results.
2. Repair any regression found on `c765e87...` and rerun the affected exact-SHA gate.
3. Continue nested contract-backed UI closure where a real backend contract exists; do not fabricate unsupported modules.
4. Continue per-RPC SECURITY DEFINER classification without weakening required business/RLS helper boundaries.
5. Complete semantic reconciliation/reference audit of the 50 historical Markdown sources before retirement.
6. Certification and production promotion remain HOLD / NO TOUCH until exact candidate/runtime evidence is complete.

## CURRENT RESUME POINTER
START FROM EXACT `main` HEAD `c765e87bb08a32f684e3438c00d8ac7f98ca9e52`.

UI FRONT:
- Customer Portal → notifications → bulk-read/reload/error edge verification.
- Admin → Dynamic Client Control → payment-method and order-limit validation states.
- Next contract-backed UI frontier: inspect remaining nested detail/edit/recovery states only where existing services/RPCs provide real persistence.

CORE FRONT:
- Keep finance/purchasing/customer audit-outbox closure intact.
- Consume exact-head CI and runtime results before changing proven core contracts.

VERIFY:
- Exact-SHA application quality.
- Security/RLS/RPC privilege evidence.
- Migration/concurrency/Test-the-Test/domain/order-workflow evidence.
- Browser route → interaction → persistence → refresh/reopen proof.

DO NOT REPEAT:
- Historical UI waves already merged into current `main`.
- Prior PASS evidence unless its SHA/evidence remains exactly valid.
- Promotions or unsupported business features without a canonical contract.

## PRODUCTION
HOLD / NO TOUCH.
