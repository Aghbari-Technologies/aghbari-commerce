# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

> Execution-history and problem handoff layer. Read after `PROJECT_MEMORY.md`.
> `PROJECT_MEMORY → this ledger → LATEST EXECUTION STATE`

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-007
- Development SHA: `9d2149de4bf3c491abad8460cab5df01c6faa4bd`
- Branch: `enhancement/market-ready-v4-20260918`
- PR #88: OPEN / DRAFT / MERGEABLE
- Base / frozen candidate: `2facceb39aaa826413f20245a6f20b6c2ff7cd34` — NO TOUCH
- Exact Vercel current-SHA deployment: `dpl_GVNskevLQiUCxAwqiHjuadLMg1is` READY
- Exact current-SHA Browser E2E: SUCCESS — check `105988969179`, workflow run `35477420804`
- Browser-contract: SUCCESS — workflow run `35477420804`
- Vercel Preview Comments: SUCCESS, zero unresolved feedback — check `105988962012`
- Production: HOLD / NO TOUCH
- Netlify: BLOCKED by external account-credit HTTP 403

## ACTIVE PROBLEMS / OPEN FRONTS
1. Exact current SHA is newer than the previous checkpoint; release gates affected by the SHA change must be revalidated rather than inheriting PASS.
2. Reconcile the current development delta against frozen candidate without touching the candidate.
3. Formal certification remains NO; development evidence is not candidate evidence.
4. Supabase Auth leaked-password protection remains an external configuration warning.
5. Deferred master-spec capabilities remain not proven unless implemented: promotions; notification center/provider delivery; integration delivery records/adapters; lots/batches/expiry/FEFO; reservations; independent fulfillment; WhatsApp/Onyx adapters; centralized bilingual locale architecture.

## RUN-2026-09-20-EXECUTE-007 — CURRENT RECONCILIATION
- SHA: `9d2149de4bf3c491abad8460cab5df01c6faa4bd`
- Reality finding: PR #88 had advanced one commit beyond stored checkpoint `4f0a0614...`.
- Root cause: a new commit landed after the previous memory checkpoint.
- Exact delta: `scripts/browser-e2e-seed.sql` modified by one line to fix the inactive browser product barcode fixture.
- Verification: current exact Vercel deployment READY; exact current-SHA `browser-e2e` SUCCESS; `browser-contract` SUCCESS; Vercel preview feedback SUCCESS with zero unresolved threads.
- Important proof boundary: prior Migration/Test-the-Test PASSes were on `4f0a0614...`; they are not transferred to `9d2149de...`. Exact current-SHA release gates remain the closure target.
- Supabase reality: project `aghbari-commerce`, ref `mrcyqezbhpncuvaehwgf`, ACTIVE_HEALTHY, PostgreSQL 17.6.1.166. A direct query of `supabase_migrations.schema_migrations` returned no rows for the two named recent migration versions, so no migration PASS was claimed from that query.
- Netlify remains externally blocked by account-credit exhaustion; no wasteful retries.
- Result: browser proof closed for exact current SHA; certification still NO; candidate and production untouched.
- Next: exact-SHA release-gate reconciliation, then candidate evidence reconciliation without mutation.

## RUN-2026-09-20-RESUME-006
- SHA: `4f0a0614ab94e1c2ebd61745aa915f6942b3c5a0`
- Exact Vercel deployment `dpl_BCvmScQ6hMUQDppRXMCnGkkRV5hd` READY.
- Final Regression `35477022465` SUCCESS / PROVEN for that exact SHA.
- Quality `35477022455`, Security `35477022467`, G1 push/PR `35477022486`/`35477025357` SUCCESS.
- Migration `35477022461` SUCCESS; Test-the-Test `35477022490` SUCCESS.
- Netlify Exact SHA `35477022463` BLOCKED by HTTP 403 account-credit exhaustion.
- Browser proof was not yet exact for this SHA at checkpoint; later SHA `9d2149...` now has fresh browser success.

## RUN-2026-09-20-RESUME-005
- SHA: `07c3cab1724d54d34234d67250276ac12968e14e`
- Proven on exact SHA: security 2756; quality 3066; G1 push/PR 2901/2902; migration 3041; Test-the-Test 666; Browser E2E 576; Netlify Exact SHA 35.
- Vercel exact deployment READY with exact SHA.
- Auth leaked-password protection remained an external warning.
- Certification NO; Production HOLD / NO TOUCH.

## RUN-2026-09-20-RESUME-004
- SHA: `fffff8c1a48c2da73f70fa79f766b1b116c9cf80`
- Root cause: viewer quick-action links were not using the same role gates as rendered sections.
- Fix: `src/AdminExecutiveDashboard.tsx` now gates quick links and shows viewer read-only status.
- Exact Vercel deployment created for the same SHA; security and application-quality evidence passed at checkpoint.
- Browser proof was withheld until exact deployment status was available.

## RUN-2026-09-20-RESUME-003
- SHA: `ff98a64ad2a547b6ac79b68cede121f5c5f0c8cb`
- Fix: added `is_staff_reader()` with empty search_path; anon execution revoked; authenticated execution granted; targeted SELECT policies updated; frontend role routing centralized through `isStaffPortalRole()`.
- Viewer/customer routing and exact deployment/security/G1 evidence were verified at that SHA; fresh-DB migration proof continued.

## CLOSED-WORK REUSE RULE
Do not repeat closed work unless SHA/dependency changed, evidence became invalid/expired, environment/runtime changed materially, requirement/security posture changed, or later proof shows earlier evidence unsound.

## EVIDENCE RULE
Every run record retains: `RUN / SHA / BRANCH / PR / FRONT / ROOT CAUSE / ACTION / RESULT / EVIDENCE / BLOCKER / NEXT ACTION`.
Never transfer PASS across SHAs.

## END-OF-RUN RULE
Every execution appends exactly one compact run record here. If a durable product/architecture rule changes, update `PROJECT_MEMORY.md` as well.
