# الأغبري | Development Progress
> Historical pointer only. Canonical startup knowledge is `PROJECT_MEMORY.md` on `ops/execution-control-plane`.

## Current checkpoint
- RUN: `RUN-2026-09-20-RESUME-002`
- Development SHA: `f7a0b9d6b5fe608da78f2881fc898bd922f0ff9d`
- PR: #88 OPEN / DRAFT / MERGEABLE
- Certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — frozen
- Production: HOLD / NO TOUCH

## Resume record — 2026-09-20
- Reconciled GitHub reality: PR #88 head is `f7a0b9d6b5fe608da78f2881fc898bd922f0ff9d`, newer than the previous stored checkpoint.
- Reconciled Vercel reality: exact current-SHA deployment `dpl_48bgfhLNL5x3po2UNmB6NU6ghXfe` is READY in `aghbari-commerce-c2dd`.
- Reconciled Supabase reality: project `mrcyqezbhpncuvaehwgf` ACTIVE_HEALTHY.
- Security proof: invitation RPC `consume_customer_invitation(text,uuid)` is denied to anon and authenticated and retained for service_role; barcode RPCs are denied to anon and allowed to authenticated/service_role.
- Current-SHA workflow evidence: G1 Domain Proof run `35474365269` SUCCESS.
- No production mutation performed.
- Viewer routing remains OPEN: active frontend has `viewer` in the role type but `STAFF_ROLES` currently omits it; exact role-matrix proof/fix is still required.
- Formal Final Regression remains NOT_PROVEN because workflow dispatch is unavailable through the connected GitHub mutation surface.

## Resume rule
Read Control Plane then `PROJECT_MEMORY.md`; verify reality; execute the highest-priority unresolved front. Never reuse stale PASS evidence across SHAs.
