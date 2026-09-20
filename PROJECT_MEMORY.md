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
- Development SHA: `72d5dae91ca7250c98ebb50d8b05409500f77c13`.
- PR #88: OPEN / DRAFT / MERGEABLE; base remains frozen historical candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
- Active certification branch: `certification/final-candidate-20260920-v3`, promoted fast-forward to exact SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080` after WIP proof closure.
- Previous exact candidate deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y` is historical for `72d5dae...`; new candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` is BUILDING and reports exact candidate SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080`.
- The previous candidate SHA `1366f8ea240f2b1c58d78a863aa7a5584be531fb` had complete technical evidence, but that evidence is historical and invalid for the new SHA.
- Production remains HOLD / NO TOUCH.
- Netlify exact-SHA deployment remains externally blocked by HTTP 403 account-credit exhaustion.
- Auth leaked-password protection remains an external Supabase Auth configuration warning; under the zero-cost constraint, do not upgrade Supabase solely to enable it.

## 4. LIVE SUPABASE TRUTH
- Project: `aghbari-commerce`; ref `mrcyqezbhpncuvaehwgf`; status `ACTIVE_HEALTHY`; PostgreSQL `17.6.1.166`.
- Customer invitation RPC boundary: service-role-only.
- Viewer read-only scope uses dedicated `is_staff_reader()` and targeted read policies; write-sensitive `is_staff()` remains distinct.
- Barcode RPC exposure was hardened: anon execution revoked; authenticated/service-role access according to the domain contract.
- Auth leaked-password protection remains an external Supabase Auth configuration warning.
- A direct query against `supabase_migrations.schema_migrations` returned no rows for versions `20260920000210` and `20260920000300`; therefore this query is not used as migration proof and no migration PASS is inferred from it.
- New live performance hardening migration `20260920000600_add_customer_invitation_fk_indexes.sql` is applied. It adds standalone indexes for `customer_invitations.customer_id` and `customer_invitations.created_by` to cover their foreign keys.

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
1. WIP SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080` passed the exact-SHA implementation/security/domain/order/migration/concurrency/browser/Test-the-Test gates and was promoted to the active certification branch.
2. New exact candidate Vercel deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` is BUILDING; old candidate deployment/browser/final-regression evidence for `72d5dae...` is not reusable.
3. Run exact candidate Deployment Browser proof and Final Regression against `1685836f4226fdcb3250a60eba7430ecf3e8f080` only after `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` is READY.
4. Preserve frozen historical candidate `2facceb...` and Production NO TOUCH.
2. Candidate deployment browser proof is complete on exact Vercel deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y` via `35479844177` / `105995552224`; Customer/Admin E2E both passed.
3. Final Regression is complete on the exact candidate deployment via `35479844177` / `105995552370`.
4. Preserve the evidence pack; certification remains a separate release-boundary decision and Production remains NO TOUCH.
5. Continue only zero-cost required hardening or directly useful backlog work; do not create speculative SHA changes.

### P1
6. Reassess the external Auth leaked-password warning only through a free/authorized path; do not pay or weaken controls merely to clear the advisor.
7. Reconcile deferred master-spec capabilities against product readiness.
8. Consolidate frontend/CSS historical layers only after reference proof and exact regression.

## 9. DURABLE EXECUTION LESSONS — 2026-09-20
- A single post-checkpoint commit can invalidate exact-SHA evidence even when the code change is only a test fixture. Treat every SHA change as an evidence reconciliation event.
- A later role-split migration (`20260920000410_split_customer_profile_role.sql`) redefined a SECURITY DEFINER invitation function with `search_path=public` and unqualified `digest()`, regressing the earlier hardened contract. The defect was exposed by exact concurrency proof.
- Corrective migration `20260920000500_harden_customer_invitation_crypto.sql` restores empty search_path, schema-qualified `extensions.digest()`, customer role semantics, and service_role-only execution. Live verification confirms the hardened definition and privileges.
- When workflow dispatch is unavailable, critical exact-SHA local browser/concurrency workflows require automatic trigger coverage on active development branch families.
- Creating a new certification branch from a proven development SHA preserves the frozen historical candidate while enabling exact candidate-specific CI; environment-specific evidence remains distinct.
- Candidate browser/final-regression evidence can be proven safely without mutating the candidate by isolated proof branches that checkout the exact candidate SHA and target the exact candidate deployment.
- A completed candidate technical gate set does not by itself authorize certification or Production mutation. Exact candidate evidence, external configuration blockers, and owner-level release authorization remain separate states.
- Before creating a new product SHA, reconcile stored state against GitHub, deployment metadata/runtime, and live Supabase. If the exact SHA and evidence remain valid and no product defect exists, record reconciliation and continue at the release boundary instead of creating speculative work.
- Direct live verification of a SECURITY DEFINER function must inspect the effective definition and role privileges; source migration text alone is insufficient to prove live security state.
- Performance-advisor `unindexed_foreign_keys` findings are actionable when they identify real FK columns lacking a standalone leading index. In this case, the existing `(organization_id, customer_id, created_at)` index did not satisfy the `customer_id` FK because `organization_id` was the leading key; adding standalone FK indexes was the correct low-risk hardening. Unused-index INFO immediately after creation is expected and is not evidence that the indexes should be removed.
- Live DDL and source migration must be advanced together: apply the exact migration, advance the candidate to the exact source SHA, and rebuild all SHA-bound evidence rather than allowing live/candidate drift.


## 10. DURABLE PROOF-HARNESS LESSON — 2026-09-20
- The isolated candidate Final Regression proof initially failed because the harness loaded `manifest.webmanifest` with Node `require()`, which treats the `.webmanifest` file as JavaScript instead of parsing JSON. This was a proof-system defect, not an application defect.
- The harness was corrected to use `JSON.parse(fs.readFileSync(...))`. A new isolated proof run `35479844177` then passed deployed artifact identity, security headers, Arabic/RTL shell, PWA manifest, and service worker checks against the exact candidate deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y` and exact product SHA `72d5dae91ca7250c98ebb50d8b05409500f77c13`.
- The proof path deliberately lives on `proof/candidate-release-20260920-v2` and checks out the candidate SHA explicitly, so proof-harness commits do not mutate or invalidate the candidate source.

