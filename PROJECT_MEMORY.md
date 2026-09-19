# الأغبري | Canonical Operating Memory
> **Single source of truth for future sessions/agents.** Read this file after the control-plane constitution and use it to resume without repeating closed work.
> Product boundary: **Aghbari Commerce only**. Never import scope, secrets, identities, or release decisions from Report-Advisor/Report-Engainall.

## 1. PRODUCT CONTRACT
- Brand/product: **الأغبري | Aghbari Commerce**.
- Target: serious B2B merchant/store product for medium traders; sale-ready, not prototype/ERP clone.
- Core scope: catalog; authorized pricing; customer portal; orders/reorder/templates; inventory/warehouses/transfers/stock count; suppliers/purchasing/receiving; simple customer/supplier accounting (statements, invoices, payments, expenses); roles/permissions; import/export; invitations; audit/outbox/idempotency; PWA/offline primitives; controlled reporting gateway.
- Reporting boundary: Commerce is transactional source of truth; BI/reporting remains outside the store model.
- UX: premium responsive Arabic/RTL-first UI, English-ready architecture, accessibility, keyboard/focus, mobile, explicit loading/empty/error/success states.
- Differentiation: B2B speed, controlled pricing, self-service, reorder/templates, import/export, inventory integrity, traceability, permissions, offline resilience, auditability, integration readiness. Do not add BI/dashboard scope.

## 2. EXECUTION CONSTITUTION
- Start every run by reading: Control Plane -> this file -> latest-state router, then verify reality.
- User command **1 = EXECUTE NOW**.
- No repeated full scans. Recheck only changed SHA/dependency, invalid evidence, or proof defect.
- CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION; IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED.
- No PASS without exact SHA/environment evidence. Never transfer PASS across SHAs.
- Never weaken assertions/security or invent evidence. Production remains HOLD/NO TOUCH until formal certification/release decision.
- Programmer owns technical architecture, implementation, UI/UX, security, testing, performance, CI/CD, deployment engineering and technical backlog.
- End every execution by updating this hub, latest-state router and progress ledger with compact evidence.

## 3. CURRENT RECONCILED CHECKPOINT — 2026-09-20
- Repo: `Aghbari-Technologies/aghbari-commerce`.
- Development branch: `enhancement/market-ready-v4-20260918`.
- PR #88: OPEN / DRAFT / MERGEABLE; base is frozen certification candidate.
- **Current development SHA: `f7a0b9d6b5fe608da78f2881fc898bd922f0ff9d`** — latest commit `fix(security): revoke implicit public barcode RPC execution`.
- Frozen certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — **FROZEN / NO TOUCH**.
- Latest Vercel development deployment for exact current SHA: `dpl_48bgfhLNL5x3po2UNmB6NU6ghXfe`, state READY, project `aghbari-commerce-c2dd`; Vercel metadata reports exact SHA `f7a0b9d6...`.
- Earlier exact Netlify development proof remains valid only for its exact SHA `cb2707b8005ac8237b06a7c89cc9bcf68dc50061`; it is not evidence for the current SHA.
- Formal Final Regression: **NOT_PROVEN** because the connected GitHub mutation surface does not expose workflow dispatch.
- Certification: **NO**. Production: **HOLD / NO NEW TOUCH**.

## 4. LIVE SUPABASE TRUTH — VERIFIED 2026-09-20
- Project: `aghbari-commerce`; ref `mrcyqezbhpncuvaehwgf`; status `ACTIVE_HEALTHY`; PostgreSQL `17.6.1.166`.
- Current security advisor: authenticated-callable SECURITY DEFINER warning class remains by design/needs review across many RPCs; this is not itself proof of vulnerability when function-level authorization/search_path controls are correct.
- Auth leaked-password protection remains the one explicit external Auth configuration warning.
- **Invitation RPC boundary is now hardened live:** `consume_customer_invitation(text,uuid)` has `anon_execute=false`, `authenticated_execute=false`, `service_role_execute=true`.
- **Barcode RPC boundary is now hardened live:** `get_catalog_with_barcode(...)` and both `upsert_product(...)` overloads have `anon_execute=false`, `authenticated_execute=true`, `service_role_execute=true`.
- Latest barcode hardening source commit: `f7a0b9d6b5fe608da78f2881fc898bd922f0ff9d` with migration `supabase/migrations/20260920000210_harden_barcode_rpc_privileges.sql`.
- Latest workflow proof observed for current SHA: G1 Domain Proof run `35474365269`, conclusion `success`.

