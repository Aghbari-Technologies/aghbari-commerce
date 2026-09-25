# 🔴 AGHBARI LATEST EXECUTION STATE

Project: Aghbari Commerce | الأغبري
Source/functional HEAD represented by this checkpoint: da87d139e3e2f74370598601edb7c059ebcae6c8
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
1. Consume exact-head CI results and repair only proven regressions.
2. Continue nested contract-backed UI edit/recovery states where current backend contracts exist.
3. Continue individual classification of the 62 authenticated-callable SECURITY DEFINER advisor findings; never blanket revoke application/RLS helper RPCs.
4. Complete semantic 50/50 legacy Markdown consolidation/reference audit before retirement.
5. Obtain exact-source hosted browser/runtime proof; keep production NO TOUCH.

## CURRENT RESUME POINTER
START FROM SOURCE HEAD da87d139e3e2f74370598601edb7c059ebcae6c8 ON main.

UI: Customer Portal -> verify voice-search, URL navigation and control-setting runtime states; Admin -> consume exact CI/browser evidence, then close only remaining contract-backed nested edit/recovery surfaces.

CORE: Preserve finance/payment idempotency, purchasing/receiving, inventory concurrency, notifications, RBAC and audit/outbox contracts. Security: classify each remaining authenticated SECURITY DEFINER advisory finding by actual caller, tenant boundary and privilege requirement.

VERIFY: exact SHA -> application quality -> security/RLS -> migration provenance -> concurrency -> Test-the-Test -> G1/order workflow -> browser/runtime -> hosted exact-source match.

DO NOT REPEAT: historical UI waves, transferred evidence, unsupported image search, unsupported Promotions, or Report-Advisor/BI transaction logic.

## PRODUCTION
HOLD / NO TOUCH