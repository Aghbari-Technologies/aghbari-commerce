# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `execution/day2-product-gap-closure`
- Current repository HEAD: **`56bba6770a5bcc809ca6a4ebcc6655858a908745`**.
- Current application implementation SHA: **`78bfa68f909132a6d2dab5e2888fe95f000fa25e`**.
- `56bba677...` contains test-infrastructure changes only after the verified application implementation head.
- Registry-only commits must never be used as code-test SHAs.
- Scope: **Aghbari Commerce only.**

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — core commerce, catalog/pricing, cart/orders, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — DB-backed templates and server-authoritative Excel Quick Order are implemented. Atomic template-apply RPC exists but customer App integration remains open. |
| VERIFIED | **SUBSTANTIAL / NOT FINAL** — exact-head application quality/G1/security/order workflow PASS on `56bba677...`; fresh migration and concurrency are still open. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser execution has not been run with real credentials in this batch. |
| PRODUCTION CERTIFIED | **NOT PROVEN**. |

## Latest execution boundary — 2026-09-11
- Exact-head CI on repository HEAD `56bba677...`: application-quality **PASS**, G1 **PASS**, security-audit **PASS**, Order Workflow Proof **PASS**.
- Migration proof exposed a real defect on earlier exact target `3299b698...`: `20260908010000_restore_operational_invoice_rls.sql` attempted to create `operational_invoices_read` when that policy already existed. The current branch migration is now idempotent by dropping those policy names if present before recreation. This was verified in the branch file. fileciteturn402file0L2-L10
- The migration proof workflow itself was corrected: YAML folded `run: >-` blocks were converting multiple test paths into one shell command. Targeted and regression pgTAP batches now execute one explicit `supabase test db --local <file>` command per test file. Supabase documents that `supabase test db [path] ...` supports explicit test paths. citeturn0search0
- Current fresh migration proof run `34607712342` is queued; no pgTAP PASS is claimed until the complete reset and test sequence succeeds.
- Current fresh concurrency proof run `34607712260` is in progress; no new PASS is claimed until its DB result is captured.
- Test numbering check: `supabase/tests/014-order-templates-boundary.test.sql` exists and contains its own pgTAP plan/evidence boundary. fileciteturn400file0L2-L10

## Exact evidence currently valid
- `56bba677...` application-quality: PASS.
- `56bba677...` G1 Domain Proof: PASS.
- `56bba677...` security-audit: PASS.
- `56bba677...` Order Workflow Proof: PASS.
- `78bfa68...` live targeted Supabase `create_order`: valid pending/2000.00; idempotent replay; cross-tenant warehouse rejection; transaction rollback.
- `78bfa68...` live purchase-receipt outbox trigger: `purchase.received` emitted transactionally then rolled back in proof.
- `751058...` prior concurrency proof: PASS; fresh `56b...` concurrency is still in progress.
- Order Templates DB/adversarial evidence remains closed unless impact/regression appears.
- Quick Order DB/idempotency/audit evidence remains closed unless impact/regression appears.

## Current open gates
### P0
1. Fresh exact-head migration reset + pgTAP 014/015/016 and regression batches.
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
