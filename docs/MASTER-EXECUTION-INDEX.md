# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`c6e698ed07e9d7f91c76253a26e6cf65db3d1cb2`**
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current `main` contains the latest merged security/runtime hardening plus today's FK-index hardening. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Completed today
- Merged PR #42 (`security/rpc-surface-final6`) into `main` after exact-head review.
- Hardened the lockfile bootstrap workflow with deterministic npm diagnostic capture and artifact upload.
- Added 25 missing operational foreign-key/tenant coverage indexes identified by the live database performance advisor.
- Added pgTAP coverage for all 25 new indexes.
- Applied the same index migration to the connected Aghbari Commerce Supabase project and re-ran the Performance Advisor: the previous unindexed-FK findings are cleared; only unused-index informational notices remain.
- Verified the live Aghbari database currently has 34 public tables with RLS enabled.
- Verified the live RPC privilege surface and executed negative authenticated-role smoke checks; anonymous/unauthorized catalog/order paths were rejected as expected.
- Verified no temporary test data was left behind in the live target for organizations/customers/products/orders/purchases/invoices/outbox/audit events.
- Closed stale PRs #14, #32 and #39 after their work was already superseded/integrated.

## Live Supabase evidence
- Target project: `mrcyqezbhpncuvaehwgf` (Aghbari Commerce).
- Live migration history is ahead of the repository's older migration numbering and currently reaches the operational `0062_fix_receive_purchase_order_status_enum` change set. This source/live migration-history divergence is an explicit release-readiness item and must be reconciled before claiming fresh-environment certification.
- Direct catalog inspection is authoritative for current database state; no PASS is inferred solely from an advisor cache.

## Remaining closure work — priority order
### P0 — Release blockers
1. Produce and commit a deterministic `package-lock.json` on a real GitHub runner.
2. Obtain fresh step-level typecheck, lint, unit/domain, database/pgTAP, build, security and release-audit evidence for the exact current HEAD.
3. Reconcile the repository migration chain with the live migration history/schema so a clean environment can be provisioned deterministically from source.
4. Execute authenticated browser E2E with real credentials, including tenant isolation and exact-created-order persistence.
5. Execute deployment/runtime smoke tests against the exact deployed build SHA.

### P1 — Reliability proof
6. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
7. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
8. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
9. Re-run full pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
10. Complete query-plan and representative load review with production-like data.
11. Complete observability, audit, backup/recovery and rollback evidence.
12. Deploy release candidate → exact-SHA smoke → final regression → freeze exact HEAD → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `main` HEAD **`c6e698ed07e9d7f91c76253a26e6cf65db3d1cb2`**. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
