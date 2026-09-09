# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`dfb18643555b56fcccc90df4925e44b06492a557`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: **`https://alamri.app/` (بوابة العامري الذكية)** is treated only as an external UX/product benchmark; Aghbari identity, naming and implementation remain independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current main contains the validated cart boundary fix, operation-idempotency authorization hardening, import numeric-input hardening, and the latest search_path hardening migration. |
| VERIFIED | **NOT PROVEN** — fresh exact-head GitHub Actions quality evidence is still required. |
| RUNTIME PROVEN | **PARTIAL / NOT CERTIFIED** — live Supabase authenticated-context proof exists for core tenant/order behavior; browser and deployed-runtime proof remain required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification remains open until all release/runtime gates are green. |

## Latest execution boundary — 2026-09-09
- Main advanced from `886d2c6c79224aa2e9725f21c961cfea4aa43e4a` through a real security remediation to exact HEAD **`dfb18643555b56fcccc90df4925e44b06492a557`**.
- Live Supabase project `aghbari-commerce` was verified **ACTIVE_HEALTHY** on PostgreSQL 17.6.1.
- Supabase security advisor exposed one concrete `function_search_path_mutable` finding for `public.try_parse_import_numeric`; this was fixed live with `search_path = pg_catalog, public`, then re-queried successfully.
- The applied migration was recorded in Supabase as **`20260909020811_harden_import_numeric_search_path`** and the repository now contains the matching migration filename/content, eliminating migration-history filename drift.
- Post-fix security advisor no longer reports the `function_search_path_mutable` finding. It still reports the intentional exposed `SECURITY DEFINER` RPC surface as warnings and one Auth configuration warning for leaked-password protection being disabled; these are not silently marked PASS.
- Exact current `main` points to the remediation commit above. The previous `886d2c6...` boundary remains superseded and is not used for certification.
- Vercel remains externally blocked: project/deployment access under team `team_xN16zQ6PKax27q3` returns **403 Forbidden / re-authentication required**. No unrelated Vercel project was mutated.

## Runtime/security evidence already proven
- Tenant A catalog authorization returns only its authorized product/price/warehouse context.
- Tenant A created a real proof order and idempotent replay returned the same persisted order reference without creating a duplicate.
- Tenant A cannot use Tenant B's warehouse through the authoritative catalog RPC (`42501 warehouse not available`).
- Cart RPCs enforce authenticated customer context and organization/customer scoping server-side.
- `try_parse_import_numeric` is now immutable with an explicit `search_path=pg_catalog, public`, has no anon/authenticated EXECUTE grant, and its previous mutable-search-path warning is cleared.
- The application workflow definition verifies an exact SHA before running typecheck, tests, lint, build and release audit, but a fresh successful run for the current exact HEAD is still required.

## Remaining closure work — priority order
### P0 — Release blockers
1. Obtain fresh exact-head GitHub Actions evidence for typecheck, lint, unit/domain tests, build and release audit.
2. Execute a clean-source Supabase migration reset/pgTAP run and reconcile the complete repository migration chain against live history.
3. Execute authenticated browser E2E, including tenant isolation and exact-created-order persistence.
4. Re-authenticate the connected Vercel team scope and verify/deploy the exact current SHA; then execute runtime smoke against the deployed SHA.
5. Resolve the remaining Auth leaked-password-protection configuration warning before production certification.

### P1 — Reliability proof
6. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
7. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
8. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
9. Re-run full pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
10. Complete query-plan and representative-load review with production-like data.
11. Complete observability, audit, backup/recovery and rollback evidence.
12. Deploy release candidate → exact-SHA smoke → final regression → freeze exact HEAD → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `dfb18643555b56fcccc90df4925e44b06492a557`. Resolve code/database defects immediately; external runner/deployment gates remain explicitly blocked until executable evidence is obtained.
