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
- PR #88: OPEN / DRAFT / MERGEABLE; base is `certification/final-candidate-20260918`.
- **Current development SHA: `9d2149de4bf3c491abad8460cab5df01c6faa4bd`.**
- The previous checkpoint SHA was `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`; current HEAD is exactly one commit ahead.
- Exact delta from `4f0a0614...` to `9d2149de...`: only `scripts/browser-e2e-seed.sql`, fixing the inactive browser product barcode fixture.
- Frozen candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — FROZEN / NO TOUCH.
- Production: HOLD / NO TOUCH.
- Exact current Vercel preview: `dpl_GVNskevLQiUCxAwqiHjuadLMg1is`, READY, exact Git SHA `9d2149de4bf3c491abad8460cab5df01c6faa4bd`.
- Exact current-SHA Browser E2E: SUCCESS — check `105988969179`, workflow run `35477420804`.
- Browser-contract: SUCCESS in workflow run `35477420804`.
- Vercel Preview Comments: SUCCESS, zero unresolved feedback — check `105988962012`.
- Production-smoke for the preview is SKIPPED; it is not production evidence.
- Previous exact `4f0a0614...` Migration `35477022461` and Test-the-Test `35477022490` both completed SUCCESS, but those PASSes are not automatically transferable to the newer `9d2149de...` SHA.
- Netlify remains externally blocked by HTTP 403 account-credit exhaustion; do not waste further attempts until the platform permits them.

## 4. LIVE SUPABASE TRUTH
- Project: `aghbari-commerce`; ref `mrcyqezbhpncuvaehwgf`; status `ACTIVE_HEALTHY`; PostgreSQL `17.6.1.166`.
- Customer invitation RPC boundary: service-role-only.
- Viewer read-only scope uses dedicated `is_staff_reader()` and targeted read policies; write-sensitive `is_staff()` remains distinct.
- Barcode RPC exposure was hardened: anon execution revoked; authenticated/service-role access according to the domain contract.
- Auth leaked-password protection remains an external Supabase Auth configuration warning.
- A direct query against `supabase_migrations.schema_migrations` returned no rows for versions `20260920000210` and `20260920000300`; therefore this query is not used as migration proof and no migration PASS is inferred from it.

## 5. VERIFIED PRODUCT / ARCHITECTURE KNOWLEDGE
- Customer invitation direct authenticated RPC exposure is revoked; privileged service-role path retained.
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
Unless explicitly implemented and proven, these remain backlog/deferred: promotions engine; notification center/provider delivery; integration delivery records/adapters; lots/batches/expiry/FEFO; reservations; independent fulfillment records; WhatsApp/Onyx provider adapters; centralized bilingual locale architecture.

## 8. NEXT EXECUTION QUEUE
### P0
1. Revalidate the affected release gates on exact SHA `9d2149de...`; do not inherit PASS from `4f0a0614...`.
2. Reconcile the complete development delta against frozen candidate `2facceb...` without touching the candidate.
3. Establish formal release/candidate readiness only from exact candidate evidence; certification remains NO until all required gates are proven.

### P1
4. Resolve/reassess Auth leaked-password protection through an authorized external configuration path.
5. Reconcile master specification vs implementation/deferred capabilities.
6. Consolidate frontend/CSS historical layers only after reference proof and exact regression.

## 9. DURABLE EXECUTION LESSON — 2026-09-20
A single post-checkpoint commit can invalidate exact-SHA evidence even when the code change is only a test fixture. The control protocol therefore treats **every SHA change as an evidence reconciliation event**, while allowing unaffected historical findings to remain audit context. Current exact-SHA browser proof must be established independently; no PASS is inherited merely because the delta appears low-risk.
