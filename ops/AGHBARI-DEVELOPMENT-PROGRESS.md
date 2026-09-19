# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

> **Execution-history and problem handoff layer.** Read after `PROJECT_MEMORY.md`.
>
> **HANDOFF:** `PROJECT_MEMORY (SPECIFICATIONS) → this file (PROBLEMS / FIXES / CLOSURES) → AGHBARI-LATEST-EXECUTION-STATE (LATEST RESULTS)`
>
> This file answers: **What problems were found? What was their root cause? What changed? What was proven? What remains open?**
>
> It is a compact ledger, not a raw log. Do not duplicate the full product specification here.

## CURRENT CHECKPOINT
- RUN: `RUN-2026-09-20-RESUME-006`
- Development SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`
- Branch: `enhancement/market-ready-v4-20260918`
- PR: #88 OPEN / DRAFT / MERGEABLE
- Exact Vercel deployment: `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd` READY
- Final Regression: `35477022465` SUCCESS / PROVEN for current development SHA
- Netlify Exact SHA: `35477022463` BLOCKED by HTTP 403 account-credit exhaustion
- Migration: `35477022461` IN PROGRESS at last checkpoint
- Test-the-Test: `35477022490` IN PROGRESS at last checkpoint
- Certification candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` FROZEN / NO TOUCH
- Production: HOLD / NO TOUCH

## ACTIVE PROBLEMS / OPEN FRONTS
1. Close current-SHA Migration proof.
2. Close current-SHA Test-the-Test proof.
3. Exact current-SHA Browser E2E is not yet proven; historical browser evidence from `07c3cab...` is not transferable.
4. Reconcile development delta against frozen certification candidate without touching the candidate.
5. Supabase Auth leaked-password protection remains an external configuration warning.
6. Netlify is blocked by account-credit exhaustion; do not waste further deployment attempts until the platform permits them.
7. Master-spec deferred areas remain not proven unless explicitly implemented: promotions, notification center/provider delivery, integration delivery records/adapters, lots/batches/expiry/FEFO, reservations, independent fulfillment records, WhatsApp/Onyx adapters, centralized bilingual locale architecture.

## RECENT ROOT-CAUSE / FIX LEDGER

### RUN-2026-09-20-RESUME-006
- SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`
- Problem: current development SHA still had open Migration/Test-the-Test evidence at checkpoint; current-SHA browser suite had not been freshly proven.
- Root cause: required workflows were still running / exact current-SHA browser proof had not yet been executed; historical browser evidence belonged to another SHA.
- Implemented/verified: current exact Vercel deployment READY; Final Regression `35477022465` SUCCESS; Quality `35477022455`, Security `35477022467`, G1 push/PR `35477022486`/`35477025357` SUCCESS.
- Blocked: Netlify `35477022463` by account-credit HTTP 403.
- Status: Migration/Test-the-Test NOT_PROVEN until closed; Browser E2E NOT_PROVEN; Certification NO; Production HOLD.
- Next: close remaining runs, then candidate reconciliation.

### RUN-2026-09-20-RESUME-005
- SHA: `07c3cab1724d54d34234d67250276ac12968e14e`
- Problem: evidence needed to remain exact-SHA after repeated development changes.
- Root cause/control lesson: browser/CI evidence from earlier SHA cannot be promoted to a newer SHA.
- Proven on exact SHA: security 2756; quality 3066; G1 push/PR 2901/2902; migration 3041; Test-the-Test 666; Browser E2E 576; Netlify Exact SHA 35; Vercel exact deployment READY.
- External warning: leaked-password protection remained unresolved.
- Certification: NO. Production: HOLD / NO TOUCH.

### RUN-2026-09-20-RESUME-004
- SHA: `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`
- Problem: viewer dashboard showed quick-action links to sections unavailable to viewer (`orders`, `inventory`, `customers`).
- Root cause: quick-link visibility was not using the same role gates as the rendered sections.
- Fix: `src/AdminExecutiveDashboard.tsx` now gates quick links with the same role rules and shows viewer read-only status.
- Verification: exact Vercel deployment created for same SHA; security 2749 SUCCESS; application quality 3059 unit/integration + lint SUCCESS at checkpoint.
- Browser proof was not claimed until exact deployment status was available.

### RUN-2026-09-20-RESUME-003
- SHA: `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`
- Problem: viewer role required a safe read-only staff scope.
- Root cause: existing `is_staff()` intentionally excluded viewer, while the viewer needed read-only access to selected staff-readable resources.
- Fix: `is_staff_reader()` with empty search_path; anon execution revoked; authenticated execution granted; targeted SELECT policies updated; frontend role routing centralized through `isStaffPortalRole()`.
- Verification: exact Vercel deployment and current-SHA application/security/G1 evidence; Browser run 572 verified artifact identity and customer credentials before continuing critical path.
- Fresh-DB migration proof remained running at checkpoint.

## CLOSED-WORK REUSE RULE
Do not repeat a closed front unless:
- SHA changed;
- dependency changed;
- evidence became invalid;
- environment/runtime changed materially;
- requirement changed;
- security posture changed;
- or a later proof shows the earlier proof was unsound.

Otherwise treat the closure as authoritative and move to the next unresolved front.

## EVIDENCE RULE
Every run record must retain:
`RUN / SHA / BRANCH / PR / FRONT / ROOT CAUSE / ACTION / RESULT / EVIDENCE / BLOCKER / NEXT ACTION`

Never transfer PASS across SHAs.

## HANDOFF TO LATEST RESULTS
After reading this ledger, continue immediately to:

`ops/AGHBARI-LATEST-EXECUTION-STATE.md`

That file is the **latest-results router** and contains the current exact state to execute against.

## MANDATORY END-OF-RUN RULE
Every execution must append exactly one compact run record here before the user-facing completion report. If the run discovers a durable product/architecture rule, also update `PROJECT_MEMORY.md`.