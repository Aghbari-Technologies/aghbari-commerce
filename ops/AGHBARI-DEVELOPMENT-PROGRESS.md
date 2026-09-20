# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-011
- Development SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.
- Certification candidate branch: `certification/final-candidate-20260920-v3`, same exact SHA.
- Candidate Vercel deployment: `dpl_72VRoKV9a71aY8JPtn7Pqsv5p18z` READY, exact SHA matched.
- Exact-SHA workflow set rechecked: Order Workflow 1576, Browser Exact Deployment 592, Security 2795, G1 2948, Bootstrap 1067, Quality 3105, Migration 3080, Concurrency 573, Fresh Browser 400, Local Production Browser 406, Test-the-Test 682 — all SUCCESS.
- Candidate Deployment Browser proof `35478298905` SUCCESS; Final Regression `35478610589` SUCCESS; evidence artifacts retained.
- Candidate Vercel preview runtime error/fatal query returned no entries.
- Live Supabase verification confirmed 58 public base tables and the hardened `consume_customer_invitation(text,uuid)` SECURITY DEFINER boundary with empty search_path, `extensions.digest()`, anon/authenticated denied, service_role allowed.
- Frozen historical candidate `2facceb...` remains untouched; Production remains HOLD / NO TOUCH.
- Netlify remains externally blocked by HTTP 403 account-credit exhaustion.
- Auth leaked-password protection remains an external Supabase Auth configuration warning.

## RUN-2026-09-20-EXECUTE-011
- Objective: execute the next unresolved front after the candidate-side release evidence was already complete, reconcile stored memory against live GitHub/Vercel/Supabase reality, and close any stale-state uncertainty without changing the product SHA.
- Root cause/status: no new product defect found. The stored candidate/deployment/evidence state was confirmed current. The previously fixed invitation crypto hardening is live and matches the candidate source contract.
- Action: verified PR #88 head/base/SHA; verified all exact-SHA workflow runs; verified exact candidate Vercel deployment metadata and preview runtime error/fatal absence; verified live Supabase function definition and privileges.
- Result: reconciliation PASS for current state. No new product SHA required. Candidate technical evidence remains valid because no product source changed.
- Release boundary: certification remains NO; Production remains NO TOUCH. External Auth leaked-password protection warning and owner-approved release decision remain the only release-boundary items. Netlify credit blocker remains external and non-product.
- Next action: authorized external Auth configuration path if available; otherwise preserve the candidate and wait for owner-level release decision. Do not create speculative code changes merely to manufacture a new SHA.

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
