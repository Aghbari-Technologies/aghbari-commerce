# الأغبري | Latest Execution State
> Router only. Canonical durable context is `PROJECT_MEMORY.md`.

- RUN: `RUN-2026-09-20-RESUME-005`
- DEVELOPMENT BRANCH: `enhancement/market-ready-v4-20260918`
- CURRENT DEVELOPMENT SHA: `07c3cab1724d54d34234d67250276ac12968e14e`
- PR: #88 OPEN / DRAFT / MERGEABLE
- CERTIFICATION CANDIDATE: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — FROZEN / NO TOUCH
- PRODUCTION: HOLD / NO NEW TOUCH
- EXACT VERCEL DEVELOPMENT DEPLOYMENT: `dpl_B7fY9FmRsoECLu7TLUWGxCPp3ALG`, READY; exact Git SHA `07c3cab1724d54d34234d67250276ac12968e14e`.
- SUPABASE: `mrcyqezbhpncuvaehwgf`, ACTIVE_HEALTHY; customer-linked viewer records reconciled to `customer` role; customer invitation RPC remains service_role-only.
- CURRENT-SHA CI: Browser E2E `575/35476310075` SUCCESS; Netlify Exact SHA `34/35476290757` SUCCESS; application-quality `3065/35476290834` SUCCESS; security-audit `2755/35476290841` SUCCESS; G1 push `2899/35476290971` SUCCESS; G1 PR `2900/35476294067` SUCCESS; migration-proof `3040/35476290837` SUCCESS; Test-the-Test `665/35476290814` SUCCESS.
- EXACT ARTIFACTS: Browser artifact `10594925303` (sha256 `77933a1eed2afe856826c00feaf7ce3d1215bdc989bba908c0b482b1a8d9ea39`); Netlify artifact `10594471077` (sha256 `d8210aa31c0d0aa67f40d00cfaa1e3e100175cd343b414ab5759c7cadd061f34`).
- LIVE FIXTURE NOTE: non-production E2E Product A stock was replenished to 100 before this exact browser run; after two successful deployed E2E suites the observed stock is 96. This is test data, not Production.
- FORMAL FINAL REGRESSION: NOT_PROVEN; `.github/workflows/production-smoke.yml` requires `workflow_dispatch`, and the connected GitHub mutation surface does not expose dispatch.
- CERTIFICATION: NO.
- PRODUCTION: NO TOUCH.
- OPEN FRONT: reconcile development delta against the frozen candidate and close the formal-regression capability boundary without touching the candidate or Production.


- PRODUCTION: HOLD / NO NEW TOUCH
- LATEST VERCEL EXACT DEVELOPMENT DEPLOYMENT: `dpl_DYdizKuWnLDaRDmNA6Unbou9SDAj`, BUILDING; exact Git SHA `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`.
- SUPABASE: `mrcyqezbhpncuvaehwgf`, ACTIVE_HEALTHY.
- LIVE PRIVILEGE PROOF: `consume_customer_invitation` anonymous=false/authenticated=false/service_role=true; barcode RPCs anonymous=false/authenticated=true/service_role=true.
- CURRENT-SHA CI OBSERVED: security-audit 2749 SUCCESS; application-quality 3059 RUNNING (unit/integration + lint SUCCESS; production build RUNNING); G1 push 2891 RUNNING; G1 PR 2892 RUNNING; migration-proof 3034 RUNNING; Test-the-Test 663 RUNNING; Netlify Exact SHA 32 PENDING. Browser E2E for this SHA awaits Vercel deployment-status success.
- FORMAL FINAL REGRESSION: NOT_PROVEN; connected GitHub mutation surface has no workflow-dispatch operation.
- OPEN FRONT: finish current-SHA browser/database/Test-the-Test evidence for the new SHA, verify the viewer quick-link fix at runtime, then reconcile development with the frozen candidate; candidate remains untouched.
- NEXT: close current exact-SHA evidence first; inspect viewer dashboard runtime anchors; reconcile only real deltas against candidate; keep candidate and Production untouched.

## Checkpoint detail — RUN-2026-09-20-RESUME-003
- Viewer frontend route fixed and unit-tested.
- Viewer DB read-only scope fixed without widening write-sensitive `is_staff()`.
- Current exact deployment `dpl_2i86vekQXeYAKfgM2siKxsP4qr4g` corresponds to `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`.
- Certification remains NO; Production remains HOLD / NO TOUCH.


## Checkpoint update — RUN-2026-09-20-RESUME-004
- SHA: `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`
- Implemented: viewer-role dashboard quick links are now rendered only when their target section is available; viewer receives a read-only status instead of dead links.
- Verified: exact source edit is present on the development SHA; Vercel deployment `dpl_DYdizKuWnLDaRDmNA6Unbou9SDAj` was created for the same SHA and is BUILDING; application-quality unit/integration and lint steps completed successfully.
- Proven: runtime/browser proof for this new SHA is NOT_PROVEN pending deployment completion and exact browser execution.
- Certification: NO. Production: HOLD / NO TOUCH. Frozen candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
