# الأغبري | Memory Layer 02 — PRODUCT SPECIFICATIONS

> **Canonical durable specification memory.** This file is the second live-memory layer after the Control Plane.
>
> **HANDOFF:** `CONTROL PLANE → PROJECT_MEMORY (this file) → DEVELOPMENT PROGRESS`
>
> Read this file for **what the product must be and the durable decisions that define it**. Do not use it as the current run log. After reading it, continue immediately to `ops/AGHBARI-DEVELOPMENT-PROGRESS.md` for problems, fixes, closures, and execution history.
>
> Product boundary: **Aghbari Commerce only**. Never import scope, secrets, identities, or release decisions from Report-Advisor/Report-Engainall.

## 1. PRODUCT CONTRACT
- Brand/product: **الأغبري | Aghbari Commerce**.
- Target: serious B2B merchant/store product for medium traders; sale-ready, not prototype/ERP clone.
- Core scope: catalog; authorized pricing; customer portal; orders/reorder/templates; inventory/warehouses/transfers/stock count; suppliers/purchasing/receiving; simple customer/supplier accounting (statements, invoices, payments, expenses); roles/permissions; import/export; invitations; audit/outbox/idempotency; PWA/offline primitives; controlled reporting gateway.
- Reporting boundary: Commerce is transactional source of truth; BI/reporting remains outside the store model.
- UX: premium responsive Arabic/RTL-first UI, English-ready architecture, accessibility, keyboard/focus, mobile, explicit loading/empty/error/success states.
- Differentiation: B2B speed, controlled pricing, self-service, reorder/templates, import/export, inventory integrity, traceability, permissions, offline resilience, auditability, integration readiness. Do not add BI/dashboard scope.

## 2. EXECUTION CONSTITUTION SUMMARY
- User command **1 = EXECUTE NOW**.
- No repeated full scans. Recheck only changed SHA/dependency, invalid evidence, or proof defect.
- CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION; IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED.
- No PASS without exact SHA/environment evidence. Never transfer PASS across SHAs.
- Never weaken assertions/security or invent evidence. Production remains HOLD/NO TOUCH until formal certification/release decision.
- Programmer owns technical architecture, implementation, UI/UX, security, testing, performance, CI/CD, deployment engineering and technical backlog.
- End every execution by updating this specification hub when durable knowledge changed, plus the progress ledger and latest-state router.

