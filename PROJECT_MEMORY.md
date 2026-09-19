# الأغبري | Canonical Operating Memory
> **Single source of truth for future sessions/agents.** Read this file after the control-plane constitution and use it to decide where to resume. Do not re-scan closed work unless SHA/dependency/evidence changed.
> Product boundary: **Aghbari Commerce only**. Do not import scope, secrets, identities, or release decisions from Report-Advisor/Report-Engainall.

## 1. PRODUCT CONTRACT
- Brand/product: **الأغبري | Aghbari Commerce**
- Target: serious B2B merchant/store product for medium traders; sale-ready, not prototype/ERP clone.
- Core scope: catalog; authorized pricing; customer portal; orders/reorder/templates; inventory/warehouses/transfers/stock count; suppliers/purchasing/receiving; simple customer/supplier accounting (statements, invoices, payments, expenses); roles/permissions; import/export; invitations; audit/outbox/idempotency; PWA/offline primitives; controlled reporting gateway.
- Reporting boundary: Commerce remains transactional source of truth; reporting/BI stays outside the store model.
- UX: modern premium responsive UI, Arabic/RTL first with English-ready architecture; accessibility, keyboard/focus, mobile, clear loading/empty/error/success states.
- Market readiness: prioritize useful B2B speed, reliability, traceability, security, import/export, reorder, role controls, customer self-service; do not add BI/dashboard scope to Commerce.
- Future/conditional domain: promotions, reservations, lots/batches/expiry/FEFO, delivery/fulfillment provider layers, WhatsApp/Onyx provider adapters are not current proven runtime capabilities unless explicitly implemented and verified.

## 2. EXECUTION CONSTITUTION
- Start: read control plane → this file → latest state pointer; then verify reality and resume from OPEN/BLOCKED/RUNNING/NOT_PROVEN.
- No repeated full scans. Recheck only changed SHA, changed dependency, invalid/expired evidence, or a proof defect.
- No PASS without exact evidence. CODE ≠ TEST ≠ CI ≠ RUNTIME ≠ LIVE ≠ PRODUCTION.
- Never weaken assertions/security or invent evidence to close a gate.
- User command **1 = EXECUTE NOW**.
- Programmer owns technical architecture, implementation, refactoring, UI/UX, security, testing, performance, CI/CD, deployment engineering, and technical backlog. Escalate only material product/commercial/legal/irreversible-cost decisions.
- Production remains HOLD/NO NEW TOUCH until formal certification/release decision.
- Use compact evidence only: exact SHA, run/job, environment, artifact, result, key root cause. Never store raw logs here.

## 3. CURRENT CHECKPOINT (RECONCILED 2026-09-20)
- Repo: `Aghbari-Technologies/aghbari-commerce`
- Development branch: `enhancement/market-ready-v4-20260918`
- PR: #88 OPEN / DRAFT / MERGEABLE
- Current development SHA: `cb2707b8005ac8237b06a7c89cc9bcf68dc50061`
- Certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — FROZEN / NO TOUCH
- Last known exact Netlify deploy: `6aadaea0475017968f71cfda` READY; build-meta exact SHA cb2707...
- Proven on cb2707...: application quality, security audit, G1 domain proof, Supabase migration proof, sensitivity/test-the-test, exact Netlify browser proof, customer E2E, admin E2E.
- Formal Final Regression: NOT_PROVEN because connected GitHub surface exposes no workflow-dispatch operation.
- Production: HOLD / NO NEW TOUCH; the primary public Netlify artifact is a development SHA, not the frozen certification candidate.

## 4. LIVE SUPABASE TRUTH
- Project: `aghbari-commerce`
- Project ref: `mrcyqezbhpncuvaehwgf`
- Status: ACTIVE_HEALTHY
- PostgreSQL: 17.6.1.166
- Public tables: 58; RLS: 58/58; without RLS: 0.
- Public policies: 65.
- Public functions: 65; SECURITY DEFINER: 61.
- Anonymous EXECUTE on public functions: 0; authenticated EXECUTE: 61.
- Edge Functions: `outbox-worker` ACTIVE v1, custom token auth; `customer-invitations` ACTIVE v3, custom auth in body.
- Recent live migration head includes 2026-09-19 purchase receipt evidence / product media privilege / invitation lookup / notification / payment hardening.

## 5. FORENSIC FINDINGS — DO NOT REDISCOVER
### Confirmed legacy / duplication
- No exact duplicate Git blobs found.
- Active frontend entry is `src/main.tsx → AppV3Fixed.tsx`.
- `src/App.tsx` is a separate older/alternate full app path; not the active entry.
- CSS has historical layering. Active imports include styles.css, customer-portal-v3.css, customer-portal-v3-dynamic.css, offline.css, accessibility.css, product-excellence.css, command-palette.css.
- Strong unused/orphan candidates: `src/ui-polish.css`, `src/customer-portal-v3-enhancements.css`; many selectors in legacy portal/base CSS are unused on the active DOM.
- 130 Git branches exist; several certification/execution branches are aliases to identical SHAs. Clean refs later, never delete commits or active proof refs blindly.
- 96 Supabase migrations exist. They are historical replay state; do not delete/rewrite migrations merely to make the repo look clean.
- SQL test numbering has repeated prefixes (e.g. 010–015); naming debt, not a runtime defect.
- Performance advisor reports many idx_scan=0 indexes; with tiny current data this is not proof an index is useless. Do not delete PK/FK/business indexes without workload evidence.

