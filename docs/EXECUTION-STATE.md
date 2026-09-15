# EXECUTION STATE

CURRENT_HEAD: `d30c789a648a21955e22ee1c7f831283de25e272`
CURRENT_CANDIDATE: `d30c789a648a21955e22ee1c7f831283de25e272`
CURRENT_PRODUCTION: `6bdfd97df4417d7ab6a533a29ad77c43c45ac0a8`
LAST_CERTIFIED_EVIDENCE: `NONE` on current candidate
LAST_CLEAN_DB: `34912403160` — FAIL on older production SHA; replay fixes are in source; fresh current-candidate replay is now queued
LAST_CI: `d30c789a648a21955e22ee1c7f831283de25e272` — prior parent quality exposed missing `apply_quick_order` migration history; source migration restored; exact-head rerun pending
LAST_SECURITY: `19eb61aee1baaccae2c15924687ea36b08a83582` — exact-head security-audit PASS; authenticated adversarial runtime not certified
LAST_BROWSER_E2E: `NONE` on current candidate
LAST_PRODUCTION_SMOKE: `6bdfd97df4417d7ab6a533a29ad77c43c45ac0a8` — READY production deployment; HTTP smoke not yet recertified for candidate

## TRACKS
| TRACK | STATE | EXACT SHA | LAST PROOF | BLOCKER | NEXT ACTION |
|---|---|---|---|---|---|
| Quick Order Migration History | FIXED | `d30c789...` | missing RPC contract restored to source migrations | exact-head audit | quality + clean replay |
| Template Runtime | FIXED | `19eb61a...` | UI calls atomic `apply_order_template` service | browser witness | run create/persist/refresh/apply/delete E2E |
| Clean DB | RUNNING | `d30c789...` | replay fixes + quick-order history fix in source | current replay | finish fresh replay; fix next dependency immediately |
| Exact-head CI | RUNNING | `d30c789...` | parent: 176 tests + typecheck + build + security/order proof; release audit exposed missing RPC | current rerun | finish quality/security/order/release audit |
| Security | OPEN | `d30c789...` | security-audit PASS on parent; 0 anon executable sensitive RPCs | authenticated adversarial runtime | execute risk-based RPC matrix |
| Tenant A/B | OPEN | `d30c789...` | SQL/RLS baseline + selected rejection probes | browser proof | rerun exact-head browser isolation |
| Customer Journey | OPEN | `d30c789...` | selector drift diagnosed and fixed | browser run | rerun exact-head customer journey |
| Templates | OPEN-PROOF | `d30c789...` | cloud persistence + atomic apply implementation fixed | browser witness | persistence/apply/delete E2E |
| Excel | PREPARED | `d30c789...` | integration/build path | runtime fixture | adversarial import fixture |
| Invitation | ACTION REQUIRED | `d30c789...` | implementation/schema | admin principal | provision admin then execute invite/replay |
| Outbox | PREPARED | `d30c789...` | schema/event implementation | delivery runtime | enqueue/claim/fail/retry/idempotency |
| Finance | PREPARED | `d30c789...` | implementation/schema | authenticated runtime | invoice/payment/statement lifecycle |
| Inventory | PREPARED | `d30c789...` | schema/security baseline | authenticated runtime | mutation/idempotency/ownership attacks |
| RBAC | PREPARED | `d30c789...` | role model/baseline | authenticated principals | wrong-role/wrong-tenant/object tests |
| Import/Export | PREPARED | `d30c789...` | import hardening source | authenticated runtime | adversarial fixture matrix |
| Dynamic Admin | PREPARED | `d30c789...` | admin command surface | admin runtime principal | propagation/authorization proof |
| Offline/Recovery | OPEN | `d30c789...` | no runtime witness | browser runtime | reconnect/idempotency E2E |
| Shipping/Returns | PREPARED | `d30c789...` | no certified runtime witness | authenticated runtime | inspect then execute supported path |
| Production | OPEN | `d30c789...` | production now maps to docs-only descendant; candidate mapping not certified | exact candidate deployment + browser | verify Vercel candidate mapping after CI |
| Leaked Password | ACTION REQUIRED | `d30c789...` | disabled | Supabase/provider configuration | owner enables/configures; verify |

`PREPARED` = implementation/schema/automated preparation only; never certification. `OPEN-PROOF` = implementation fix is present but runtime proof is absent. `ACTION REQUIRED` = explicit owner intervention is required; not a silent blocker.

## P0 REMAINING
Clean DB; exact-head application-quality/security/order proof; authenticated adversarial security; Tenant A/B browser proof; authenticated customer E2E; invitation/admin; outbox runtime; RBAC runtime; finance runtime; inventory runtime; import/export runtime; offline/recovery; production exact-SHA proof; leaked-password decision; final regression/certification.

## P1 REMAINING
Shipping/returns runtime closure; dynamic admin runtime closure; performance delta regression; evidence/index reconciliation.

## P2 REMAINING
Non-certification product enhancements.

## OWNER ACTIONS
1. **Admin principal:** create/provision a dedicated non-production owner/admin Auth user and GitHub Actions secrets `E2E_ADMIN_EMAIL` + `E2E_ADMIN_PASSWORD`; never paste the password into chat. Then reply `DONE ADMIN`.
2. **Leaked Password Protection:** enable Supabase Auth leaked-password protection if the project/plan exposes it; do not change production data/migrations for this.
3. **Production mapping:** after candidate freeze, map the exact candidate SHA to Vercel production and verify the live artifact.

## NEXT 5 EXECUTABLE ACTIONS
1. Finish exact-head application-quality + migration proof for `d30c789...`; every failure gets root-cause fix → retest.
2. Rerun customer + Tenant A/B browser E2E on the exact candidate; no prior PASS transfer.
3. Execute authenticated adversarial RPC matrix for orders/templates/inventory/finance/import/RBAC; record expected rejection + no side effect.
4. After `DONE ADMIN`, run full invitation journey and admin/RBAC propagation proof.
5. Freeze the candidate, map exact SHA → Vercel production → live artifact, run final regression and issue certification only if every boundary passes.
