# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-014
- Development SHA: `72d5dae91ca7250c98ebb50d8b05409500f77c13`.
- Certification candidate branch: `certification/final-candidate-20260920-v3`, exact SHA matches.
- PR #88 remains OPEN / DRAFT / MERGEABLE; base remains frozen historical candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
- Candidate Vercel deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y` is READY and exact SHA matched.
- All mandatory exact-SHA technical gates are SUCCESS for `72d5dae...`.
- Exact candidate deployment browser proof run `35479844177` / job `105995552224` SUCCESS; Customer and Admin E2E completed; artifact `10596010632`.
- Exact candidate Final Regression run `35479844177` / job `105995552370` SUCCESS; artifact `10595392644`.
- Live Supabase performance hardening remains applied and the two unindexed invitation FK findings are gone.
- Security advisor has only two WARN categories: intentional authenticated SECURITY DEFINER execution pattern and external `auth_leaked_password_protection` warning; no paid upgrade is authorized under the zero-cost constraint.
- Netlify remains externally blocked by HTTP 403 account-credit exhaustion; Production remains HOLD / NO TOUCH.

## RUN-2026-09-20-EXECUTE-012- Objective: continue execution rather than stop at the previous release boundary; inspect live security/performance advisories and fix an actionable database performance finding without weakening the product contract.
- Root cause: Supabase performance advisor identified two real unindexed foreign keys on `public.customer_invitations`: `customer_invitations_created_by_fkey` and `customer_invitations_customer_id_fkey`. The existing `(organization_id, customer_id, created_at)` index did not cover `customer_id` as a standalone leading FK index.
- Action: added migration `supabase/migrations/20260920000600_add_customer_invitation_fk_indexes.sql` on development SHA `72d5dae91ca7250c98ebb50d8b05409500f77c13`, creating `customer_invitations_customer_id_fk_idx` and `customer_invitations_created_by_fk_idx`; applied the exact same DDL to live Supabase through the migration path.
- Verification: performance advisor was rechecked immediately. The two `unindexed_foreign_keys` findings disappeared; only the expected unused-index informational findings remained, including the two new indexes because they have not yet accumulated workload.
- Candidate handling: certification candidate `certification/final-candidate-20260920-v3` was advanced fast-forward to the new exact SHA. No historical candidate was mutated.
- Deployment: Vercel automatically created exact-SHA candidate deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y`; an exact-SHA development preview `dpl_2aas6bAdtyEjBT9GDabNKKmdo8gd` is READY. Runtime error queries for the new project/deployment window returned no error/fatal entries.
- CI: G1 Domain Proof run `35479225179` started for the new SHA; remaining exact-SHA gates must complete before any candidate PASS is asserted.
- Release boundary: Production remains untouched. Certification remains NO until the new SHA's complete evidence set is rebuilt.

## RUN-2026-09-20-EXECUTE-011
- Objective: execute the next unresolved front after the candidate-side release evidence was already complete, reconcile stored memory against live GitHub/Vercel/Supabase reality, and close stale-state uncertainty without changing the product SHA.
- Root cause/status: no new product defect found. Stored candidate/deployment/evidence state was confirmed current. The previously fixed invitation crypto hardening is live and matches the candidate source contract.
- Action: verified PR #88 head/base/SHA; verified all exact-SHA workflow runs; verified exact candidate Vercel deployment metadata and preview runtime error/fatal absence; verified live Supabase function definition and privileges.
- Result: reconciliation PASS for the old exact SHA only. No evidence from that SHA is carried to RUN-012.
- Release boundary: certification remained NO; Production remained NO TOUCH.

## PRIOR VERIFIED RUNS
### RUN-2026-09-20-EXECUTE-010 — SHA `1366f8ea...`
- Candidate-side mandatory technical evidence complete: Bootstrap 1067; Quality 3105; Security 2795; G1 2948; Order Workflow 1576; Migration 3080; Concurrency 573; Test-the-Test 682 attempt 2; Fresh Browser 400; Local Production Browser 406; Deployment Browser 35478298905; Final Regression 35478610589.
- Candidate Vercel deployment `dpl_72VRoKV9a71aY8JPtn7Pqsv5p18z` READY and exact SHA matched.

