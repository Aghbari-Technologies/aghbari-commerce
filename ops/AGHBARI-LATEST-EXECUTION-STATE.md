# الأغبري | Latest Execution State
> Router only. Canonical durable context is `PROJECT_MEMORY.md`.

- RUN: `RUN-2026-09-20-RESUME-005`
- DEVELOPMENT BRANCH: `enhancement/market-ready-v4-20260918`
- CURRENT DEVELOPMENT SHA: `07c3cab1724d54d34234d67250276ac12968e14e`
- PR: #88 OPEN / DRAFT / MERGEABLE
- CERTIFICATION CANDIDATE: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — FROZEN / NO TOUCH
- PRODUCTION: HOLD / NO NEW TOUCH
- EXACT VERCEL DEVELOPMENT DEPLOYMENT: `dpl_B7fY9FmRsoECLu7TLUWGxCPp3ALG`, READY; exact Git SHA `07c3cab1724d54d34234d67250276ac12968e14e`.
- SUPABASE: `mrcyqezbhpncuvaehwgf`, ACTIVE_HEALTHY; `user_role` now includes `customer`; no customer-linked profile remains `viewer`; customer invitation RPC is service_role-only.
- CURRENT-SHA CI: Browser E2E `575/35476310075` SUCCESS; Netlify Exact SHA `35/35476569840` SUCCESS; application-quality `3066/35476569782` SUCCESS; security-audit `2756/35476569794` SUCCESS; G1 push `2901/35476569775` SUCCESS; G1 PR `2902/35476572304` SUCCESS; migration-proof `3041/35476569786` SUCCESS; Test-the-Test `666/35476569808` SUCCESS.
- EXACT ARTIFACTS: Browser artifact `10593514396` sha256 `77933a1eed2afe856826c00feaf7ce3d1215bdc989bba908c0b482b1a8d9ea39`; Netlify artifact `10594935718` sha256 `d8210aa31c0d0aa67f40d00cfaa1e3e100175cd343b414ab5759c7cadd061f34`.
- EXACT VERCEL ARTIFACT IDENTITY: deployment `dpl_B7fY9FmRsoECLu7TLUWGxCPp3ALG` is READY and its metadata reports exact SHA `07c3cab1724d54d34234d67250276ac12968e14e`.
- LIVE TEST FIXTURE: E2E Product A stock was replenished in non-production to 100 before the exact browser suite; post-suite observed stock is 96. This is test fixture state, not Production state.
- FORMAL FINAL REGRESSION: NOT_PROVEN; `.github/workflows/production-smoke.yml` is manual `workflow_dispatch` only and the connected GitHub mutation surface exposes no dispatch operation.
- CERTIFICATION: NO.
- PRODUCTION: NO TOUCH.
- OPEN FRONT: reconcile the 54-commit development delta against the frozen candidate, then close the formal-regression capability boundary; do not touch candidate or Production.

## Checkpoint update — RUN-2026-09-20-RESUME-005
- Fixed product-role model: added `customer` enum value, migrated existing customer-linked profiles from `viewer` to `customer`, and changed customer invitation consumption to create `customer` profiles while keeping the RPC service_role-only.
- Fixed source fixture: `scripts/browser-e2e-seed.sql` now creates customer accounts as `customer` and uses the correct product column shape including barcode.
- Reconciled test data: refreshed only non-production E2E inventory for `E2E Product A`; no Production mutation.
- Proven on exact SHA `07c3cab1724d54d34234d67250276ac12968e14e`: Security, Quality, G1 push+PR, Fresh-DB Migration, Test-the-Test, Vercel Browser E2E, and Netlify Customer/Admin E2E all SUCCESS.
- Browser/Netlify evidence: exact deployment identity checked; Browser artifact `10593514396`; Netlify artifact `10594935718`.
- Certification remains NO because development evidence is not transferable to frozen candidate `2facceb39aaa826413f20245a6f20b6c2ff7cd34`, and formal Production Smoke/Final Regression is not executable through the connected GitHub capability.
- Production remains HOLD / NO TOUCH.
- Evolution lesson: customer identity and staff viewer identity must be distinct at schema, seed, fixture, and UI layers; every browser fixture must assert role + pricing + stock prerequisites before runtime. Mutable E2E test data must be reset/replenished in a non-production fixture lifecycle rather than assumed stable.

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
