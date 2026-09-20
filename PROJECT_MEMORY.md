# الأغبري | Memory Layer 02 — PRODUCT SPECIFICATIONS

> Canonical durable specification memory. This file defines what Aghbari Commerce is, its permanent technical/product decisions, and the newest durable execution lessons. Run history belongs in the progress ledger.
>
> **Product boundary: Aghbari Commerce only. Never import scope, secrets, identities, or release decisions from Report-Advisor/Report-Engainall.**

## 1. PRODUCT CONTRACT
- Brand/product: **الأغبري | Aghbari Commerce**.
- Target: serious B2B merchant/store product for medium traders; sale-ready, not a prototype or generic ERP clone.
- Core scope: catalog; authorized pricing; customer portal; orders/reorder/templates; inventory/warehouses/transfers/stock count; suppliers/purchasing/receiving; simple customer/supplier accounting (statements, invoices, payments, expenses); roles/permissions; import/export; invitations; audit/outbox/idempotency; PWA/offline primitives; controlled reporting gateway.
- Reporting boundary: Commerce is the transactional source of truth; BI/reporting remains outside the store model.
- UX: premium responsive Arabic/RTL-first UI, English-ready architecture, accessibility, keyboard/focus, mobile, and explicit loading/empty/error/success states.
- Differentiation: B2B speed, controlled pricing, self-service, reorder/templates, import/export, inventory integrity, traceability, permissions, offline resilience, auditability, integration readiness. Do not add BI/dashboard scope.

## 2. PERMANENT EXECUTION CONSTITUTION
- User command `1` = EXECUTE NOW.
- Start from `AGHBARI-EXECUTION-START.md`, then `CONTROL PLANE → PROJECT MEMORY → DEVELOPMENT PROGRESS → LATEST STATE → CURRENT REALITY → EXECUTE`.
- No repeated full scans. Recheck when SHA/dependency/evidence/environment/requirement/security posture changes.
- `CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION` and `IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`.
- No PASS without exact SHA/environment evidence. Never transfer PASS across SHAs.
- Never weaken assertions/security or invent evidence. Production remains HOLD/NO TOUCH until formal certification/release decision.
- Programmer owns technical architecture, implementation, UI/UX, security, testing, performance, CI/CD, deployment engineering and technical backlog.
- Candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34` is frozen and must never be mutated merely to simplify certification.

## 3. CURRENT RECONCILED REALITY — 2026-09-20
- Repository: `Aghbari-Technologies/aghbari-commerce`.
- Development branch: `enhancement/market-ready-v4-20260918`.
- Development SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.
- PR #88: OPEN / DRAFT / MERGEABLE; base remains frozen historical candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
- Active certification branch: `certification/final-candidate-20260920-v3`, exact SHA `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.
- Candidate Vercel deployment: `dpl_72VRoKV9a71aY8JPtn7Pqsv5p18z`, READY, exact SHA matches; runtime error query for this preview returned no error/fatal logs.
- Candidate exact gates proven: Bootstrap 1067; Quality 3105; Security 2795; G1 2948; Order Workflow 1576; Migration 3080; Concurrency 573; Test-the-Test 682 attempt 2; Fresh Browser 400; Local Production Browser 406.
- Candidate Deployment Browser proven independently by `Certification / Candidate Deployment Browser Proof` run `35478298905`, with exact artifact verification, Customer E2E, Admin E2E, and evidence artifact `10594833277`.
- Candidate Final Regression proven independently by `Certification / Candidate Final Regression Proof` run `35478610589`, with exact artifact, security headers, Arabic/RTL shell, PWA manifest, service worker, and evidence artifact `10594688925`.
- Frozen historical candidate `certification/final-candidate-20260918` remains exactly `2facceb39aaa826413f20245a6f20b6c2ff7cd34` and untouched.
- Production remains HOLD / NO TOUCH.
- Netlify exact-SHA deployment remains externally blocked by HTTP 403 account-credit exhaustion.
- Auth leaked-password protection remains an explicit external Supabase Auth configuration warning.

## 4. LIVE SUPABASE TRUTH
- Project: `aghbari-commerce`; ref `mrcyqezbhpncuvaehwgf`; status `ACTIVE_HEALTHY`; PostgreSQL `17.6.1.166`.
- Customer invitation RPC boundary: service-role-only.
- Viewer read-only scope uses dedicated `is_staff_reader()` and targeted read policies; write-sensitive `is_staff()` remains distinct.
- Barcode RPC exposure was hardened: anon execution revoked; authenticated/service-role access according to the domain contract.
- Auth leaked-password protection remains an external Supabase Auth configuration warning.
- A direct query against `supabase_migrations.schema_migrations` returned no rows for versions `20260920000210` and `20260920000300`; therefore this query is not used as migration proof and no migration PASS is inferred from it.

