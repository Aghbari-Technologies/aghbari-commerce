# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-007
- SHA: `9d2149de4bf3c491abad8460cab5df01c6faa4bd`
- Branch: `enhancement/market-ready-v4-20260918`
- PR #88: OPEN / DRAFT / MERGEABLE; frozen base `2facceb39aaa826413f20245a6f20b6c2ff7cd34`
- Vercel exact preview: `dpl_GVNskevLQiUCxAwqiHjuadLMg1is` READY.
- Exact current-SHA Browser E2E / Exact Deployment: SUCCESS `35477629049` (#586).
- Security `35477628903` SUCCESS; Bootstrap lockfile `35477628985` SUCCESS; Order Workflow `35477629035` SUCCESS; G1 `35477628973` SUCCESS.
- Still running exact current-SHA gates: Browser Fresh Local `35477628875`; Concurrency `35477628886`; Browser Local Production Artifact `35477629065`; Migration `35477628986`; Test-the-Test `35477628991`; Application Quality `35477629014`.
- Netlify remains blocked by account-credit HTTP 403.
- Production: HOLD / NO TOUCH. Certification: NO.

## RUN-2026-09-20-EXECUTE-007
- Root cause discovered: repository state advanced one commit after the stored checkpoint.
- Exact delta from `4f0a0614...` to `9d2149de...`: only `scripts/browser-e2e-seed.sql`, correcting the inactive browser product barcode fixture.
- Verified exact current Vercel deployment and exact current-SHA browser/deployment/security/bootstrap/order/G1 evidence.
- Reconciliation rule applied: prior `4f0a0614...` Migration/Test-the-Test PASSes are audit history only and are not transferred to `9d2149de...`.
- Exact current-SHA replacement gates were observed running and recorded above; no PASS is claimed while they are running.
- Supabase project is ACTIVE_HEALTHY; direct migration-history query for versions `20260920000210` and `20260920000300` returned no rows, so that query is not used as migration proof.
- Candidate and Production were not touched.
- Next action: close the six running exact-SHA gates, then reconcile candidate readiness without candidate mutation.

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
