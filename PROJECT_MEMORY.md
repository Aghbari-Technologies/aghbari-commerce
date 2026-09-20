## RUN-2026-09-21-EXECUTE-UI-009
- Latest UI exact SHA: `7b9c0efa4fd04a30d80952dce55ddad52ee52ae4`
- Concrete UI hardening since UI-008: customer portal branding localized to `تجارة B2B`; executive dashboard footer now translates role keys to Arabic.
- Exact source re-read after both changes.
- Current-SHA CI: expect fresh queued/pending verification; no PASS until terminal evidence exists.
- Vercel: deployment-rate-limited for the current free window; no current-SHA deployment proof. No Production touch.
## RUN-2026-09-21-EXECUTE-UI-008 — UI EXECUTION CHECKPOINT
- Exact UI head: `41ee8dba7968124f2b6649e0b1347250c5a3a118` on `execution/customer-ui-completion-20260920`; PR #100 remains development-only.
- Latest concrete UI fixes: customer/order filters; responsive filter styling; consistent Arabic product terminology; functional browser voice search; removal of dead image-search action.
- Voice search uses Arabic locale `ar-YE`, focuses catalog query state, and reports unsupported-browser / permission failures without pretending success.
- No candidate or production changes.
## RUN-2026-09-21-EXECUTE-UI-007 — UI COMPLETION CHECKPOINT
- Exact UI head is `a5369f4a17147c315f571c84743ed3682e4b2337` on `execution/customer-ui-completion-20260920`; PR #100 remains OPEN/DRAFT/MERGEABLE.
- Implemented UI usability upgrades: customer directory filtering; purchase-order filtering; localized customer-facing operational terminology; reporting gateway action wording made explicit.
- Product/business/candidate/production boundaries unchanged.
- Verification status is SHA-bound: current branch has queued exact-SHA gates; no prior PASS is reused.
## RUN-2026-09-21-EXECUTE-UI-006 — AUTHORITATIVE UI/CI CHECKPOINT
- Exact UI head: `629ecad26367a6c860e10a668d5ec71f34ae9083` on `execution/customer-ui-completion-20260920`; PR #100 remains OPEN / DRAFT / MERGEABLE.
- Final UI code fixes in this lane: visible-vs-total catalog count wording; per-order reorder busy guard with guaranteed cleanup.
- CI trigger hardening: product verification push triggers were restricted to controlled product branches/families, excluding `ops/**`, while preserving development/certification/proof/release coverage.
- Vercel exact deployment `dpl_4GPcZtQPW7Y9LYF1FV4Lyj4EBXtx` is READY for the exact SHA `629ecad26367a6c860e10a668d5ec71f34ae9083`.
- Exact-SHA CI is not yet terminal; queued/pending is not PASS. No previous-SHA proof is reused.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain untouched.

## RUN-2026-09-21-EXECUTE-UI-005 — UI EXECUTION CHECKPOINT
- Active UI branch: `execution/customer-ui-completion-20260920`; exact SHA: `2490f7f47c2837aade96e854392ba297b94efdfb`; PR #100 remains OPEN / DRAFT / MERGEABLE.
- Product/UI corrections implemented: the customer catalog hero statistic now labels the paginated count accurately (visible vs fully loaded); order reordering now uses a dedicated per-order busy state and always clears it in `finally`, preventing repeated concurrent reorder actions and preserving feedback on failure.
- Exact Vercel deployment `dpl_5SWnt86P56xTYZV8yxNSE3Jmtay9` is READY and reports the exact source SHA. This establishes deployment/build evidence, not browser proof.
- Fresh exact-SHA CI for `2490f7f47c2837aade96e854392ba297b94efdfb`: 12 verification runs are queued. No PASS has been transferred from any previous SHA.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain untouched.
- Durable lesson: when equivalent exact-SHA verification runs already exist and are queued, reconcile those runs instead of creating additional duplicates; queue volume is itself an operational blocker and does not reduce proof requirements.

