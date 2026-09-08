# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD before this index update: **`c73f1551bfdb1ebdfb993d959b2e16e9255f47a0`**
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current `main` contains the latest merged security/runtime hardening, FK-index hardening, readiness register, deployment-payload hardening, and checkout input hardening. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Current execution evidence
- `docs/IMPLEMENTATION-READINESS-REGISTER-V1.md` remains the source-to-runtime closure register.
- The latest checkout hardening batch validates warehouse UUIDs, bounds idempotency keys, limits checkout lines, validates product UUIDs, rejects duplicate products, requires safe positive integer quantities, and fails closed on an untrustworthy create-order response.
- Regression coverage for checkout input boundaries and false-success guards exists in `src/services/orders.input.test.ts`; execution evidence is still runner-gated.
- The latest source review covers catalog, customers/suppliers, cart/orders, inventory/purchasing, pricing/finance, auth/RLS, idempotency/concurrency, import/export, outbox/workers, PWA/offline, security/build and production boundaries. Implementations are present where recorded; remaining closure is executable proof.
- Connected Supabase evidence previously established 34/34 public tables with RLS enabled and 0 public routines granting `EXECUTE` to `anon`.
- `.vercelignore` keeps deployment payload focused on runtime/build inputs; no application source or public runtime assets are excluded.

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

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `main` HEAD after this index commit. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
