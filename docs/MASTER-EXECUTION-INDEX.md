# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`d0124d1acf6fdff0c72e0ff049c8b65704c2625a`**
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current `main` contains the latest merged security/runtime hardening, FK-index hardening, readiness register, and deployment-payload hardening. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Current execution evidence
- Added `docs/IMPLEMENTATION-READINESS-REGISTER-V1.md` as the explicit source-to-runtime closure register.
- Re-verified the connected Aghbari Commerce Supabase target: 34 public tables exist and all 34 have RLS enabled.
- Re-verified the anonymous RPC execution surface: 0 public routines currently grant `EXECUTE` to `anon`.
- Checked core operational row counts; the checked orders/products/customers/inventory/purchases/outbox/audit tables are empty after negative smoke work.
- Added `.vercelignore` to keep the Vercel deployment payload focused on runtime/build inputs and exclude repository documentation, contracts, CI metadata, reports and test artifacts. No application source or public runtime assets are excluded.
- Retried the exact-head security workflow job; the latest attempt is queued. No opaque pre-step failure is being converted into a product-code diagnosis.

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

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `main` HEAD **`d0124d1acf6fdff0c72e0ff049c8b65704c2625a`**. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