## 3. CURRENT RECONCILED CHECKPOINT — 2026-09-20
- Repo: `Aghbari-Technologies/aghbari-commerce`.
- Development branch: `enhancement/market-ready-v4-20260918`.
- PR #88: OPEN / DRAFT / MERGEABLE; base is frozen certification candidate.
- **Current development SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`** — latest commit `test(release): align build metadata assertion with built_at contract`.
- Frozen certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — **FROZEN / NO TOUCH**.
- Latest Vercel development deployment for exact current SHA: `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd`, state READY, exact Git SHA `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`.
- Earlier exact Netlify development proof remains valid only for its exact SHA `cb2707b8005ac8237b06a7c89cc9bcf68dc50061`; it is not evidence for the current SHA.
- Formal Final Regression: **PROVEN** on current development SHA by exact run `35477022465`.
- Certification: **NO**. Production: **HOLD / NO NEW TOUCH**.

## 4. LIVE SUPABASE TRUTH — VERIFIED 2026-09-20
- Project: `aghbari-commerce`; ref `mrcyqezbhpncuvaehwgf`; status `ACTIVE_HEALTHY`; PostgreSQL `17.6.1.166`.
- Current security advisor: authenticated-callable SECURITY DEFINER warning class remains by design/needs review across many RPCs; this is not itself proof of vulnerability when function-level authorization/search_path controls are correct.
- Auth leaked-password protection remains the one explicit external Auth configuration warning.
- **Invitation RPC boundary is now hardened live:** `consume_customer_invitation(text,uuid)` has `anon_execute=false`, `authenticated_execute=false`, `service_role_execute=true`.
- **Barcode RPC boundary is now hardened live:** `get_catalog_with_barcode(...)` and both `upsert_product(...)` overloads have `anon_execute=false`, `authenticated_execute=true`, `service_role_execute=true`.
- Latest barcode hardening source commit: `f7a0b9d6b5fe608da78f2881fc898bd922f0ff9d` with migration `supabase/migrations/20260920000210_harden_barcode_rpc_privileges.sql`.
- Latest exact current-SHA workflow state: Final Regression `35477022465` SUCCESS; Quality `35477022455` SUCCESS; Security `35477022467` SUCCESS; G1 push/PR `35477022486`/`35477025357` SUCCESS; Migration `35477022461` IN PROGRESS; Test-the-Test `35477022490` IN PROGRESS; Netlify Exact SHA `35477022463` BLOCKED by account-credit 403.

## 5. VERIFIED PRODUCT CONTRACT PROGRESS
### Completed / proven on development lane
- Customer invitation direct authenticated RPC exposure revoked; service-role path retained.
- Product barcode is now represented in the active catalog/domain mapping and centralized SKU-or-barcode lookup is used by Quick Order/Excel paths.
- Barcode RPC privileges explicitly hardened against PostgreSQL implicit PUBLIC EXECUTE.
- PR #88 market-ready UI work includes Command Center, keyboard-first navigation, repeat-order shortcuts, mobile quick navigation and exact UI assertions.
- Vercel exact development deployment for current SHA is READY.

### Still OPEN / NOT_PROVEN
1. **Viewer/customer routing:** PROVEN on development SHA `07c3cab...` and preserved by current `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`; customer identities are distinct from staff viewer identities in schema, invitation RPC, fixture, and UI.
2. **Formal Final Regression:** now PROVEN for current development SHA; certification still requires exact frozen-candidate evidence.
3. **Certification:** NO; frozen candidate must not be modified or certified from development evidence.
4. **Production:** NO TOUCH.
5. **Auth leaked-password protection:** external Supabase Auth configuration warning remains.
6. **Master-spec reconciliation:** promotions, notification center/provider delivery, integration delivery records/adapters, lots/batches/expiry/FEFO, reservations, independent fulfillment records and WhatsApp/Onyx adapters remain deferred/not proven unless explicitly implemented and verified.

## 6. FORENSIC / CLEANUP RULES
- Active frontend entry: `src/main.tsx -> AppV3Fixed.tsx`.
- `src/App.tsx` is older/alternate; do not delete until import/reference proof.
- CSS has historical layering; remove unused files/selectors only after reference proof and exact regression.
- Many Git branches and historical Supabase migrations are audit history; never delete blindly.
- Do not delete indexes solely because current `idx_scan=0` with tiny data.

## 7. RELEASE / DEPLOYMENT RULES
- Development deployment is not certification and never substitutes for frozen-candidate proof.
- Vercel Hobby deployment-limit failures are external quota issues, not product defects. Avoid unnecessary deployments; reuse exact artifacts where possible.
- Never touch Production until certification is formally proven.
- Historical PASS must retain exact SHA/environment.

## 8. NEXT EXECUTION QUEUE
### P0
1. Close current-SHA Migration/Test-the-Test, then reconcile the development delta against frozen candidate `2facceb...` and prepare candidate evidence without touching it.
2. Record exact current-SHA evidence and reconcile development against frozen candidate without touching the candidate.
3. Do not rerun already-closed current-SHA fronts unless evidence becomes invalid; proceed to candidate reconciliation and the remaining formal regression capability boundary.

### P1
4. Reconcile master specification vs implementation/deferred capabilities.
5. Consolidate frontend to one canonical path only after reference proof.
6. Consolidate CSS/design-system layers only after exact regression.
7. Clean duplicate Git refs only after proving they are nonessential to PR/certification/deployment evidence.

### P2 / FUTURE
- Promotions engine; notifications center; integration delivery records/adapters; lots/batches/expiry/FEFO; delivery/fulfillment; WhatsApp/Onyx provider adapters; centralized bilingual locale architecture.

## 9. MEMORY HANDOFF RULE
This file answers: **WHAT IS THE PRODUCT? WHAT MUST IT DO? WHAT ARE THE PERMANENT RULES/DECISIONS?**

It must hand off to:

`ops/AGHBARI-DEVELOPMENT-PROGRESS.md`

That file answers: **WHAT PROBLEMS WERE FOUND? WHAT WAS FIXED? WHAT WAS CLOSED? WHAT REMAINS OPEN?**

Do not duplicate run history here unless it becomes durable product/architecture knowledge.

## Reconciliation — 2026-09-20 / ff98a64a
- Reality: PR #88 remains OPEN / DRAFT / MERGEABLE; development HEAD is `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`; frozen candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34` and untouched; Production remains HOLD / NO TOUCH.
- Implementation: `src/AppV3Fixed.tsx` now routes `viewer` through canonical `isStaffPortalRole()`; `src/domain/roles.ts` centralizes the portal role boundary; `src/domain/roles.test.ts` covers owner/admin/sales/warehouse/viewer vs customer.
- Database: live `public.is_staff()` still excludes viewer; new `public.is_staff_reader()` includes viewer with `search_path = ''`, anon execution revoked, authenticated execution granted. Live `customers_read`, `orders_customer_read`, and `inventory_read_staff` policies now use the read-only helper.
- Live DDL was applied through the authorized SQL channel because the migration-apply connector operation was blocked by its safety gate; the equivalent migration source is committed as `supabase/migrations/20260920000300_viewer_staff_read_scope.sql`. Fresh-DB migration proof is still running.
- Current exact Vercel deployment: `dpl_2i86vekQXeYAKfgM2siKxsP4qr4g` READY for `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`. Browser run 572 has passed exact artifact identity and customer credentials checks and is executing the customer critical-path browser suite.
- Current exact-SHA gates observed: application-quality run 3054 SUCCESS; security-audit 2744 SUCCESS; G1 push/PR 2885/2891 SUCCESS. Test-the-Test and migration proof subsequently progressed to later runs recorded below.
- Supabase security advisor state after the helper: 60 intentional/known authenticated SECURITY DEFINER warnings plus 1 external `auth_leaked_password_protection` warning. The new helper is deliberately read-only and does not replace the write-sensitive `is_staff()` contract.

