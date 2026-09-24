# 🔴 AGHBARI LATEST EXECUTION STATE

**Verified Functional HEAD:** 0bf3322f007227eed4eeec54c8943f33caee5e9f
**Documentation checkpoint:** this write-back follows the verified functional HEAD above.
**Branch:** main
**Production:** NO TOUCH
**Certification:** NOT CLAIMED

## CURRENT REALITY
- The functional product baseline is 0bf3322f007227eed4eeec54c8943f33caee5e9f.
- Governance/RBAC/notifications UI is real, persisted, permission-aware, and connected to canonical RPCs.
- Canonical role management and notification read RPCs are hardened with SECURITY DEFINER + empty search_path and authenticated-only execution.
- RLS helper execution is intentionally retained for authenticated users because RLS policies call those helpers; anon/public remain denied.
- Live Vercel deployment for 0bf3322f... is READY and official alias returns HTTP 200.
- The newest Browser E2E run fails only at Vercel Deployment Protection bypass: 50 redirects while fetching build-meta with the configured automation secret. No application assertion ran after that gate.
- Security Advisor is 62 authenticated SECURITY DEFINER findings plus one external leaked-password-protection warning.
- Promotions is not implemented because its business/data contract is not present in the live schema/canonical contract.

## EXACT-SHA PROOF MATRIX — FUNCTIONAL HEAD 0bf3322f...
| Gate | Status |
|---|---|
| Application Quality | PASS — run 3786 |
| Security Audit | PASS — run 3476 |
| G1 Domain Proof | PASS — run 3743 |
| Order Workflow Proof | PASS — run 1982 |
| Browser Contract | PASS — run 1110 |
| Bootstrap Release Lockfile | PASS — run 1191 |
| Migration Proof | IN PROGRESS — run 3760 |
| Concurrency Proof | IN PROGRESS — run 985 |
| Test-the-Test | IN PROGRESS — run 1125 |
| Browser E2E | BLOCKED at Vercel Protection bypass gate — run 1111 |

## OPEN GAPS
1. Complete the three heavy exact-SHA proofs above.
2. Repair the Vercel automation bypass secret/trusted-source path without weakening deployment protection.
3. Complete SECURITY DEFINER classification individually; retain intentional transactional RPC access.
4. Finish semantic consolidation of legacy Markdown sources.
5. Define Promotions business/data contract before implementation.

## CURRENT RESUME POINTER
START FROM ACTUAL REPOSITORY HEAD, THEN VERIFY THE FUNCTIONAL BASELINE 0bf3322f007227eed4eeec54c8943f33caee5e9f.

UI FRONT:
Admin → Access Control → owner/non-owner/customer role states; Staff → Notifications/Governance; Customer → Notifications → unread persistence and retry/error states.

CORE FRONT:
Canonical organization user role RPC + RLS helper privilege boundary; prove tenant isolation, self-role rejection, customer promotion rejection, last-owner protection, audit emission.

VERIFY:
Use only exact-SHA evidence on the current functional baseline and do not transfer evidence from any earlier SHA.

DEPLOY:
Vercel production deployment dpl_9dvUwuWFZPisrC76b9vGWpEA6TRq. Runtime is READY. Browser E2E is blocked only by protection-bypass authentication at build-meta fetch.

DO NOT REPEAT:
Do not reopen proven catalog/search/checkout/order/idempotency foundations unless current exact-SHA regression appears.

Production remains NO TOUCH.
