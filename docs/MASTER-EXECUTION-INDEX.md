# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD before this index update: **`51f24043b026ce3582da7624315b794c2b94e1c7`**
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current `main` contains checkout hardening, invoice RLS restoration, finance runtime-boundary validation and associated regression coverage. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Current execution evidence
- Checkout input boundaries and false-success guards have regression coverage.
- Finance validators now explicitly reject malformed non-string runtime values before string operations, while preserving currency/payment allowlists and numeric safety bounds.
- `src/services/finance.input.test.ts` covers malformed runtime types, unsupported payment methods, unsafe amounts, invalid currency, and length boundaries.
- Connected Supabase project `mrcyqezbhpncuvaehwgf` is ACTIVE_HEALTHY.
- Live database verification shows all 34 public RLS-enabled tables have at least one policy; no RLS-enabled public table remains policy-empty.
- Live security advisor no longer reports the previous invoice-table RLS gaps. Remaining SECURITY DEFINER warnings are generic authenticated-role exposure advisories; live function-body inspection confirmed the operational command functions use context/role checks.
- Live migration inventory contains 38 applied migrations. Its timestamp prefixes differ from repository filenames because Supabase records applied versions with generated timestamps; migration names map to the repository chain. Clean-source reset/pgTAP execution remains unproven until a runner can execute it.
- Performance advisor currently reports unused indexes because operational tables are empty/test-light. These are informational; FK/query-support indexes are not being removed blindly.
- `.vercelignore` remains deployment-payload hardened.

## Remaining closure work — priority order
### P0 — Release blockers
1. Produce and commit deterministic `package-lock.json` on a real GitHub runner. Current runner attempts fail before the first workflow step; this remains an external GitHub Actions execution-layer blocker.
2. Obtain fresh step-level typecheck, lint, unit/domain, database/pgTAP, build, security and release-audit evidence for exact HEAD.
3. Execute a clean-source Supabase migration reset/pgTAP run and reconcile the complete repository chain against live history.
4. Provision two dedicated non-production authenticated E2E identities (Tenant A/B) using credentials supplied through secure runtime secrets; never fabricate or commit credentials.
5. Execute authenticated browser E2E, including tenant isolation and exact-created-order persistence.
6. Connect/deploy the actual Aghbari Vercel project and execute runtime smoke against the exact deployed SHA. No unrelated Vercel project will be mutated.

### P1 — Reliability proof
7. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
8. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
9. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
10. Re-run full pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
11. Complete query-plan and representative-load review with production-like data.
12. Complete observability, audit, backup/recovery and rollback evidence.
13. Deploy release candidate → exact-SHA smoke → final regression → freeze exact HEAD → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `main` HEAD after this index commit. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
