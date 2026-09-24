# 🔴 AGHBARI LATEST EXECUTION STATE

**Last verified working runtime baseline:** `9b489b4f6b196eb2894dc3c8b1337eab00e9a867`
**Exact implementation/write-back base HEAD:** `4d098d337e09236d0c39b4fe0dadc2040073ce35`
**Branch:** `main`
**Production:** NO TOUCH
**Certification:** NOT CLAIMED

## Current reality
- Repository HEAD was reconciled from the actual `main` ref; historical SHA values in older state files were not used as the execution baseline.
- The current code frontier closes important customer and staff UX gaps while preserving the server as the transactional authority.
- Customer checkout now reuses one idempotency key for an active submission attempt and rotates only after successful order creation.
- Customer portal now exposes actual online/offline state, blocks checkout while offline, keeps cart editing behavior intact, adds account refresh, and exposes accessible navigation state.
- Customer order-detail mapping now validates runtime identifiers/numeric values and builds the status timeline deterministically without treating draft orders as pending.
- Admin command-center navigation now exposes the existing operational anchor set rather than only the primary sections.
- Purchasing and finance screens now have explicit loading and recovery behavior.

## Implemented frontier

### Customer Portal
- Orders: detail/tracking data contract hardened; draft/completed/cancelled timeline semantics covered by tests.
- Checkout: stable idempotency key across ambiguous retry attempts; explicit connectivity gate.
- Account: explicit context refresh action.
- Runtime UX: offline banner, retry/recovery action, accessible current-navigation state, safer product-detail add behavior.

### Admin / Staff
- Command navigation includes orders, customers, product creation, categories, pricing, media, import, inventory, inventory adjustment, purchasing, finance, export and client settings.
- Top-level error state can trigger a controlled reload.

### Purchasing / Finance
- Explicit loading state and empty/retry recovery.
- Load failures reset the loading state so the interface cannot remain permanently “busy/loading”.

### Core / Security
- `getCustomerOrderDetail` now has a strict runtime trust boundary for line identifiers, quantities, prices, currency and status history.
- Live Supabase inspection confirms the project is healthy and the inspected SECURITY DEFINER functions use an empty `search_path`; selected mutating functions enforce organization and role boundaries.
- Security advisor still reports 62 authenticated-executable SECURITY DEFINER warnings. This remains an OPEN security workstream; no false clean/PASS claim is made.

## Verification
- Remote `main` ref was directly verified at the implementation/write-back base `4d098d337e09236d0c39b4fe0dadc2040073ce35`; this state-file commit is documentation-only and therefore advances Git by one checkpoint commit without changing functional code.
- Local clone/build/typecheck/lint could not run because the execution container could not resolve `github.com`.
- GitHub Actions were observed for the preceding exact SHA `c07ef194...`; no executable PASS is transferred to this newer HEAD.
- No candidate, deployment or production claim is made.

## Open gaps
1. Run and bind Application Quality, Security Audit, Supabase Migration Proof, Concurrency Proof, Test-the-Test and Browser/Runtime proof to the exact current HEAD.
2. Classify/remediate the full 62-function SECURITY DEFINER advisor set without revoking required customer/staff RPCs blindly.
3. Complete semantic consolidation and reference audit of all 50 historical Markdown sources before retirement.
4. Close candidate/deployment/runtime certification; production remains HOLD / NO TOUCH.

## Blockers
- Vercel remains a deployment-control concern under the existing free-plan/build-rate-limit protection; deployment evidence is not accepted until an exact-SHA runtime target is proven.
- Local verification is limited by network DNS in the execution container.

## CURRENT RESUME POINTER
START FROM the Git `main` commit created by this state checkpoint; its functional parent is `4d098d337e09236d0c39b4fe0dadc2040073ce35`.

UI FRONT:
Re-open `src/AppV3Fixed.tsx`, `src/AdminPanel.tsx`, `src/PurchasingPanel.tsx`, `src/FinancePanel.tsx` only for regressions; next priority is exact browser proof of customer order detail, checkout retry/idempotency behavior, offline state, account refresh, admin command navigation and staff loading/error recovery.

CORE/SECURITY FRONT:
Run exact-SHA security/migration/concurrency workflows against the current HEAD. Use the live Supabase advisor set as a classification queue; do not bulk-revoke callable business RPCs. Preserve the tenant/role checks and `search_path='' ` boundary verified on inspected functions.

PROOF FRONT:
Bind every PASS to current SHA `e2b67f6a47af3b8b377001fb1c7c7eeec9a4ca99`, environment and executable evidence. Browser proof must cover desktop/mobile RTL, loading/empty/error/success/offline and persistence/refresh. Deployment/candidate/production remain NO TOUCH until independently proven.

DOCUMENT FRONT:
Continue the 50-source semantic merge/reference audit. The manifest currently describes classification, not semantic-complete retirement.

DO NOT REPEAT:
Do not reopen earlier catalog/cart/order foundations unless exact-current-HEAD evidence identifies regression or invalidated evidence.
