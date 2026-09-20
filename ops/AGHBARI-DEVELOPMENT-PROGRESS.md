# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-013
- Development SHA: `72d5dae91ca7250c98ebb50d8b05409500f77c13`.
- Certification candidate branch: `certification/final-candidate-20260920-v3`, advanced to the same exact SHA.
- PR #88 remains OPEN / DRAFT / MERGEABLE; base remains frozen historical candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
- New Vercel candidate deployment `dpl_DVfuqGzcMPBX3aTgaH64LdChES6Y` is BUILDING for exact candidate SHA; the same SHA already has READY preview deployment `dpl_2aas6bAdtyEjBT9GDabNKKmdo8gd` on the development branch.
- New SHA exact gates are still in progress; prior SHA evidence is intentionally invalidated for the changed candidate and is not carried forward.
- Live Supabase migration `add_customer_invitation_fk_indexes` applied successfully.
- Supabase performance advisor's two unindexed customer_invitations foreign keys were removed as findings by adding standalone indexes for `customer_id` and `created_by`.
- Security advisor still reports the intentional SECURITY DEFINER/authenticated-RPC pattern plus the external Auth leaked-password-protection warning; neither is treated as an unverified PASS.
- Frozen historical candidate remains untouched; Production remains HOLD / NO TOUCH.

## RUN-2026-09-20-EXECUTE-012
- Objective: continue execution rather than stop at the previous release boundary; inspect live security/performance advisories and fix an actionable database performance finding without weakening the product contract.
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