## CURRENT AUTHORITATIVE RECONCILIATION — 2026-09-21B
- Active UI SHA: `0e23965179818904d62d7577abb919cca16593a6` on `execution/customer-ui-completion-20260920`; PR #100 OPEN / DRAFT / MERGEABLE.
- UX correction: template terminology is now consistently «قالب/قوالب» across visible customer UI strings in `src/AppV3Fixed.tsx`; exact scan found zero legacy `مسحة` terms.
- Exact Vercel deployment `dpl_5SWnt86P56xTYZV8yxNSE3Jmtay9` is BUILDING and must be treated as a new verification unit.
- G1 run `35544020449` is QUEUED; no terminal PASS.
- Previous exact-SHA evidence for `7f1b523...` is invalid for `0e23965179818904d62d7577abb919cca16593a6`.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain untouched.

## CURRENT AUTHORITATIVE RECONCILIATION — 2026-09-21
- Aghbari Commerce active UI branch: `execution/customer-ui-completion-20260920`.
- Current exact UI SHA: `7f1b523319d74aa17f549c49db0f52482df5c00b`; PR #100 OPEN / DRAFT / MERGEABLE against `enhancement/market-ready-v4-20260918`.
- Vercel exact deployment `dpl_Gs339VatHiPGCVhv46UF7ot1HiTE` is READY and reports the same source SHA.
- The preview is protected: direct external fetch redirected to Vercel SSO; a generated share-access URL also failed to yield a browser-renderable page through the available fetch path. This is proof-boundary information only; it does not establish a product UI failure or a browser PASS.
- G1 Domain Proof `35543639501` / job `106165620419` is still QUEUED; no terminal PASS.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain untouched.
- Evidence remains exact-SHA scoped; no prior UI/Candidate PASS is transferred to `7f1b523319d74aa17f549c49db0f52482df5c00b`.

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
- Development SHA: `a9dd58a111138d8a0b12e5e5f5582b74395da79c` (active UI completion SHA; PR #100).
- PR #100: OPEN / DRAFT; head `a9dd58a111138d8a0b12e5e5f5582b74395da79c`; base `enhancement/market-ready-v4-20260918`. Candidate and Production remain untouched.
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


## 15. DURABLE EXECUTION CHECKPOINT — RUN-2026-09-20-EXECUTE-018
- The next approved product front is server-backed Quick Order exact SKU/barcode fallback. Development implementation exists on branch `execution/quick-order-server-lookup-20260920`, rooted directly at verified development SHA `cc9f5e7e1906b553613bb2e8dee99dacd704491d`.
- PR #96 is now correctly targeted at development branch `enhancement/market-ready-v4-20260918`; its exact compare is only 6 commits / 2 changed files (Quick Order UI lookup path + browser regression), with no candidate or Production changes.
- The implementation uses the existing authorized `get_catalog_with_barcode` server path when the identifier is absent from the loaded page, preserving tenant/warehouse authorization rather than widening client-side visibility.
- Exact-SHA verification is in progress on head `483f9722f226c5f295c96edde2be88d760ceb520`. Completed: Quality `35485184032`, Security `35485184013`, G1 `35485184157`, Order Workflow `35485184016`, Bootstrap `35485184015`, Fresh Local Browser `35485184014`. In progress: Test-the-Test `35485184023`, Concurrency `35485184025`, Local Production Artifact Browser `35485184035`.
- Vercel status for this development PR is an external Free-plan `api-deployments-free-per-day` failure; it is not treated as a product failure and does not alter the certification candidate.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080`, candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C`, frozen historical candidate, and Production remain unchanged.


## 15. DURABLE EXECUTION LESSON — RUN-2026-09-20-EXECUTE-018
- Development-only Quick Order enhancement implemented on `execution/quick-order-server-lookup-20260920`: when SKU/barcode is not present in the loaded catalog page, Quick Order falls back to an authorized server-backed catalog lookup scoped to the active warehouse, then applies the existing exact-identifier and availability checks.
- Added a real Customer browser regression that first filters the visible catalog to zero results, then resolves same-tenant authorized SKU `BROW-001` from the server through Quick Order. This prevents a false-positive local-array lookup.
- A first regression attempt used Tenant-B SKU `BROW-002` from Tenant-A and correctly failed with `السلة 0`; this was a test-fixture error, not an application defect. The fixture source proved tenant ownership, and the test was corrected to same-tenant `BROW-001`.
- The implementation first hit a lint-only failure due to obsolete `canAdd`; it was removed without changing behavior. Final exact implementation SHA `483f9722f226c5f295c96edde2be88d760ceb520` passed the complete source/domain/security/browser suite.
- Final development merge SHA is `d8b627bd884c61c0f7f3a18dda1b0e880ef6735c`; this merged SHA was independently re-proven with Quality `35485501859`, Security `35485501878`, G1 `35485501813`, Order Workflow `35485501833`, Bootstrap `35485501857`, Migration `35485501888`, Concurrency `35485501822`, Test-the-Test `35485501844`, Fresh Local Browser `35485501838`, Local Production Artifact `35485501817`, and Exact Deployment Browser Contract `35485501836` — all terminal SUCCESS.
- Certification candidate remains frozen at `1685836f4226fdcb3250a60eba7430ecf3e8f080`; candidate CommandPalette remained its original SHA `8caba0275eea42bb3ddf54f69d54aadb48f0a2f9` and candidate Vercel deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` remains READY. Production remains HOLD / NO TOUCH.
- Vercel development deployment remains constrained by the external Free-plan build-rate-limit; this is not a product defect and no release decision was made from that blocker.
- Durable acceptance rule: core B2B scanning/order flows must resolve exact product identifiers against authorized server truth when the current page is incomplete; browser tests must prove same-tenant behavior rather than relying on seeded cross-tenant assumptions.

## 16. DURABLE EXECUTION LESSON — RUN-2026-09-20-EXECUTE-020
- Active application entrypoint confirmed: `src/main.tsx` renders `AppV3Fixed`; future customer-portal UI changes must target `src/AppV3Fixed.tsx` and its active CSS layers, not obsolete `src/App.tsx`.
- Customer portal UI hardening implemented on `execution/customer-ui-completion-20260920`, current exact head `1c759469994ad4fa4cb85f8c9fd09add810466e0`, PR #100. Changes separate catalog fetching from operational orders/finance data so catalog search no longer reloads those datasets per keystroke; add search reset/context, loading skeletons, accessible dialog semantics + Escape dismissal, meaningful product image alt text, responsive mobile navigation, responsive staff shell, and role-aware staff section shortcuts.
- Added browser coverage for the new customer search-reset/modal keyboard path and staff shortcut rail. No transactional truth, tenant boundary, or reporting-boundary model was changed.
- CI proof-routing PR #99 was revalidated at exact SHA `3aafdf19c8a8affc0af8cb0692d81a15e512dcd1`: all tracked exact-SHA workflows terminal SUCCESS, including Test-the-Test `35486034020`; merged into development as `35d95e5e140820c7e7a8e0a792f89b28eacfb8e8`.
- UI PR #100 is intentionally still OPEN / DRAFT while its exact-SHA workflows are QUEUED. Vercel reports the known Free-plan deployment rate limit; that status is not product proof and no paid upgrade is authorized.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080`, candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C`, frozen historical candidate, and Production remain untouched.
- Durable UX rule: loading/search/empty/error/accessibility states are part of the product contract, and high-frequency customer search must not refetch unrelated operational datasets on every query change.


## RUN-2026-09-20-EXECUTE-020 — FINAL CHECKPOINT CORRECTION
- Active UI implementation branch: `execution/customer-ui-completion-20260920`.
- Current exact UI head: `2e714043e198feec70be226bc00e474d91a332d1`. PR #100 remains OPEN / DRAFT against `enhancement/market-ready-v4-20260918`.
- The UI branch includes a final pricing-integrity correction: catalog refresh now fetches customer price tiers for both visible catalog products and all saved cart product IDs, so an off-screen cart line does not lose its applicable tier price after search/filter changes.
- GitHub Actions for exact UI SHA `2e714043e198feec70be226bc00e474d91a332d1` are present but currently QUEUED; no UI PASS is claimed. Vercel remains Free-plan deployment-rate-limited and is not used as product proof.
- The earlier UI checkpoint at `1c759469994ad4fa4cb85f8c9fd09add810466e0` is superseded by `2e714043e198feec70be226bc00e474d91a332d1`; do not reuse evidence from the superseded SHA.


## RUN-2026-09-20-EXECUTE-021 — UI LINT RECONCILIATION
- Prior SHA: `2e714043e198feec70be226bc00e474d91a332d1`; Application Quality run `35486580912` failed only on ESLint prefer-const at src/AppV3Fixed.tsx:59:543. Typecheck and 217/217 unit/integration tests passed on that exact SHA.
- Root cause: grouped price-tier accumulator was declared with let without reassignment.
- Final corrected SHA: `a9dd58a111138d8a0b12e5e5f5582b74395da79c`; declaration is now const grouped:Record<string,PriceTier[]>={}.
- Temporary self-healing workflow used to recover the blocked source-edit path was fully removed; final branch contains no repair workflow.
- New exact-SHA verification suite is triggered for `a9dd58a...` and currently queued; no prior PASS is reused across the SHA change.
- Netlify public site reports old build SHA `07c3cab1724d54d34234d67250276ac12968e14e`; Vercel PR deployment is externally rate-limited. Neither is current UI proof.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain NO TOUCH / HOLD.


RUN-2026-09-20-EXECUTE-022 — WORLD-CLASS UI/UX ADVANCEMENT
- OBJECTIVE: upgrade Aghbari Commerce customer + staff interfaces from functional operational styling to a cohesive premium B2B SaaS visual system, without changing transactional truth, permissions, reporting boundary, or candidate/production state.
- EXACT UI HEAD: `b4c6686761d56a4e3ddf813e30f0d80b654037d5` on `execution/customer-ui-completion-20260920`; PR #100 remains OPEN / DRAFT targeting `35d95e5e140820c7e7a8e0a792f89b28eacfb8e8`.
- IMPLEMENTED: 184-line visual-system layer followed by a finishing pass in `src/customer-portal-v3-dynamic.css` (+ premium identity, authentication, admin surfaces, responsive behavior, interaction states, order/finance hierarchy, mobile navigation/shell). Two commits: `b4fc4fdc6b9cd68ed124b87b85e20d1378e67a92` then `b4c6686761d56a4e3ddf813e30f0d80b654037d5`.
- CHANGE SURFACE: second commit is exactly one file: `src/customer-portal-v3-dynamic.css`, 184 additional lines; no application logic or data model changed.
- DESIGN STANDARD: elevated hierarchy, restrained teal/navy brand language, glass/frosted chrome only where useful, stronger cards/surfaces, product-grid density, mobile-first controls, accessible focus/hover states, explicit loading/empty/error/success affordances, and staff/admin operational readability.
- PROOF RULE: all prior UI evidence for SHA `a9dd58a...`, `006f5e98...`, or `b4fc4fd...` is stale for this exact HEAD until revalidated. Do not transfer PASS.
- CURRENT CI OBSERVATION: exact-SHA workflow runs for `b4c6686761d56a4e3ddf813e30f0d80b654037d5` have not yet produced a terminal proof set at the time of this record; prior commit `b4fc4fd...` had partial/active gates before this second UI commit. No certification PASS is claimed.
- VERCEL / NETLIFY: known external free-tier deployment constraints remain unchanged; not converted into product proof.
- CANDIDATE `1685836f4226fdcb3250a60eba7430ecf3e8f080` remains untouched. PRODUCTION remains HOLD / NO TOUCH.


## RUN-2026-09-20-EXECUTE-023 — UI FINISHING FIX + EXACT-SHA RECONCILIATION
- EXACT UI HEAD: `bc3e66b8ef69c381d9750ef54551a9a526e88554` on `execution/customer-ui-completion-20260920`; PR #100 OPEN / DRAFT → `35d95e5e140820c7e7a8e0a792f89b28eacfb8e8`.
- ROOT FIX: the new header brand mark was changed from a floating pseudo-element to an absolutely positioned mark with reserved inline space, preventing accidental layout participation in the flex/grid header and stabilizing RTL/mobile rendering.
- SOURCE SURFACE: `src/customer-portal-v3-dynamic.css` only in this finishing commit; no transactional logic, data model, pricing truth, permissions, or reporting-boundary change.
- PROOF RULE: `bc3e66...` is a new SHA; no PASS transfers from `b4c668...`, `b4fc4fd...`, `006f5e98...`, or any earlier UI SHA.
- CURRENT CI: fresh exact-SHA workflows for `bc3e66b8ef69c381d9750ef54551a9a526e88554` must be treated as the sole proof unit. No certification/merge PASS is claimed until required terminal checks are observed.
- CANDIDATE `1685836f4226fdcb3250a60eba7430ecf3e8f080` remains untouched. PRODUCTION remains HOLD / NO TOUCH.
- DEPLOYMENT CONSTRAINTS: Vercel Free-plan development deployment rate-limit and Netlify account-credit exhaustion remain external constraints; neither is used as product PASS/FAIL.


## RUN-2026-09-20-EXECUTE-023 — LIVE CI RECONCILIATION
- Latest exact-SHA CI observation for `bc3e66b8ef69c381d9750ef54551a9a526e88554`: G1 run 35488858872 SUCCESS; Order Workflow 35488856980 SUCCESS; Exact Deployment contract run 35488856986 SUCCESS with browser-e2e SKIPPED; Local Production Artifact 35488856969 RUNNING; Fresh Local Supabase 35488856975 RUNNING; Migration 35488856972 RUNNING; Concurrency 35488856971 RUNNING; Security 35488856994 QUEUED; Application Quality 35488856970 QUEUED; Test-the-Test 35488856978 QUEUED; second G1 run 35488856976 RUNNING. No certification/merge PASS is claimed.

## RUN-2026-09-20-EXECUTE-024 — UI COMPONENT COMPLETION + VISUAL PROOF FRONT
- EXACT CURRENT UI HEAD: `97431d5a39c28f03b77ad03717caa7c82c8ba621` on `execution/customer-ui-completion-20260920`; PR #100 remains OPEN / DRAFT.
- UI SOURCE COMPLETION: added 303 lines to `src/customer-portal-v3-dynamic.css` for secondary workflow surfaces that were previously visually incomplete: staff command bar, order selection, product-detail modal, Excel review rows, cancelled-order note, offline/recovery center, sales-chart containment, and responsive mobile variants.
- STATIC UI COVERAGE CHECK: audited React className tokens against all five active UI stylesheets on the exact HEAD; 137 class tokens checked, unstyled-class result reduced to `0`.
- VISUAL REVIEW COVERAGE: added `e2e/ui-visual-review.spec.ts` and `.github/workflows/ui-visual-review.yml`. The exact-SHA browser review verifies Arabic `lang/dir`, no horizontal overflow at 1440px and 390px, customer/staff key surfaces, and uploads four full-page screenshots as 7-day artifacts.
- EXACT-SHA RULE: current visual and verification unit is `97431d5...`; no prior SHA evidence is transferable.
- CURRENT CI FOR `97431d5...`: fresh runs were created for Security, Quality, Migration, Concurrency, Order, Fresh Browser, Local Browser Artifact, Exact Deployment contract, G1, Test-the-Test, plus the new UI Visual Review. At the latest checkpoint they were QUEUED; no PASS or merge is claimed.
- VERCEL: active team is `Aghbari-Technologies`; current project list identifies `aghbari-commerce-c2dd` as project `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`. Latest READY deployment observed is SHA `03e1e7...`, not current UI HEAD, so it is not current UI proof.
- CANDIDATE `1685836f4226fdcb3250a60eba7430ecf3e8f080` and PRODUCTION remain untouched / HOLD.


## RUN-2026-09-20-EXECUTE-024 — UI COMPONENT COMPLETION + VISUAL PROOF FRONT
- EXACT CURRENT UI HEAD: `97431d5a39c28f03b77ad03717caa7c82c8ba621` on `execution/customer-ui-completion-20260920`; PR #100 remains OPEN / DRAFT.
- UI SOURCE COMPLETION: added 303 lines to `src/customer-portal-v3-dynamic.css` for secondary workflow surfaces previously visually incomplete: staff command bar, order selection, product-detail modal, Excel review rows, cancelled-order note, offline/recovery center, sales-chart containment, and responsive mobile variants.
- STATIC UI COVERAGE CHECK: audited React className tokens against all five active UI stylesheets on the exact HEAD; 137 class tokens checked, unstyled-class result reduced to `0`.
- VISUAL REVIEW COVERAGE: added `e2e/ui-visual-review.spec.ts` and `.github/workflows/ui-visual-review.yml`. Exact-SHA browser review verifies Arabic `lang/dir`, no horizontal overflow at 1440px and 390px, customer/staff key surfaces, and uploads four full-page screenshots as 7-day artifacts.
- CURRENT CI FOR `97431d5...`: fresh runs were created for Security, Quality, Migration, Concurrency, Order, Fresh Browser, Local Browser Artifact, Exact Deployment contract, G1, Test-the-Test, plus the new UI Visual Review. Latest checkpoint: QUEUED; no PASS or merge is claimed.
- VERCEL: active project is `aghbari-commerce-c2dd` / `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`. Latest READY deployment observed is SHA `03e1e7...`, not current UI HEAD, so it is not current UI proof.
- CANDIDATE `1685836f4226fdcb3250a60eba7430ecf3e8f080` and PRODUCTION remain untouched / HOLD.


### RUN-2026-09-20-EXECUTE-024 LIVE RECONCILIATION
- Exact UI HEAD remains 97431d5a39c28f03b77ad03717caa7c82c8ba621.
- UI Visual Review run 35489157936 / job 106020938737 is IN_PROGRESS and has already proved exact checkout, clean npm install, and Supabase CLI setup; current step is isolated local Supabase startup.
- Other fresh exact-SHA gates for this HEAD remain queued at this checkpoint; no terminal PASS is claimed.
- PR #100 remains OPEN / DRAFT; candidate 1685836f4226fdcb3250a60eba7430ecf3e8f080 and Production remain untouched.


## RUN-2026-09-20-EXECUTE-025 — VISUAL REVIEW DEFECT FIX
- Exact UI fix SHA: 79267d3d8634ee2b65aab2763b7717eb503e2bcb.
- Browser visual artifacts from exact SHA 97431d5 exposed a real defect: the legacy floating command launcher covered product content on desktop/mobile while the header/bottom navigation already exposed the same command center.
- Root cause: duplicate fixed-position .command-launch control remained from an older command-palette implementation while AppV3Fixed also renders command-launch-button and mobile bottom-nav commands.
- Fix: removed the redundant floating control from AppV3Fixed, removed its obsolete CSS, and added an exact UI regression assertion that .command-launch count is zero in both customer desktop/mobile visual tests.
- Transactional/business logic and candidate/Production state were not changed.
- Fresh exact-SHA verification was triggered for 79267d3; latest observed state is queued across all required gates. No PASS is claimed yet.


## RUN-2026-09-20-EXECUTE-026 — EXECUTIVE DASHBOARD STATE REFINEMENT
- Exact UI HEAD: 75b0192f3bb6f5302c202330154649c07786d199.
- Root UI refinement: executive dashboard now preserves independently successful metrics when one query fails, marks failed metrics as unavailable instead of presenting false zeroes, and keeps the affected operational list explicitly degraded.
- Empty seven-day sales now render as an intentional empty state instead of a large blank chart area.
- Static UI coverage audit on this HEAD: 138 React class tokens checked across active UI stylesheets; missing styled classes = 0.
- Fresh exact-SHA verification suite was triggered for this HEAD; latest checkpoint all runs are queued. No PASS or merge is claimed.
- Candidate 1685836f4226fdcb3250a60eba7430ecf3e8f080 and Production remain untouched.


## RUN-2026-09-20-EXECUTE-027 — UI REGRESSION GUARDS
- Exact UI HEAD: bc156704980a29d4fffa97f2e72db44beebe654b.
- Added visual regression guards: desktop customer UI must hide portal-bottom-nav; mobile customer UI must show it; floating legacy command launcher must remain absent.
- This specifically protects against the layering defect found in exact visual artifacts for 97431d5.
- Candidate 1685836f4226fdcb3250a60eba7430ecf3e8f080 and Production remain untouched.
- Fresh exact-SHA verification suite for bc1567049 was created; latest observed state all queued. No PASS or merge is claimed.


## DURABLE PRODUCT/UI QUALITY DIRECTIVE — 2026-09-21
- The master boot now contains a mandatory Product/UI Quality Gate. Aghbari Commerce must be treated as a serious sale-ready B2B/ERP product, not a prototype, generic CRUD app, or decorative KPI dashboard.
- UI completion requires real functionality plus coherent Arabic/RTL design system, strong information architecture, responsive desktop/tablet/mobile behavior, data-dense operational surfaces, explicit loading/empty/error/success/permission/offline states, accessibility/keyboard/focus behavior, and exact-SHA browser visual evidence.
- The user-provided reference screen is the minimum maturity bar, not a literal design to copy. The goal is comparable operational and visual maturity under Aghbari branding and scope.
- No invented metrics, fake data, placeholder controls, or decorative links may be used to make a screen appear complete.
- Required primary surfaces include executive/admin operations, sales/orders, purchasing, inventory/warehouses/stock count, customers, suppliers, finance/statements, product/category/pricing, import/export, client controls/settings, invitations, B2B catalog/cart/checkout/order history/templates/financial center, and mobile purchasing flows.
- Evidence from one SHA must never be reused for another SHA; implementation, browser visual proof, certification, and production remain separate states.


## CURRENT UI EXECUTION — 2026-09-21
- Active UI branch: `execution/customer-ui-completion-20260920`.
- Latest UI SHA: `c481db25ab046b73bec3693944a7cbcfc8369835`.
- Implemented: unified Aghbari design-system layer loaded by `src/main.tsx`; staff shell alignment; premium RTL executive dashboard layout; operational insight modules; role-aware navigation anchors; stronger admin operations/forms/tables; customer portal visual consistency; responsive desktop/tablet/mobile states; duplicate staff identity mark removed.
- Executive dashboard now exposes real low-stock operational signals from `getLowStock()` for permitted staff roles and includes actionable recommendation cards. No synthetic business metrics were introduced.
- Admin navigation anchors now point to the actual product, orders, customers, inventory, purchasing, finance, export, and settings sections.
- Current Vercel deployment for this exact SHA: `dpl_Hr162D72YEvrVu1rUWemkPwF3iYe` QUEUED. Latest READY UI deployment before this SHA is `dpl_Ac6FCRRWjiMbBfH4nms9sApLcYo9` for SHA `0b0d6051fab859a1f12b3fa67860f00ec91b3db1`; it is not evidence for current SHA.
- Exact-SHA UI Visual Review run `35542432570` is QUEUED; all other exact-SHA product/security/browser gates for `c481db25ab046b73bec3693944a7cbcfc8369835` are also QUEUED at latest observation. No PASS transferred from prior SHA.
- TinyFish visual automation was not used because the connected wallet is below zero; no paid workaround used.
- Certification Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain untouched / NO TOUCH.


## CURRENT EXECUTION RECONCILIATION — RUN-2026-09-21-EXECUTE-UI-001
- Active development/UI branch: `execution/customer-ui-completion-20260920`.
- Exact current UI SHA: `255ee1484d0c0192034fe4a277ac27b4c7b875cc`.
- UI changes after `c481db25...`: encoded 120-minute UI coverage + session-resume rules in the execution-start router; removed the unconsumed one-time dependency-refresh workflow/marker after no authoritative package-lock regeneration occurred; restored the locked-stack ESLint config; added a modern CSS interaction/rendering baseline using safe browser primitives (color-scheme, scrollbar-gutter, text-wrap, contain/content-visibility where supported, touch-action, accent-color, safe-area spacing).
- Actual locked frontend stack remains: React 19.1.1, React DOM 19.1.1, Vite 7.3.5, TypeScript 5.9.2, Vitest 3.2.4, Supabase JS 2.112.4, Playwright 1.63.0, ESLint 9.35.0.
- Current validated newer releases are recorded as an upgrade target, not as installed truth: React 19.3.x, Vite 8.3.x, TypeScript 7.0.x, Supabase JS 2.116.x, Vitest 5.x, ESLint 10.x. A full dependency upgrade requires deterministic lockfile regeneration and exact-SHA regression; do not claim it as completed until that proof exists.
- Latest Vercel deployment for exact SHA `255ee1484d0c0192034fe4a277ac27b4c7b875cc`: `dpl_9S5oxwqv2cY5BmMD4JTgYNT3raYC` — QUEUED at latest observation. Prior deployment READY states are not current-SHA evidence.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain HOLD / NO TOUCH.
- Resume pointer: reconcile exact-SHA CI + Vercel state for `255ee1484d0c0192034fe4a277ac27b4c7b875cc`; then repair any exact-SHA failure before further UI expansion. Do not reuse prior SHA PASS evidence.


## CURRENT EXECUTION RECONCILIATION — RUN-2026-09-21-EXECUTE-UI-002
- Active UI branch: `execution/customer-ui-completion-20260920`.
- Exact current UI SHA: `509b6597f956e4242da947e01a1890eca4164cf0`.
- Added ES2024 as the TypeScript language baseline (`target` and `lib`) without changing runtime dependency versions.
- Added safe modern browser UI primitives for rendering/interaction and mobile safe-area handling; retained no-business-logic-change discipline.
- Locked package versions remain the actual installed truth; newer external releases remain an upgrade target pending deterministic lockfile regeneration and exact regression proof.
- Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain unchanged / NO TOUCH.


## CURRENT EXECUTION RECONCILIATION — RUN-2026-09-21-EXECUTE-UI-003
- Active UI branch: `execution/customer-ui-completion-20260920`.
- Latest branch/PR head: `7f1b523319d74aa17f549c49db0f52482df5c00b`.
- Added keyboard skip navigation to both customer and staff shells, with explicit main landmarks and focus-safe styling.
- Corrected customer-facing order template wording from `المسحات` to `قوالب الطلبات` in all three UI occurrences.
- TypeScript language baseline remains ES2024; locked dependency graph remains unchanged for reproducibility.
- Latest verified external stable targets remain React 19.3.0, TypeScript 7.0.2, Vite 8.3.0, Supabase JS 2.116.0, Vitest 5.0.1, ESLint 10.11.0; adoption still requires deterministic lockfile regeneration + exact regression proof.
- Certification Candidate `1685836f4226fdcb3250a60eba7430ecf3e8f080` and Production remain untouched / NO TOUCH.


## CURRENT EXECUTION RECONCILIATION — RUN-2026-09-21-EXECUTE-UI-004
- Active UI branch/PR head: `execution/customer-ui-completion-20260920` / `7f1b523319d74aa17f549c49db0f52482df5c00b`.
- Exact Vercel deployment `dpl_Gs339VatHiPGCVhv46UF7ot1HiTE` is READY with exact commit match.
- Exact G1 remains queued; browser/CI proof is still separate from deployment status.
- The UI lane now includes accessibility skip navigation, corrected Arabic template terminology, ES2024 language baseline, responsive RTL design system, and safe rendering/interaction improvements.
- Candidate and Production remain untouched.

## DURABLE UI RULE — B2B SURFACE COMPLETION / 2026-09-21
- Customer home must expose real high-frequency B2B actions directly: Quick Order, Orders, Templates, Finance, and Excel ordering, while retaining structural navigation.
- File-upload controls must not depend on an unrelated visibility toggle; the underlying accessible input must exist independently of the visual search/tool group.
- Executive dashboard error handling must be truth-preserving: failed queries are rendered as unavailable/degraded, never as zero/healthy/empty-state conclusions.
- Role-filtered navigation icons must be bound to the navigation item itself, not array position.
- Secondary operational surfaces (Excel review, invitations, filter toolbars, responsive admin grids) require explicit layout selectors and mobile behavior.
- Exact current UI checkpoint: `7ee608d77d32ef6804dd1d08086b14cf5ea795f5` on `execution/customer-ui-completion-20260920`; fresh exact-SHA verification remains the only valid proof unit.


## DURABLE EXECUTION RULE — DEEP TRANSACTIONAL UI / 2026-09-21
- Customer order history must expose real persisted order details, not only status cards.
- Any customer order-detail read must verify the selected order belongs to the authenticated customer before loading `order_items`.
- Staff order-detail views may rely on existing authenticated RLS, but must not expose technical UUIDs as customer-facing/operator-facing business identifiers.
- Hero/header summaries may surface already-loaded operational facts, but must not become synthetic BI metrics.
- Current exact UI checkpoint: `3d699ca81e1de17eef36a81bf8eff0b9809bee07`; fresh exact-SHA proof is mandatory for this checkpoint.
