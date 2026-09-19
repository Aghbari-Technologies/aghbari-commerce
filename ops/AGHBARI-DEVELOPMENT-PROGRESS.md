# الأغبري | Development Progress
> Historical pointer only. Canonical startup knowledge is `PROJECT_MEMORY.md` on `ops/execution-control-plane`.

## Current checkpoint
- RUN: `RUN-2026-09-20-RESUME-006`
- Development SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`
- PR: #88 OPEN / DRAFT / MERGEABLE
- Current exact Vercel deployment: `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd` READY
- Final Regression: `35477022465` SUCCESS
- Netlify Exact SHA: `35477022463` BLOCKED by Netlify HTTP 403 account-credit exhaustion
- Migration: `35477022461` IN PROGRESS
- Test-the-Test: `35477022490` IN PROGRESS
- Certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` frozen
- Production: HOLD / NO TOUCH

## Resume record — 2026-09-20 / RUN-2026-09-20-RESUME-006
- Current development SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`; PR #88 OPEN / DRAFT / MERGEABLE; frozen candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34` remains untouched.
- Final Regression / Exact Artifact `35477022465` SUCCESS on the exact Vercel Preview: checked-out SHA, deployed artifact identity, security headers, Arabic RTL shell, PWA manifest, and service worker.
- Vercel deployment: `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd` READY, exact Git SHA `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`.
- Quality `35477022455`, Security `35477022467`, G1 push `35477022486`, and G1 PR `35477025357` SUCCESS.
- Fresh-DB migration `35477022461` and Test-the-Test `35477022490` remain IN PROGRESS at checkpoint time; no premature PASS claimed.
- Netlify Exact SHA `35477022463` FAILED with HTTP 403 because the Netlify account exceeded credit usage; build/exact artifact completed before deployment attempt. No retry because the platform itself blocks new deploys.
- Exact browser proof for current SHA: NOT_PROVEN. Prior `07c3cab...` browser proof is historical and not promoted to current-SHA PASS.
- Formal Final Regression for current SHA: PROVEN by `35477022465`.
- Certification: NO. Production: HOLD / NO TOUCH.
- Next: close the remaining migration/Test-the-Test runs, then reconcile the development delta against the frozen candidate and keep Netlify blocked without consuming further quota.
## Resume record — 2026-09-20 / RUN-2026-09-20-RESUME-003
- Reconciled GitHub reality: PR #88 head is `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`, with 50 commits / 31 changed files; candidate base remains frozen.
- Reconciled Vercel reality: exact development deployment `dpl_DYdizKuWnLDaRDmNA6Unbou9SDAj` is BUILDING for `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`.
- Reconciled Supabase reality: project `mrcyqezbhpncuvaehwgf` ACTIVE_HEALTHY; `is_staff()` unchanged and `is_staff_reader()` now provides viewer read-only scope.
- Implemented frontend: viewer is routed to the staff portal via `isStaffPortalRole()`; unit role matrix test added.
- Live database: viewer read-only helper and targeted SELECT policy updates are present; no write policy was changed to use the new helper.
- Evidence on `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`: application-quality 3054 SUCCESS; security-audit 2744 SUCCESS; G1 2885 SUCCESS; Vercel exact deploy READY; Browser E2E run 572 RUNNING after exact artifact identity and customer-secret prechecks.
- Still running: migration-proof 3029 and Test-the-Test 662. Netlify 31 is pending but not required because exact Vercel deployment exists.
- External warning unchanged: leaked-password protection remains a Supabase Auth configuration warning.
- No production mutation performed; candidate untouched.

## Resume rule
Read Control Plane then `PROJECT_MEMORY.md`; verify reality; execute the highest-priority unresolved front. Never reuse stale PASS evidence across SHAs.

### Run appendix — RUN-2026-09-20-RESUME-003
- SHA: `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`
- Implemented: viewer portal routing + read-only staff DB scope + exact role/migration tests.
- Verified: exact Vercel deployment READY; application-quality/security/G1 current-SHA checks SUCCESS; live DB helper and three SELECT policies verified.
- Proven: exact build artifact identity verified by Browser E2E run 572; customer credentials checks passed; customer critical-path execution remains RUNNING.
- Blocked: none at product-code layer; formal dispatch regression remains unavailable through connector surface.
- Certification: NO.
- Production: HOLD / NO TOUCH.
- Next: finish all running exact-SHA gates, then reconcile with frozen candidate.


## Resume record — 2026-09-20 / RUN-2026-09-20-RESUME-004
- SHA: `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`; PR #88 remains OPEN / DRAFT / MERGEABLE; frozen certification candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34` and untouched.
- Root cause found: the viewer dashboard rendered generic quick links for orders, inventory and customers even when those sections were hidden for viewer, producing dead/unavailable navigation.
- Fix implemented: `src/AdminExecutiveDashboard.tsx` now applies the same role gates to those quick links and shows a read-only status for viewer.
- Verification: exact source at `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`; Vercel exact deployment `dpl_DYdizKuWnLDaRDmNA6Unbou9SDAj` created for the same SHA and currently BUILDING; application-quality 3059 has unit/integration + lint SUCCESS, production build RUNNING.
- Current exact-SHA gates: security-audit 2749 SUCCESS; G1 push 2891 RUNNING; G1 PR 2892 RUNNING; migration-proof 3034 RUNNING; Test-the-Test 663 RUNNING; Netlify 32 PENDING; exact browser E2E awaits Vercel deployment-status success.
- Proven: no runtime proof yet for the new UI fix. Formal Final Regression remains NOT_PROVEN. Certification NO. Production HOLD / NO TOUCH.
- Next action: finish only the new SHA evidence; then recheck viewer runtime anchors and reconcile real deltas against the frozen candidate without touching it.
