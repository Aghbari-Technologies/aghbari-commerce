# الأغبري | Memory Layer 03 — PROBLEM / PROGRESS LEDGER

## CURRENT CHECKPOINT — RUN-2026-09-20-EXECUTE-008
- SHA: `1366f8ea240f2b1c58d78a863aa7a5584be531fb`
- Branch: `enhancement/market-ready-v4-20260918`
- PR #88: OPEN / DRAFT; frozen base `2facceb39aaa826413f20245a6f20b6c2ff7cd34`
- Final Regression `35477914059`: SUCCESS.
- Security `35477914046`: SUCCESS; Quality `35477914032`: SUCCESS; G1 `35477914182`/`35477916774`: SUCCESS.
- Test-the-Test `35477914073`, Concurrency `35477914055`, Migration `35477914025`, Browser Fresh `35477913975`, Browser Local `35477913977`: RUNNING.
- Browser deployment workflow `35477929768`: browser-contract SUCCESS; exact deployment browser E2E tracking remains active.
- Netlify `35477914057`: FAILED HTTP 403 account-credit exhaustion.
- Candidate and Production untouched.

## RUN-2026-09-20-EXECUTE-008
- Root cause: `20260920000410_split_customer_profile_role.sql` overwrote the invitation consumer with `search_path=public` and unqualified `digest()`; Fresh DB places pgcrypto in `extensions`, producing exact concurrency failure.
- Fix: `20260920000500_harden_customer_invitation_crypto.sql`; equivalent live hardening applied and verified. Live function is SECURITY DEFINER with empty search_path, `extensions.digest()`, customer role, and service_role-only execution.
- Proof-system fix: critical local Browser and Concurrency workflows now trigger on `enhancement/**`, removing dependence on unavailable workflow dispatch.
- Current exact-SHA proof fronts were intentionally re-opened by the new SHA and are being closed independently. No PASS is transferred.
- Next: close running exact-SHA fronts, then perform candidate-delta reconciliation without candidate mutation.

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