### Confirmed contract gaps
- **Viewer routing gap:** DB enum has owner/admin/sales/warehouse/viewer; active frontend STAFF_ROLES omits viewer, so viewer does not enter the staff/admin route.
- **Barcode gap:** DB products.barcode exists and get_catalog search can match barcode, but Product/CatalogItem omit barcode and Quick Order directly matches SKU; UI labels the field "SKU / barcode". This is a real implementation mismatch.
- **Promotions:** no runtime promotion engine/table surface proven even though the master specification describes it as a bounded context.
- **Notifications:** backend table/triggers exist, but no dedicated customer/admin notification center/provider delivery proof is established.
- **Integrations:** outbox + worker exist; general adapter/provider/delivery-record chain is not fully proven. WhatsApp provider adapter is not implemented/proven. Onyx-specific provider adapter is not implemented/proven.
- **Conditional domains not currently implemented/proven:** lots/batches/expiry/FEFO, reservations, independent delivery/fulfillment records.

### Confirmed security boundary needing action
- Supabase security advisor currently reports 58 authenticated-callable SECURITY DEFINER warnings. Most reviewed functions use `SET search_path TO ''` and internal role/org/customer checks.
- `public.consume_customer_invitation(text, uuid)` is SECURITY DEFINER and callable by authenticated. It validates token and invitation state but does not bind `p_user_id` to `auth.uid()`. The current Edge Function calls it with service_role after creating the user. Preferred hardening: revoke authenticated EXECUTE; keep service_role path; prove direct RPC is denied while invitation acceptance still works.

## 6. VERCEL / EXTERNAL BLOCKER
- Connected Vercel team: `Aghbari-Technologies` / `team_xN16zQ6PKax27q3eWR7YockV`.
- Vercel currently exposes many projects (11 observed), including candidate/probe projects and older web projects.
- Candidate Vercel project `aghbari-exact-candidate-2facceb3`: READY production deployment `dpl_BKrMGyXsgRZ4PLuMnDPQeY6Qb2g5`.
- Probe project `aghbari-candidate-probe-2facceb3`: READY production deployment `dpl_7utBo6uJsp3inTPop8nrxjicmt7r`.
- `aghbari-commerce-c2dd` has many historical deployments; do not create unnecessary new Vercel deploys.
- Current external risk: Vercel Hobby uses rolling deployment limits; Vercel also now applies a 10GB deployment-storage budget to Hobby teams and retention pruning. Verify quota before creating more deployments.
- The connected Vercel deployment action is currently unavailable/broken in this session; do not fabricate a deploy result.
- TinyFish browser automation is not available currently because its wallet is below zero; do not retry until external capacity is restored.
- When Vercel is available again: prefer one exact-artifact validation and promote/reuse rather than repeated rebuilds; clean old experiment projects/deployments only when their refs/production aliases are proven nonessential.

## 7. NEXT EXECUTION QUEUE
### P0
1. Harden invitation RPC exposure: revoke authenticated EXECUTE on `consume_customer_invitation(text,uuid)`; create a reproducible migration in source control; verify service-role acceptance path and direct authenticated denial.
2. Fix active frontend role routing for `viewer`; add exact role-matrix tests.

### P1
3. Complete barcode contract end-to-end: domain model, catalog mapping, Quick Order, Excel Quick Order, search tests.
4. Reconcile master spec with implementation: explicitly classify Promotions, Notifications UI, Integration Delivery, WhatsApp/Onyx adapters, and conditional inventory domains as implemented/proven or deferred.

### P2
5. Consolidate frontend to one canonical app path; archive/delete only after import/reference proof.
6. Consolidate CSS into one design-system hierarchy; remove confirmed-unused files/selectors after proof.
7. Clean duplicate Git refs after verifying PR/proof/deployment references.
8. Improve test naming/organization without weakening test-the-test sensitivity.

### P3
9. Future roadmap: promotions engine; notifications center; integration delivery records/adapters; barcode identifiers as first-class model; lots/batches/expiry/FEFO; delivery/fulfillment; WhatsApp/Onyx provider adapters; bilingual product UI/locale architecture.

## 8. RELEASE/PROOF RULES
- New SHA is justified only by a real fix or source-of-truth correction.
- Historical PASS belongs only to the exact SHA/environment it names.
- Never use development SHA evidence to certify frozen candidate.
- Never use SQL-only evidence as browser/runtime proof.
- Never use queued outbox as delivery proof.
- Never treat Vercel quota failure as product failure.
- Every execution must end by updating this hub with: run id, exact SHA, changes, evidence, remaining blockers, next resume command.

## 9. MARKET / LANGUAGE BASELINE
- Arabic/RTL is first-class.
- English is required as a supported language path; architecture should use centralized labels/locale dictionaries, not scattered hard-coded strings.
- Keep scope B2B commerce; avoid copying BI/reporting product surfaces into Commerce.
- Differentiation should come from speed, controlled pricing, customer self-service, reorder/templates, import/export, inventory integrity, traceability, permissions, offline resilience, auditability, and integration readiness.

## 10. HISTORY POINTER
Detailed historical evidence remains in Git for audit/reconstruction. Do not load it during normal startup. Only inspect a historical file when the current hub identifies a dependency/evidence conflict requiring it.