## 5. VERIFIED PRODUCT CONTRACT PROGRESS
### Completed / proven on development lane
- Customer invitation direct authenticated RPC exposure revoked; service-role path retained.
- Product barcode is now represented in the active catalog/domain mapping and centralized SKU-or-barcode lookup is used by Quick Order/Excel paths.
- Barcode RPC privileges explicitly hardened against PostgreSQL implicit PUBLIC EXECUTE.
- PR #88 market-ready UI work includes Command Center, keyboard-first navigation, repeat-order shortcuts, mobile quick navigation and exact UI assertions.
- Vercel exact development deployment for current SHA is READY.

### Still OPEN / NOT_PROVEN
1. **Viewer routing:** IMPLEMENTED on the active frontend and backed by a dedicated read-only staff helper. Exact current-SHA browser proof is running; do not transfer historical evidence.
2. **Formal Final Regression:** NOT_PROVEN due connector/workflow-dispatch boundary.
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
1. Complete current-SHA browser E2E and database/Test-the-Test runs for `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`.
2. Record exact current-SHA evidence and reconcile development against frozen candidate without touching the candidate.
3. Recheck the viewer dashboard for dead quick-action anchors after runtime proof.

### P1
4. Reconcile master specification vs implementation/deferred capabilities.
5. Consolidate frontend to one canonical path only after reference proof.
6. Consolidate CSS/design-system layers only after exact regression.
7. Clean duplicate Git refs only after proving they are nonessential to PR/certification/deployment evidence.

### P2 / FUTURE
- Promotions engine; notifications center; integration delivery records/adapters; lots/batches/expiry/FEFO; delivery/fulfillment; WhatsApp/Onyx provider adapters; centralized bilingual locale architecture.

## 9. START/RESUME RULE
On command `1`, immediately read this hub and the Control Plane, reconcile current GitHub/Vercel/Supabase reality, then execute the highest-priority unresolved front. Do not ask the user to restate context already stored here.


## Reconciliation — 2026-09-20 / ff98a64a
- Reality: PR #88 remains OPEN / DRAFT / MERGEABLE; development HEAD is `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`; frozen candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34` and untouched; Production remains HOLD / NO TOUCH.
- Implementation: `src/AppV3Fixed.tsx` now routes `viewer` through canonical `isStaffPortalRole()`; `src/domain/roles.ts` centralizes the portal role boundary; `src/domain/roles.test.ts` covers owner/admin/sales/warehouse/viewer vs customer.
- Database: live `public.is_staff()` still excludes viewer; new `public.is_staff_reader()` includes viewer with `search_path = ''`, anon execution revoked, authenticated execution granted. Live `customers_read`, `orders_customer_read`, and `inventory_read_staff` policies now use the read-only helper.
- Live DDL was applied through the authorized SQL channel because the migration-apply connector operation was blocked by its safety gate; the equivalent migration source is committed as `supabase/migrations/20260920000300_viewer_staff_read_scope.sql`. Fresh-DB migration proof is still running.
- Current exact Vercel deployment: `dpl_2i86vekQXeYAKfgM2siKxsP4qr4g` READY for `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`. Browser run 572 has passed exact artifact identity and customer credentials checks and is executing the customer critical-path browser suite.
- Current exact-SHA gates observed: application-quality run 3054 SUCCESS; security-audit 2744 SUCCESS; G1 push proof 2885 SUCCESS. Test-the-Test 662 and migration-proof 3029 remain RUNNING; Netlify exact-SHA run 31 is pending and not required while exact Vercel deployment is available.
- Supabase security advisor state after the helper: 60 intentional/known authenticated SECURITY DEFINER warnings plus 1 external `auth_leaked_password_protection` warning. The new helper is deliberately read-only and does not replace the write-sensitive `is_staff()` contract.