## 5. VERIFIED PRODUCT / ARCHITECTURE KNOWLEDGE
- Customer invitation direct authenticated RPC exposure is revoked; privileged service-role path retained.
- Notifications have a transactional boundary table with tenant/customer RLS and direct-write denial (`20260918190000_notifications_boundary.sql`); provider delivery/outbox integration remains deferred.
- Product barcode is part of active catalog/domain mapping and centralized SKU-or-barcode lookup is used by Quick Order/Excel paths.
- Barcode RPC privileges are explicitly hardened against PostgreSQL implicit PUBLIC EXECUTE.
- PR #88 market-ready UI includes Command Center, keyboard-first navigation, repeat-order shortcuts, mobile quick navigation, and exact UI assertions.
- Viewer routing/permissions are deliberately read-only and separate from customer identities.
- Active frontend entry remains `src/main.tsx -> AppV3Fixed.tsx`; `src/App.tsx` is older/alternate and must not be deleted until reference proof.
- CSS has historical layering; remove unused files/selectors only after reference proof and exact regression.
- Historical Git branches/migrations are audit history; do not delete blindly.
- Do not delete indexes solely because `idx_scan=0` on tiny data.

## 6. RELEASE / PROOF RULES
- Development deployment is not certification and never substitutes for frozen-candidate proof.
- New SHA invalidates affected evidence until revalidated on the new exact SHA.
- Live must never substitute for candidate verification.
- Vercel deployment-limit/quota failures are external platform issues, not product defects.
- Production is never used for testing or browser proof.

## 7. MASTER-SPEC DEFERRED AREAS
Unless explicitly implemented and proven, these remain backlog/deferred: promotions engine; notification provider delivery; integration delivery records/adapters; lots/batches/expiry/FEFO; reservations; independent fulfillment records; WhatsApp/Onyx provider adapters; centralized bilingual locale architecture.

## 8. NEXT EXECUTION QUEUE
### P0
1. Finish candidate-v3 exact-SHA gates: migration, concurrency, Test-the-Test, fresh browser, local production browser.
2. Establish candidate deployment-browser proof on the candidate Vercel deployment; the PR-triggered browser workflow currently proves only the browser contract and skips the authenticated E2E job on pull_request events.
3. Reconcile the full 61-commit delta against the frozen historical candidate without mutating the frozen ref.
4. Certification remains NO until every mandatory release gate is proven on the candidate and every external blocker is classified.

### P1
5. Resolve/reassess Auth leaked-password protection through an authorized external configuration path.
6. Reconcile deferred master-spec capabilities against product readiness.
7. Consolidate frontend/CSS historical layers only after reference proof and exact regression.

## 9. DURABLE EXECUTION LESSONS — 2026-09-20
- A single post-checkpoint commit can invalidate exact-SHA evidence even when the code change is only a test fixture. Treat every SHA change as an evidence reconciliation event.
- A later role-split migration (`20260920000410_split_customer_profile_role.sql`) redefined a SECURITY DEFINER invitation function with `search_path=public` and unqualified `digest()`, regressing the earlier hardened contract. The defect was exposed by exact concurrency proof.
- Corrective migration `20260920000500_harden_customer_invitation_crypto.sql` restores empty search_path, schema-qualified `extensions.digest()`, customer role semantics, and service_role-only execution. Live verification confirms the hardened definition and privileges.
- When workflow dispatch is unavailable, critical exact-SHA local browser/concurrency workflows require automatic trigger coverage on active development branch families.
- Creating a new certification branch from a proven development SHA preserves the frozen historical candidate while enabling exact candidate-specific CI; environment-specific evidence remains distinct.
- Candidate browser/final-regression evidence can be proven safely without mutating the candidate by isolated proof branches that checkout the exact candidate SHA and target the exact candidate deployment.

## 10. DURABLE RECONCILIATION LESSON — 2026-09-20
- A completed candidate technical gate set does not by itself authorize certification or Production mutation. Exact candidate evidence, external configuration blockers, and owner-level release authorization remain separate states.
- Before creating a new product SHA, reconcile the stored state against GitHub, deployment metadata/runtime, and live Supabase. If the exact SHA and evidence remain valid and no product defect exists, record reconciliation and continue at the release boundary instead of creating speculative work.
- Direct live verification of a SECURITY DEFINER function must inspect the effective definition and role privileges; source migration text alone is insufficient to prove live security state.
