# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-009
- Development SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`; development branch `enhancement/market-ready-v4-20260918`.
- Certification branch: `certification/final-candidate-20260920-v3`; exact SHA `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.
- Candidate Vercel deployment: `dpl_72VRoKV9a71aY8JPtn7Pqsv5p18z` READY; exact SHA matches.
- Candidate exact CI: Bootstrap 1067 SUCCESS; Application Quality 3105 SUCCESS; Security 2795 SUCCESS; G1 2948 SUCCESS; Order Workflow 1576 SUCCESS; Browser-contract 592 SUCCESS.
- Candidate exact CI still running at checkpoint: Migration 3080; Concurrency 573; Test-the-Test 682; Fresh Browser 400; Local Production Browser 406.
- Candidate Deployment Browser: NOT_PROVEN. The candidate PR-triggered Browser E2E workflow run `35478137968` succeeded only for `browser-contract`; authenticated browser job was SKIPPED because the workflow condition excludes pull_request events.
- Development exact-SHA proof prior to candidate promotion is fully closed: Final Regression 35477914059; Security 35477914046; Quality 35477914032; G1 35477914182/35477916774; Migration 35477914025; Concurrency 35477914055; Test-the-Test 35477914073; Fresh Browser 35477913975; Local Browser 35477913977; Deployment Browser 35477929768 all SUCCESS.
- Netlify 35477914057 remains FAILED by external account-credit HTTP 403.
- Frozen historical candidate `2facceb...` and Production remain untouched.

## RUN-2026-09-20-EXECUTE-009
- Action: promoted the exact proven development SHA to new certification branch `certification/final-candidate-20260920-v3` without modifying frozen candidate `2facceb...`.
- Root cause / proof lesson: candidate-specific Deployment Browser E2E is not automatically emitted by the pull_request-triggered workflow; its authenticated job is conditional on deployment_status/manual dispatch.
- Verified candidate deployment `dpl_72VRoKV9a71aY8JPtn7Pqsv5p18z` is READY and exact SHA-aligned.
- Result: candidate release validation is in progress; certification remains NO.
- Next action: close candidate's five running gates, then solve/prove Deployment Browser through an allowed exact candidate path.

## PRIOR VERIFIED RUNS
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
