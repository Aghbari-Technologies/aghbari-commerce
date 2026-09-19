# الأغبري | Development Progress
> Historical pointer only. Canonical startup knowledge is `PROJECT_MEMORY.md` on `ops/execution-control-plane`.

## Current checkpoint
- RUN: `RUN-2026-09-20-RESUME-003`
- Development SHA: `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`
- PR: #88 OPEN / DRAFT / MERGEABLE
- Certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — frozen
- Production: HOLD / NO TOUCH

## Resume record — 2026-09-20 / RUN-2026-09-20-RESUME-003
- Reconciled GitHub reality: PR #88 head is `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`, with 50 commits / 31 changed files; candidate base remains frozen.
- Reconciled Vercel reality: exact development deployment `dpl_2i86vekQXeYAKfgM2siKxsP4qr4g` is READY for `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`.
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