### RUN-2026-09-20-RESUME-006 — SHA `4f0a0614...`
- Final Regression `35477022465`, Quality `35477022455`, Security `35477022467`, G1 `35477022486/35477025357`, Migration `35477022461`, Test-the-Test `35477022490` all completed SUCCESS for that exact SHA.
- Netlify `35477022463` was blocked by account-credit HTTP 403.

### RUN-2026-09-20-RESUME-005 — SHA `07c3cab...`
- Security 2756; quality 3066; G1 2901/2902; migration 3041; Test-the-Test 666; Browser E2E 576; Netlify 35 were proven on that exact SHA.
- Auth leaked-password protection remained an external warning; certification NO; Production HOLD.

### RUN-2026-09-20-RESUME-004 — SHA `fffff8c1...`
- Viewer quick-action links were incorrectly visible; fixed `src/AdminExecutiveDashboard.tsx` to use the same role gates as rendered sections. Exact deployment/security/quality evidence followed.

### RUN-2026-09-20-RESUME-003 — SHA `ff98a64...`
- Added read-only `is_staff_reader()` with empty search_path, revoked anon execution, granted authenticated execution, updated targeted read policies, and centralized frontend portal-role routing.

## CLOSED-WORK / EVIDENCE RULE
Do not repeat closed work unless SHA/dependency/evidence/environment/requirement/security posture changed. Never transfer PASS across SHAs. Every record must retain `RUN / SHA / BRANCH / PR / FRONT / ROOT CAUSE / ACTION / RESULT / EVIDENCE / BLOCKER / NEXT ACTION`.

## END-OF-RUN RULE
Append exactly one compact run record per execution. Update `PROJECT_MEMORY.md` when durable product/architecture/decision knowledge changes.

## RUN-2026-09-20-EXECUTE-013
- Objective: continue exact-SHA release verification without mutating the candidate or Production, establish isolated candidate deployment/final-regression proof, and repair any proof-harness defect discovered during execution.
- Candidate source SHA: `72d5dae91ca7250c98ebb50d8b05409500f77c13`; candidate branch `certification/final-candidate-20260920-v3`; frozen historical candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34` untouched.
- Candidate Vercel deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y` is READY and reports the exact candidate SHA.
- Isolated proof branch: `proof/candidate-release-20260920-v2`. Proof run `35479844177` explicitly checked out candidate SHA `72d5dae...` and targeted the exact Vercel candidate deployment.
- Final Regression job `105995552370` is SUCCESS. It proved exact deployed artifact identity, security headers, Arabic/RTL shell, PWA manifest, and service worker. Evidence artifact `10595392644`, digest `sha256:4fd744980d85bf08da616764441793258d261caef7d7752627172e38faf891eb`.
- Root cause found in proof harness: Node `require('./manifest.webmanifest')` parsed JSON as JavaScript and caused a false PWA failure. The harness was corrected to explicit JSON.parse and the corrected final-regression job passed.
- Candidate Browser job `105995552224` is still IN_PROGRESS at the Customer E2E step after exact artifact verification and credential checks. No PASS is claimed until both Customer and Admin E2E complete successfully.
- External release blockers unchanged: Supabase Auth leaked-password protection remains an external configuration warning; Netlify remains externally blocked by account-credit HTTP 403; Production remains HOLD / NO TOUCH.
- Result: strong new exact candidate evidence established, but certification remains NO while the exact Customer/Admin browser proof is still running and the external Auth warning is unresolved.
- Next action: close candidate browser proof, capture exact artifact, then reconcile the complete evidence set. Do not transfer evidence across SHA and do not mutate Production.


## RUN-2026-09-20-EXECUTE-015
- Work branch: `execution/bulk-actions-20260920` from exact candidate SHA `72d5dae...`.
- Implemented: permission-aware bulk order transition preview with explicit eligible/blocked counts and a second validation before mutation; added deterministic domain tests for role/state/empty-selection boundaries.
- Implemented: import reconciliation result panel showing imported rows, created products, updated products, and inventory changes; stale prior report is cleared before staging a new file.
- Verification status: awaiting exact-SHA CI after final WIP commit; no PASS is claimed yet and candidate/Production remain untouched.


