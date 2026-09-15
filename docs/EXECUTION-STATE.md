# EXECUTION STATE

CURRENT_HEAD: `f4a075bf511725763b7c75281bfa39dea3b9ea44`
CURRENT_CANDIDATE: `f4a075bf511725763b7c75281bfa39dea3b9ea44`
CURRENT_PRODUCTION: `694756d78532aac649042b6cbe31ae3c3f8492d1`
LAST_CERTIFIED_EVIDENCE: `NONE` on current candidate
LAST_CLEAN_DB: `34912403160` — FAIL on older production SHA; replay fixes are now in source
LAST_CI: `f4a075bf511725763b7c75281bfa39dea3b9ea44` — exact-head rerun required after docs-only SHA change; prior PASS not transferable
LAST_SECURITY: `f4a075bf511725763b7c75281bfa39dea3b9ea44` — baseline evidence retained as knowledge; adversarial runtime not certified
LAST_BROWSER_E2E: `NONE`
LAST_PRODUCTION_SMOKE: `694756d78532aac649042b6cbe31ae3c3f8492d1` — HTTP 200; not candidate proof

## TRACKS
| TRACK | STATE | EXACT SHA | LAST PROOF | BLOCKER | NEXT ACTION |
|---|---|---|---|---|---|
| Clean DB | RUNNING | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | replay fixes in source | migration proof | finish clean replay; fix next dependency if exposed |
| Exact-head CI | RUNNING | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | prior checks on parent SHA only | exact-head rerun | observe/re-run required checks |
| Security | RUNNING | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | anon/public RPC baseline | authenticated principals | execute risk-based adversarial matrix |
| Tenant A/B | ACTION REQUIRED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | schema/RLS baseline | two authenticated principals | create isolated test principals, then execute matrix |
| Customer Journey | ACTION REQUIRED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | Playwright harness present | authenticated browser credentials | provision test principal(s), then execute journey |
| Templates | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | cloud persistence/application path | browser witness | run persistence/apply/delete E2E |
| Excel | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | integration/build path | runtime fixture/browser | adversarial import fixture |
| Invitation | ACTION REQUIRED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | implementation/schema | authenticated principal/email path | provision principal + execute invite/replay |
| Outbox | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | schema/event implementation | delivery runtime/secret if required | execute enqueue/claim/fail/retry/idempotency |
| Finance | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | implementation/schema | authenticated runtime | execute invoice/payment/statement lifecycle |
| Inventory | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | schema/security baseline | authenticated runtime | execute mutation/idempotency/ownership attacks |
| RBAC | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | role model/baseline | authenticated principals | direct wrong-role/wrong-tenant/object tests |
| Import/Export | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | import hardening migrations | authenticated runtime | adversarial fixture matrix |
| Dynamic Admin | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | admin command surface | runtime principal | propagation/authorization proof |
| Offline/Recovery | ACTION REQUIRED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | harness not yet witnessed | browser runtime | authenticated reconnect/idempotency E2E |
| Shipping/Returns | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | no certified runtime witness | authenticated runtime | inspect then execute supported path |
| Performance | PREPARED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | init-plan findings previously cleared | changed-surface delta | run only affected regression |
| Production | ACTION REQUIRED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | old production READY/HTTP 200 | candidate deployment mapping | deploy/map candidate then smoke |
| Leaked Password | ACTION REQUIRED | `f4a075bf511725763b7c75281bfa39dea3b9ea44` | disabled | Supabase/provider configuration | owner enables/configures; verify |

`PREPARED` = implementation/schema/automated preparation only; never certification. `ACTION REQUIRED` = explicit owner intervention is required; not a silent blocker.

## P0 REMAINING
Clean DB; exact-head CI; authenticated adversarial security; Tenant A/B; authenticated browser E2E; invitation; outbox; RBAC; finance; inventory; import/export; offline/recovery; production exact-SHA proof; leaked-password decision; final regression/certification.

## P1 REMAINING
Shipping/returns runtime closure; dynamic admin runtime closure; performance delta regression; evidence/index reconciliation.

## P2 REMAINING
Non-certification product enhancements.

## OWNER ACTIONS
1. **Test principals:** create two dedicated non-production/test Auth users (A and B) in Supabase Authentication for runtime isolation/E2E. Do not use real customer credentials. If the Auth UI/API cannot create them, provide the exact admin/provider mechanism available in your environment.
2. **Leaked Password Protection:** enable the Supabase Auth leaked-password protection setting if your project/plan/provider configuration exposes it; do not alter production data or migrations for this.
3. **Production mapping:** when the candidate is ready, allow/deploy the exact candidate SHA to the configured Vercel project so its live artifact can be mapped and smoked.

## NEXT 5 EXECUTABLE ACTIONS
1. Finish clean-source migration replay on `f4a075...` and fix the next replay dependency immediately if exposed.
2. Execute exact-head CI for `f4a075...`; no parent-SHA PASS transfer.
3. Run all safe SQL-side security/RBAC/tenant/inventory/finance/outbox invariant probes that require no principal.
4. Resolve OWNER ACTION #1; immediately execute Tenant A/B + Customer Journey + RBAC + Security runtime once principals exist.
5. Resolve OWNER ACTION #2 while independent runtime tracks proceed; later map the final candidate to production and run exact-SHA smoke.