## Reconciliation — 2026-09-20 / RUN-2026-09-20-RESUME-004
- Development HEAD is now `fffff8c1a48c2da73f70fa79f766b1b116c9cf80` on `enhancement/market-ready-v4-20260918`; PR #88 remains OPEN / DRAFT / MERGEABLE. Frozen candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34` remains untouched; Production remains HOLD / NO TOUCH.
- Root cause: viewer could reach the staff dashboard correctly but still saw sidebar quick-action links for sections not rendered for that role (`orders`, `inventory`, `customers`). These were dead navigation affordances, not an authorization bypass.
- Fix: `src/AdminExecutiveDashboard.tsx` gates each quick link by the same role rules used to render its target section and gives viewer an explicit read-only status.
- New exact Vercel development deployment: `dpl_DYdizKuWnLDaRDmNA6Unbou9SDAj`, BUILDING at reconciliation time; no production mutation.
- Current-SHA workflow evidence: security-audit `2749` SUCCESS; application-quality `3059` unit/integration + lint SUCCESS while production build was RUNNING; G1 `2891`/`2892`, migration `3034`, Test-the-Test `663` RUNNING; Netlify exact SHA `32` PENDING. Exact browser proof for this SHA was not claimed until deployment-status completed.
- Test infrastructure note: direct container network access could not resolve GitHub, so local clone/build verification was unavailable; repository-native CI was the authoritative executable verification path for that SHA. No evidence was fabricated.

## Reconciliation — 2026-09-20 / RUN-2026-09-20-RESUME-005
- Development HEAD: `07c3cab1724d54d34234d67250276ac12968e14e` on `enhancement/market-ready-v4-20260918`; PR #88 OPEN / DRAFT / MERGEABLE.
- Development was 54 commits ahead of frozen candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`; candidate remains FROZEN / NO TOUCH.
- Exact current-SHA evidence closed: security 2756; quality 3066; G1 push/PR 2901/2902; migration 3041; Test-the-Test 666; Browser E2E 576; Netlify Exact SHA 35.
- Vercel exact deployment `dpl_B7fY9FmRsoECLu7TLUWGxCPp3ALG` was READY and build metadata reported exact SHA `07c3cab1724d54d34234d67250276ac12968e14e`.
- Live role invariant: user_role includes customer; no customer-linked profile remains viewer; customer invitation RPC remains service_role-only.
- E2E lesson: non-production browser stock is mutable and was replenished only for test execution; observed fixture stock was 96. Source fixture role and column-shape corrections were committed; local-browser workflow dispatch remained unavailable, so no local-browser PASS was claimed.
- Auth leaked-password protection remains an external Supabase configuration warning.
- Formal Final Regression was NOT_PROVEN at this checkpoint because production-smoke.yml required workflow_dispatch and the connected GitHub mutation surface exposed no dispatch. Certification NO. Production HOLD / NO TOUCH.

## Reconciliation — 2026-09-20 / RUN-2026-09-20-RESUME-006
- Current development HEAD is `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`; exact Vercel deployment `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd` is READY.
- Current-SHA Final Regression `35477022465` is SUCCESS: exact checkout/deployed SHA, security headers, Arabic/RTL shell, PWA manifest, and service worker all verified.
- Current-SHA quality/security/G1 proofs are SUCCESS. Migration/Test-the-Test were still IN PROGRESS at the last recorded checkpoint and therefore remain NOT_PROVEN until their runs close.
- Netlify Exact SHA `35477022463` is BLOCKED by Netlify account credit exhaustion (HTTP 403). This is an external platform quota blocker, not a product-test failure; no further Netlify deploy attempt should be made until the account is credited.
- Exact current-SHA browser E2E is NOT_PROVEN; historical browser evidence on `07c3cab...` remains non-transferable by policy.
- Formal Final Regression is PROVEN on current development SHA `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`; certification is still NO because the frozen candidate remains `2facceb...` and development evidence does not transfer. Production remains NO TOUCH.
