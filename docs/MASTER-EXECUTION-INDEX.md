# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD before this index update: **`484590b6c6fa4b8750aeeaebaebe326cadbbe72c`**
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — checkout, invoice RLS, finance runtime validation and transaction-boundary hardening are implemented on `main`. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Batch 6 execution evidence
- Hardened `src/services/orders.ts` runtime boundaries so malformed non-string IDs, idempotency keys, draft payloads, line arrays and quantities fail closed with deterministic validation errors before RPC use.
- Expanded `src/services/orders.input.test.ts` with adversarial runtime-type coverage for transition input, malformed checkout drafts, product/warehouse IDs and empty line sets.
- No credentials, Auth internals or unrelated projects were mutated.
- Live Supabase authorization review confirms public SECURITY DEFINER functions are executable by `authenticated`/`service_role` rather than `anon`; authorization is enforced by `auth.uid()`/profile-derived organization, customer and role context where applicable.
- Live RLS review confirms public RLS-enabled business tables have authenticated policies scoped by organization/customer/staff context; customer tiers are intentionally global reference data.

## Previous execution evidence
- Batch 5 live migration `batch5_transaction_boundary_hardening` applied to Supabase project `mrcyqezbhpncuvaehwgf` before source commit.
- `record_expense` rejects cross-tenant/inactive branches, unsafe amounts, invalid currency, oversized category/description values.
- `create_purchase_order` has transaction-scoped idempotency locking, bounded keys/notes, currency validation, duplicate-line rejection, runtime parsing guards and total overflow protection.
- `receive_purchase_order` has transaction-scoped idempotency locking, bounded inputs, duplicate-line rejection, safe parsing and deterministic idempotent replay.
- `set_cart_item` database quantity bound is explicitly 1..10000.
- All 34 public RLS-enabled tables have at least one policy; previous invoice-table policy gaps were restored.

## Remaining closure work — priority order
### P0 — Release blockers
1. Produce and commit deterministic `package-lock.json` on a real GitHub runner. Current runner attempts fail before workflow steps; external execution-layer blocker.
2. Obtain fresh step-level typecheck, lint, unit/domain, database/pgTAP, build, security and release-audit evidence for the final exact HEAD.
3. Execute a clean-source Supabase migration reset/pgTAP run and reconcile the complete repository chain against live history.
4. Provision two dedicated non-production authenticated E2E identities (Tenant A/B) through secure runtime secrets; never fabricate or commit credentials.
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

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from the latest exact `main` HEAD. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