### RUN-2026-09-20-EXECUTE-015 — LIVE PROOF UPDATE
- WIP SHA: `1685836f4226fdcb3250a60eba7430ecf3e8f080`; branch `execution/bulk-actions-20260920`.
- SUCCESS exact-SHA runs: Quality `35481150809`; Security `35481150821`; G1 `35481150820`; Order Workflow `35481150804`; Exact Deployment Browser Contract `35481150826`; Local Production Artifact Browser `35481150812`; Concurrency `35481150807`; Supabase Migration `35481150837`; Fresh Local Browser `35481150808`.
- Fresh Local Browser completed Customer E2E, Admin E2E, and storage adversarial runtime successfully.
- Test-the-Test `35481150811` remains IN_PROGRESS. Baseline sensitive suite passed; Mutation 1 (remove product tenant RLS) was detected successfully; current step is the first Restore from zero. Active-job logs return GitHub `BlobNotFound`, so no further result is inferred.
- Candidate `72d5dae...` and its proven Vercel deployment remain untouched; WIP is not promoted.


## RUN-2026-09-20-EXECUTE-016
- Objective: close the highest unresolved WIP front, promote only after exact proof, and restart candidate-specific deployment evidence on the promoted SHA.
- WIP branch: `execution/bulk-actions-20260920`; exact SHA: `1685836f4226fdcb3250a60eba7430ecf3e8f080`.
- Test-the-Test `35481150811` / job `105999082463` SUCCESS; baseline plus five adversarial mutation probes and restore cycles completed.
- Exact-SHA SUCCESS: Quality `35481150809`; Security `35481150821`; G1 `35481150820`; Order Workflow `35481150804`; Deployment Browser Contract `35481150826`; Local Production Artifact Browser `35481150812`; Concurrency `35481150807`; Migration `35481150837`; Fresh Local Browser `35481150808`; Test-the-Test `35481150811`.
- Candidate promotion: `certification/final-candidate-20260920-v3` fast-forwarded from `72d5dae...` to `1685836f4226fdcb3250a60eba7430ecf3e8f080`; frozen historical candidate `2facceb...` untouched.
- Vercel exact candidate deployment: `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C`, BUILDING, exact ref `certification/final-candidate-20260920-v3`, exact SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080`.
- Result: source-level candidate gates PROVEN for `1685836f4226fdcb3250a60eba7430ecf3e8f080`; deployment browser/final-regression remain NOT_PROVEN until the new deployment reaches READY. Production remains NO TOUCH.
- Next: exact candidate Deployment Browser + Final Regression against `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` and `1685836f4226fdcb3250a60eba7430ecf3e8f080` after READY.

## RUN-2026-09-20-EXECUTE-016 — LIVE RECONCILIATION UPDATE
- Vercel candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` reached READY with exact ref `certification/final-candidate-20260920-v3` and exact SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080`.
- Runtime error clusters for the project in the checked 1-hour window: none. Deployment-scoped preview error/fatal logs in the checked window: none.
- Candidate-triggered exact-SHA workflows are now running on `1685836f4226fdcb3250a60eba7430ecf3e8f080`: Fresh Local Browser `35483251620`; Local Production Artifact Browser `35483251716`; Migration `35483251634`; Test-the-Test `35483251636`; Concurrency `35483251748`. Exact Deployment Browser Contract `35483251669` is SUCCESS.
- No deployment-browser E2E or Final Regression PASS is asserted yet. Old `72d5dae...` deployment evidence remains invalid for the promoted SHA.

## RUN-2026-09-20-EXECUTE-016 FINAL RECONCILIATION
- All candidate-triggered exact-SHA revalidation runs completed SUCCESS for `1685836f4226fdcb3250a60eba7430ecf3e8f080`: Fresh Local Browser `35483251620`; Local Production Artifact Browser `35483251716`; Migration `35483251634`; Test-the-Test `35483251636`; Concurrency `35483251748`; Order Workflow `35483251629`; Bootstrap `35483251637`; Exact Deployment Browser Contract `35483251669`; Security `35483251600`; G1 `35483251710`; Quality `35483251704`.
- Candidate deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` is READY, exact SHA matched, HTTP 200 shell verified; no runtime errors/fatal logs in the checked deployment window.
- Certification status: NOT CERTIFIED. Candidate full Deployment Browser E2E and Final Regression remain NOT_PROVEN because workflow dispatch is not exposed by the connected GitHub capability. No evidence is fabricated or transferred from `72d5dae...`. Production remains NO TOUCH.