## 11. DURABLE EXECUTION LESSON — RUN-2026-09-20-EXECUTE-014
- Candidate browser proof is now fully closed: exact Customer/Admin E2E and Final Regression both succeeded against the exact Vercel candidate deployment and SHA `72d5dae...`.
- Vercel runtime verification must use the deployment's actual Vercel project ID; a stale project ID can produce a misleading 403 and must not be interpreted as application failure or proof of no logs.
- The free-tier constraint is a release policy boundary: native Supabase leaked-password protection is an external paid-tier feature; do not create speculative architecture or a paid upgrade solely to clear that advisor.
- Durable execution routers must be reconciled whenever a later run exposes stale top-level SHA/state. Current canonical candidate state is `72d5dae...`.


## 12. DURABLE EXECUTION LESSON — RUN-2026-09-20-EXECUTE-016
- Test-the-Test `35481150811` / job `105999082463` was actually terminal SUCCESS; the prior router had stale IN_PROGRESS wording. Job-level terminal evidence overrides stale prose.
- Exact-SHA verification on `1685836f4226fdcb3250a60eba7430ecf3e8f080` succeeded across Quality `35481150809`, Security `35481150821`, G1 `35481150820`, Order Workflow `35481150804`, Deployment Browser Contract `35481150826`, Local Production Browser `35481150812`, Concurrency `35481150807`, Migration `35481150837`, Fresh Local Browser `35481150808`, and Test-the-Test `35481150811`.
- Active certification branch was advanced fast-forward to `1685836f4226fdcb3250a60eba7430ecf3e8f080`; frozen historical candidate `2facceb...` was not modified.
- Vercel created exact candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C`, currently BUILDING. This invalidates deployment/browser/final-regression evidence from `72d5dae...` for the new SHA.

## 13. DURABLE EXECUTION LESSON — RUN-2026-09-20-EXECUTE-016 FINAL RECONCILIATION
- All candidate-triggered exact-SHA revalidation workflows for `1685836f4226fdcb3250a60eba7430ecf3e8f080` completed SUCCESS: Fresh Local Browser `35483251620`; Local Production Artifact Browser `35483251716`; Migration `35483251634`; Test-the-Test `35483251636`; Concurrency `35483251748`; plus Order Workflow `35483251629`, Bootstrap `35483251637`, Exact Deployment Browser Contract `35483251669`, Security `35483251600`, G1 `35483251710`, and Quality `35483251704`.
- Exact candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` is READY and returns HTTP 200 for the deployed Arabic/RTL shell; deployment-scoped runtime error/fatal logs and project runtime error clusters were empty in the checked window.
- Full candidate Deployment Browser E2E and Final Regression remain a separate proof layer and have NOT been marked PASS in this execution because the connected GitHub capability exposes workflow runs/jobs but not workflow dispatch; no paid browser automation was used.

