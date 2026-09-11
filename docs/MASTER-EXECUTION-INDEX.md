# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `execution/day2-product-gap-closure`
- Current repository HEAD: **`e54636a33440f6e9ec985dcf6545dcdb60734270`**.
- Current application implementation SHA: **`78bfa68f909132a6d2dab5e2888fe95f000fa25e`**.
- `e54636a...` is a registry-only commit after the latest test/workflow changes; never use it as application-code evidence.
- Scope: **Aghbari Commerce only.**

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — core commerce, catalog/pricing, cart/orders, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — DB-backed templates and server-authoritative Excel Quick Order are implemented. Atomic template-apply RPC exists and now has a dedicated server-boundary pgTAP test; browser integration remains open. |
| VERIFIED | **SUBSTANTIAL / NOT FINAL** — exact-head application quality/G1/security/order workflow PASS on `56bba677...`; fresh migration proof is pending after the latest workflow/test changes. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser execution has not been run with real credentials in this batch. |
| PRODUCTION CERTIFIED | **NOT PROVEN**. |

## Latest execution boundary — 2026-09-11
- Exact-head CI on `56bba677...`: application-quality **PASS**, G1 **PASS**, security-audit **PASS**, Order Workflow Proof **PASS**.
- Migration proof exposed a real defect on earlier exact target `3299b698...`: `20260908010000_restore_operational_invoice_rls.sql` attempted to create `operational_invoices_read` when that policy already existed. The current migration was made idempotent by dropping those policy names if present before recreation.
- Migration proof infrastructure was corrected: folded YAML command blocks were replaced by one explicit `supabase test db --local <file>` invocation per pgTAP file.
- Test-numbering audit confirmed `014-order-templates-boundary.test.sql` exists; it is a 4-assertion pgTAP contract. The existing `015` and `016` adversarial/server-boundary files also exist. A new `022-order-template-apply-server-boundary.test.sql` was added for the atomic server-side template application path. fileciteturn435file0L2-L6 fileciteturn439file0L2-L6 fileciteturn440file0L2-L6
- Workflow now executes targeted `014/015/016/022` individually before the regression suites. fileciteturn437file0L2-L6
- Fresh migration-proof run `34607712342` was reactivated; at the latest inspection it had passed exact SHA validation and was in `Start local Supabase`. No PASS is claimed before all reset/pgTAP stages complete.
- Fresh concurrency run was previously cancelled by workflow supersession; prior `751058...` PASS remains valid only for its exact SHA. A new exact-current-SHA run is required.

## Exact evidence currently valid
- `56bba677...` application-quality: PASS.
- `56bba677...` G1 Domain Proof: PASS.
- `56bba677...` security-audit: PASS.
- `56bba677...` Order Workflow Proof: PASS.
- `78bfa68...` live targeted Supabase `create_order`: valid pending/2000.00; idempotent replay; cross-tenant warehouse rejection; transaction rollback.
- `78bfa68...` live purchase-receipt outbox trigger: `purchase.received` emitted transactionally then rolled back in proof.
- `751058...` prior concurrency proof: PASS; not transferable to a changed SHA.
- Order Templates DB/adversarial evidence remains closed unless impact/regression appears.
- Quick Order DB/idempotency/audit evidence remains closed unless impact/regression appears.

## Current open gates
### P0
1. Fresh exact-head migration reset + pgTAP 014/015/016/022 and regression batches.
2. Customer authenticated browser E2E with real configured credentials.
3. Cross-tenant/cross-customer browser + direct API/RPC bypass evidence.
4. Full order lifecycle runtime: customer order → merchant confirm/process → inventory consistency → customer status → invoice/account/audit.
5. Production deployment exact-SHA verification and runtime evidence.

### P1
6. Fresh true multi-session concurrency: Stock 10 / Session A 8 / Session B 8, with DB proof.
7. Double checkout / duplicate submit / retry / duplicate Quick Order / duplicate import idempotency proof.
8. Failure engineering: expired/invalid session, network/DB failure, OOS, changed price, malformed Excel, invalid/expired invitation, refresh/back during checkout.
9. Offline/reconnect/replay/outbox delivery proof if those features are in active scope.
10. Admin/RBAC runtime role matrix and API/RPC privilege escalation proof.
11. Finance runtime: invoice → order relationship → amount → payment state → account/ledger consistency.
12. Browser matrix execution: Chrome, Edge, Firefox, desktop, tablet, mobile.

### P2
13. Load/query-plan review, observability, backup/recovery, rollback evidence, final regression and release freeze.

## No-false-closure
`IMPLEMENTED` ≠ `VERIFIED` ≠ `VERIFIED_DB` ≠ `VERIFIED_RUNTIME` ≠ `PRODUCTION_CERTIFIED`.
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued event is not successful delivery evidence. A green run on another SHA is not current-head evidence. No credentials are fabricated.

## Resume
Load `project_execution_state.json`, this index, current branch SHA, blockers and evidence. Reuse known registries; discover only when the registry lacks the required fact. Do not reopen closed features without impact.
