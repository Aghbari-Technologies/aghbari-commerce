# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Actual Git HEAD verified for this checkpoint: 127ebdd48eeda2a0cde3a4b55739a5a723fac3c2
Branch: main
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current Reality
- Execution continued directly from current main; no rollback or historical restart.
- UI integrity, navigation, interaction, data-context correctness, performance and security-classification gaps were closed where real contracts already existed.
- No fake Promotions feature, duplicate transaction authority, or Report-Advisor/BI operational model was introduced.

## Implemented in this execution chain
- Repaired Admin Panel JSX integrity and restored the role permission variable used by its UI.
- Added and verified all 17 live Admin deep-link targets now have matching DOM anchors.
- Made Control Plane runtime status reflect loading/error/available state instead of static health text.
- Corrected the Control Plane shortcut label that implied a non-existent assistant.
- Implemented real Arabic browser voice search with unsupported-browser, permission-denied and failure recovery.
- Replaced the former image-search dead button with an explicit non-action capability boundary.
- Updated Vercel Permissions-Policy for same-origin microphone access.
- Replaced hardcoded customer template branch text with the actual selected warehouse name.
- Stabilized Finance/Purchasing/Inventory loading hook dependencies to prevent selection-driven reload loops.
- Exposed real customer-control toggles for voice search and retail-price visibility information.
- Restored URL synchronization for customer navigation actions.
- Reclassified inventory sync as a contract boundary because Commerce has no separate canonical sync transaction.
- Added security-definer exposure classification test coverage.

## Exact code lineage
- e508531cee460ddfc315316909ef7bcca526c07e — Admin JSX integrity.
- ea3f4c5c49e15d7bf531e18149b42288ab0846b6 — Admin anchor closure.
- 6be211522eaf2c440d65a83ed155c06688bc831f — dynamic Control Plane status.
- cdd3dae5dae90d7f60832035e4d68454d3354cb1 — stable Finance/Purchasing/Inventory loads.
- 2951873ff87e898cca50c09d6f536490b6a55542 — real voice search / no dead image action.
- 9d170b8bae0a26a91fdee7926d4aa8a0f1ed8548 — microphone policy.
- feb55aeb4346e3abacf0752511c5c9da6591ae6a — warehouse-context template label.
- 2af76bb0a2fe27379f7928caa0b9296541350511 — customer-control toggles.
- 0ce090933e27b8418af0403f6d49cc6252f1549b — URL-synchronized customer navigation.
- d1850d0a940c1619bd2547e9884c68b9247f1506 — inventory-sync boundary.
- 3fb92e0d0cb20815599543b385ab91d63688fff8 — security-definer classification test.
- Documentation/write-back commits advanced the repository to this checkpoint.

## Live security evidence
Supabase project mrcyqezbhpncuvaehwgf direct SQL:
- public SECURITY DEFINER routines without explicit empty search_path: 0.
- public SECURITY DEFINER routines executable by anon: 0.
- authenticated execution for current_organization_id(), current_customer_id(), is_staff(), is_staff_reader(): true.
- anonymous tenant-context helper execution: denied.
- authenticated-executable public SECURITY DEFINER routines: 62.
- The Supabase advisor warning remains an intentional per-RPC classification queue; no blanket revoke was applied.

## Exact-SHA verification boundary
- The new code/test changes have not earned transferred PASS from older SHAs.
- Exact-head GitHub workflows must be read against the exact tested SHA.
- The repository-level pgTAP security classification test is present; raw live SQL did not expose pgTAP helper functions, so only the direct SQL privilege/search_path evidence is treated as live proof.
- Hosted exact-source runtime is not proven. Vercel currently has recent deployment mismatches/errors and an existing protection/rate-limit gate. Netlify free project exists but requires a source-side deployment command.

## OPEN EXECUTION FRONTIER
### UI
- Consume exact-head CI/browser results.
- Continue only contract-backed nested edit/recovery states not yet closed.
- Preserve explicit unsupported boundaries; no placeholder features.

### CORE / SECURITY
- Consume exact-head domain/migration/concurrency/order/Test-the-Test/security results.
- Continue per-RPC SECURITY DEFINER classification; inspect function-specific tenant/role checks before any privilege change.
- Preserve finance, purchasing, inventory, notification, RBAC and audit/outbox contracts already hardened.

### RELEASE
- Current Vercel deployment metadata is not an exact-current-SHA proof.
- Production remains HOLD / NO TOUCH.
- Candidate certification requires exact source SHA -> build -> deployment -> browser/runtime evidence with no evidence transfer.

### DOCUMENTS
- Continue semantic reconciliation/reference audit of the legacy Markdown corpus. Do not retire a source until unique knowledge is merged and coverage is proven 50/50.

## CURRENT RESUME POINTER
START FROM EXACT main HEAD 127ebdd48eeda2a0cde3a4b55739a5a723fac3c2.

UI FRONT: Admin -> consume exact current CI/browser evidence, then close only remaining contract-backed nested edit/recovery surfaces. Customer -> verify voice-search, URL navigation, configuration and remaining nested state gaps.

CORE FRONT: Security -> classify the 62 authenticated SECURITY DEFINER routines individually; do not revoke RLS helpers or required application RPCs blindly. Transactions -> preserve finance/payment idempotency, purchasing/receiving and inventory concurrency boundaries while exact-head gates run.

PROOF: Exact SHA -> application quality -> security/RLS -> migration -> concurrency -> Test-the-Test -> G1/order workflow -> browser/runtime -> hosted exact-source match.

DO NOT REPEAT: Historical UI waves, older PASS evidence, unsupported image search, unsupported Promotions, or Report-Advisor/BI transaction logic.

## PRODUCTION
HOLD / NO TOUCH