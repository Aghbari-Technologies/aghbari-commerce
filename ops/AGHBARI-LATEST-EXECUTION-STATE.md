# الأغبري | Latest Execution State
> Router only. Canonical durable context is `PROJECT_MEMORY.md`.

- RUN: `RUN-2026-09-20-RESUME-003`
- DEVELOPMENT BRANCH: `enhancement/market-ready-v4-20260918`
- CURRENT DEVELOPMENT SHA: `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`
- PR: #88 OPEN / DRAFT / MERGEABLE
- CERTIFICATION CANDIDATE: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — FROZEN / NO TOUCH
- PRODUCTION: HOLD / NO NEW TOUCH
- LATEST VERCEL EXACT DEVELOPMENT DEPLOYMENT: `dpl_2i86vekQXeYAKfgM2siKxsP4qr4g`, READY; exact Git SHA `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`.
- SUPABASE: `mrcyqezbhpncuvaehwgf`, ACTIVE_HEALTHY.
- LIVE PRIVILEGE PROOF: `consume_customer_invitation` anonymous=false/authenticated=false/service_role=true; barcode RPCs anonymous=false/authenticated=true/service_role=true.
- CURRENT-SHA CI OBSERVED: application-quality 3054 SUCCESS; security-audit 2744 SUCCESS; G1 2885 SUCCESS; Browser E2E run 572 RUNNING after exact artifact validation; migration-proof 3029 RUNNING; Test-the-Test 662 RUNNING.
- FORMAL FINAL REGRESSION: NOT_PROVEN; connected GitHub mutation surface has no workflow-dispatch operation.
- OPEN FRONT: finish current-SHA browser/database/Test-the-Test evidence, then reconcile development with the frozen candidate; viewer route is implemented.
- NEXT: close current exact-SHA evidence first; inspect viewer dashboard runtime anchors; reconcile only real deltas against candidate; keep candidate and Production untouched.

## Checkpoint detail — RUN-2026-09-20-RESUME-003
- Viewer frontend route fixed and unit-tested.
- Viewer DB read-only scope fixed without widening write-sensitive `is_staff()`.
- Current exact deployment `dpl_2i86vekQXeYAKfgM2siKxsP4qr4g` corresponds to `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`.
- Certification remains NO; Production remains HOLD / NO TOUCH.