## RUN-2026-09-20-EXECUTE-017 — CORE UI ADVANCEMENT + EXACT-SHA REPROOF
- Development head advanced via PR #93 from `72d5dae91ca7250c98ebb50d8b05409500f77c13` to `cc9f5e7e1906b553613bb2e8dee99dacd704491d`.
- Isolated implementation branch `execution/core-ui-20260920`: Command Palette focus trap/focus restoration/body-scroll lock; customer catalog explicit no-results state and clear-filter action. Prior bulk-order preview/import-reconciliation WIP was preserved and merged only after proof.
- SHA `050d3ca52426d1ac688e91b933d35915745e97bd` exact gates all SUCCESS: Quality `35484063305`; Security `35484063243`; G1 `35484063309`; Order Workflow `35484063323`; Bootstrap `35484063279`; Migration `35484063272`; Concurrency `35484063275`; Test-the-Test `35484063257`; Fresh Local Browser `35484063327`; Local Production Artifact `35484063291`; Exact Deployment Browser Contract `35484063261`.
- Fresh/local browser evidence on `050d3ca...` completed real Customer/Admin E2E, artifact identity, and storage adversarial runtime successfully.
- Merged SHA `cc9f5e7e1906b553613bb2e8dee99dacd704491d` independently re-proven: Quality `35484382281`; Security `35484382222`; G1 `35484382254` plus `35484370452`; Order Workflow `35484382288`; Bootstrap `35484382245`; Migration `35484382233`; Concurrency `35484382276`; Test-the-Test `35484382253`; Fresh Local Browser `35484382220`; Local Production Artifact `35484382242`; Exact Deployment Browser Contract `35484382224` — all SUCCESS.
- Vercel development deployment is externally blocked by Free-plan build-rate-limit. Candidate Vercel deployment `dpl_CpazdZojBzCEdxZcpX5zw4jUKn5C` remains READY and exact candidate SHA `1685836f4226fdcb3250a60eba7430ecf3e8f080`.
- PR #94 and #95 were verification-only and closed. Candidate and Production were not touched.
- Open product front: server-backed Quick Order SKU/barcode fallback for products outside the currently loaded catalog page. This is not implemented or claimed PASS yet.


## RUN-2026-09-20-EXECUTE-018 — QUICK ORDER SERVER-BACKED IDENTIFIER FRONT
- OBJECTIVE: implement and prove the next development-only core-product gap: Quick Order must resolve an exact SKU/barcode through the authorized server catalog when the product is outside the currently loaded catalog page.
- RECONCILIATION: development SHA before this front = `cc9f5e7e1906b553613bb2e8dee99dacd704491d`; active certification candidate = `1685836f4226fdcb3250a60eba7430ecf3e8f080` and remains untouched.
- IMPLEMENTATION HEAD: `483f9722f226c5f295c96edde2be88d760ceb520`, branch `execution/quick-order-server-lookup-20260920`, PR #96 retargeted from main to `enhancement/market-ready-v4-20260918`. Compare against dev is exactly 6 commits / 2 files.
- TECHNICAL CHANGE: Quick Order keeps local identifier matching first, then falls back to `get_catalog`/barcode-backed server catalog resolution with the active warehouse; lookup failures are surfaced explicitly. Browser regression covers a filtered/empty catalog resolving an authorized SKU outside the loaded result set.
- EXACT-SHA EVIDENCE: Quality `35485184032` SUCCESS; Security `35485184013` SUCCESS; G1 `35485184157` SUCCESS; Order Workflow `35485184016` SUCCESS; Bootstrap `35485184015` SUCCESS; Fresh Local Browser `35485184014` SUCCESS. Test-the-Test `35485184023`, Concurrency `35485184025`, Local Production Artifact Browser `35485184035` are RUNNING. Deployment Browser Contract `35485184006` SUCCESS.
- EXTERNAL BLOCKER: Vercel status check is FAILED because the Free plan exceeded `api-deployments-free-per-day`; no paid upgrade or Production action used.
- RESULT: implementation present; exact-SHA proof set not yet closed. No PASS/certification claim for this front until running gates terminate successfully.
- NEXT ACTION: reconcile terminal states, close remaining exact-SHA gates, then merge PR #96 into development only if all required proofs pass; after merge, treat the new development SHA as a new verification unit. Candidate/Production remain NO TOUCH.
