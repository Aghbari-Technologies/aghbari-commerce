# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-010
- Development SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`.
- Certification candidate branch: `certification/final-candidate-20260920-v3`, same exact SHA.
- Candidate Vercel deployment: `dpl_72VRoKV9a71aY8JPtn7Pqsv5p18z` READY, exact SHA matched.
- Candidate CI exact gates: Bootstrap 1067 SUCCESS; Quality 3105 SUCCESS; Security 2795 SUCCESS; G1 2948 SUCCESS; Order Workflow 1576 SUCCESS; Migration 3080 SUCCESS; Concurrency 573 SUCCESS; Test-the-Test 682 attempt 2 SUCCESS; Fresh Browser 400 SUCCESS; Local Production Browser 406 SUCCESS.
- Candidate Deployment Browser proof: run 35478298905 SUCCESS; exact candidate artifact verified; Customer and Admin E2E SUCCESS; artifact 10594833277 retained.
- Candidate Final Regression proof: run 35478610589 SUCCESS; exact candidate artifact, security headers, Arabic/RTL shell, PWA manifest, and service worker verified; artifact 10594688925 retained.
- Candidate Vercel preview runtime error/fatal log query returned no entries.
- Frozen historical candidate `2facceb...` remains untouched; Production remains HOLD / NO TOUCH.
- Netlify remains externally blocked by HTTP 403 account-credit exhaustion.
- Auth leaked-password protection remains an external Supabase Auth configuration warning.

## RUN-2026-09-20-EXECUTE-010
- Objective: complete exact candidate-side release verification without mutating the frozen historical candidate or Production.
- Root cause previously fixed: invitation SECURITY DEFINER crypto dependency was vulnerable to migration redefinition drift; hardened with empty `search_path` and schema-qualified `extensions.digest()`.
- Candidate exact test-the-test rerun proved all five adversarial mutations are detected and restored from zero.
- Candidate deployment browser and final regression were proven through isolated proof branches that checkout the candidate SHA and hit the candidate Vercel deployment directly.
- Result: candidate-side mandatory technical evidence is COMPLETE on exact SHA `1366f8...`.
- Release boundary: LIVE/Production alignment is intentionally NOT_PROVEN; Auth leaked-password protection remains externally unresolved; Netlify is externally blocked.
- Next: owner-approved release decision path only; no automatic Production mutation.

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
