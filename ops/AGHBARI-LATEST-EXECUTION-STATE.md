# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Source/functional HEAD represented by this checkpoint: 8c1d817ff67165f4844571f2e9cbb55c5cc3e38a
Branch: main
Production: HOLD / NO TOUCH
Certification: NOT CLAIMED

## Current Reality
- The current execution continued on the live main line and closed additional UI, security, performance and migration-provenance gaps.
- No rollback, fake feature, parallel transaction source or Report-Advisor/BI operational dependency was introduced.

## Closed in the current execution chain
- AdminPanel JSX integrity repaired; missing canAdmin permission variable restored.
- All 17 live Admin deep-link targets were checked and now resolve to matching DOM anchors.
- Control Plane runtime status is data-driven; misleading assistant wording removed.
- Customer voice search is real, Arabic-locale browser Speech Recognition with listening/permission/unsupported fallback.
- Image search is explicitly non-interactive until a canonical visual-search contract exists.
- Same-origin microphone Permissions-Policy enabled for the implemented voice-search capability.
- Customer template branch labels derive from the active warehouse context instead of hardcoded business state.
- Finance, Purchasing, Inventory and Admin data-load callbacks no longer depend on initialized selection values that can trigger reload loops.
- Customer control settings expose real voice/retail-price-information controls and validate limits/payment configuration before save.
- Customer navigation uses the URL-synchronized navigate() path.
- Legacy inventory-sync navigation is explicitly bounded because there is no independent canonical sync transaction.
- Dynamic client preview no longer contains fake interactive buttons.
- client_ui_settings database INSERT/UPDATE/DELETE is now owner/admin-gated at RLS level.
- Barcode-aware catalog RPC was applied through the migration mechanism and is now present in live migration provenance.
- Security classification test 031 covers public SECURITY DEFINER exposure, RLS, notification scope and client-control authorization.

## Live verification — Supabase project mrcyqezbhpncuvaehwgf
- orders.payment_method: present.
- notifications table: present.
- client_ui_settings: present.
- get_catalog_with_barcode(text,uuid,integer,integer,uuid): present; SECURITY DEFINER; search_path empty; authenticated execute true; anon execute false.
- public tables with RLS: 60/60.
- public SECURITY DEFINER routines executable by anon: 0.
- public SECURITY DEFINER routines missing explicit empty search_path: 0.
- current_organization_id(), current_customer_id(), is_staff(), is_staff_reader(): authenticated execute true; tenant-context helpers denied to anon.
- client_ui_settings policies: owner/admin-only INSERT, UPDATE and DELETE; organization-scoped SELECT.
- latest required live migration provenance entries recorded: 2 — canonicalize_barcode_catalog_rpc_lineage and harden_client_ui_settings_admin_boundary.

## Evidence boundary
- Live SQL evidence above is current environment evidence only.
- The repository pgTAP test cannot be marked as live PASS because raw SQL access does not expose pgTAP plan(); it remains test-harness/CI evidence.
- Exact-SHA application-quality, security, migration, concurrency, G1, order workflow, Test-the-Test and browser runs must be consumed for the latest exact source SHA.
- Existing PASS evidence from older SHAs is never transferred.
- Vercel current project has recent source-mismatched/error deployments and no exact-current-source deployment proof is claimed.
- Existing Netlify project is free/claimed, but its deployment writer requires a source-directory command that is not executable from the GitHub connector alone.

## OPEN EXECUTION FRONTIER
1. Consume final exact-SHA Test-the-Test, Concurrency and Migration Proof results after this documentation write-back.
2. Continue nested contract-backed UI gaps only where a real backend contract exists; do not re-open proven customer/Admin surfaces.
3. Normalize live purchase/receipt idempotency server bound from 200 to the canonical 128 only through a reviewed migration; production stays NO TOUCH until safely evidenced.
4. Complete semantic legacy Markdown reconciliation/reference audit before retirement; do not claim 100% consolidation early.
5. Obtain exact-source hosted browser/runtime proof and resolve release/certification gate; keep production HOLD.

## CURRENT RESUME POINTER
START FROM CURRENT VERIFIED HEAD `8c1d817ff67165f4844571f2e9cbb55c5cc3e38a` on main; after documentation write-back, rerun exact-SHA evidence on the new docs HEAD.

UI FRONT:
Customer Portal -> catalog pagination / quick order / Excel resolution / order retry / finance retry are closed. Continue Admin -> remaining contract-backed nested edit/recovery surfaces only after exact evidence scan.

CORE FRONT:
Purchase/receipt idempotency server bound drift (200 live vs 128 client/repo) is the next explicit contract gap; do not touch production while HOLD.

VERIFY:
Exact SHA -> application quality -> security -> migration -> concurrency -> Test-the-Test -> G1/order workflow -> browser/runtime -> hosted exact-source match.

DO NOT REPEAT:
Closed catalog pagination, bulk SKU/barcode resolution, Admin JSX repairs, Staff Operations detail UI, idempotency boundary tests, historical UI waves, unsupported Promotions/image-search, or Report-Advisor/BI transaction logic.

## PRODUCTION
HOLD / NO TOUCH