## 14. DURABLE EXECUTION LESSON — RUN-2026-09-20-EXECUTE-017
- Development branch `enhancement/market-ready-v4-20260918` advanced from `72d5dae91ca7250c98ebb50d8b05409500f77c13` to merged development SHA `cc9f5e7e1906b553613bb2e8dee99dacd704491d` through PR #93. The certification candidate `certification/final-candidate-20260920-v3` at `1685836f4226fdcb3250a60eba7430ecf3e8f080` was not modified.
- Core UI hardening implemented on isolated branch `execution/core-ui-20260920`: Command Palette now traps Tab focus, restores the invoking focus on close, and locks body scroll while open; customer catalog now renders an explicit zero-result state with a single clear-filter action.
- The isolated SHA `050d3ca52426d1ac688e91b933d35915745e97bd` completed full exact-SHA technical verification: application quality, security, G1, order workflow, migration, concurrency, Test-the-Test, Fresh Local Browser, Local Production Artifact Browser, and exact deployment browser contract all SUCCESS. Fresh/local browser runs completed real Customer/Admin paths and storage adversarial runtime successfully.
- The merged development SHA `cc9f5e7e1906b553613bb2e8dee99dacd704491d` was independently re-verified with the full available exact-SHA source/domain/security/browser suite: Quality `35484382281`, Security `35484382222`, G1 `35484382254`, Order Workflow `35484382288`, Bootstrap `35484382245`, Migration `35484382233`, Concurrency `35484382276`, Test-the-Test `35484382253`, Fresh Local Browser `35484382220`, Local Production Artifact `35484382242`, and Deployment Browser Contract `35484382224` — all SUCCESS.
- Vercel development deployment attempts are externally limited by the Free-plan build-rate-limit; this is recorded as a platform constraint, not a product defect. The candidate Vercel deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` remains READY and exact to candidate SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080`.
- Verification-only PR #94 and PR #95 were closed without merge. Production remains HOLD / NO TOUCH.
- Durable UI rules strengthened: modal/dialog surfaces must manage focus containment, focus restoration, and background scroll; data-heavy catalog surfaces must make loading/empty/error/success states explicit and actionable.
- Next concrete core-product gap identified for implementation, not yet changed in RUN-017: Quick Order resolves SKU/barcode only against the currently loaded catalog array. It should use a server-backed exact identifier fallback so scanner entry works even when the product is outside the first loaded catalog page. Keep this as an implementation front on development only; do not alter the frozen candidate or Production merely to address it.
