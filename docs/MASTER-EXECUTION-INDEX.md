# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`0145edced820a1b02050647adb728e1eacbd38e0`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: **`https://alamri.app/` (بوابة العامري الذكية)** is treated only as an external UX/product benchmark; Aghbari identity, naming and implementation remain independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current main contains the validated cart boundary fix, operation-idempotency authorization hardening, import numeric-input hardening, search_path hardening, and product-price tenant-boundary hardening. |
| VERIFIED | **NOT PROVEN** — fresh exact-head GitHub Actions quality evidence is still required. |
| RUNTIME PROVEN | **PARTIAL / NOT CERTIFIED** — live Supabase authenticated-context proof exists for core tenant/order behavior; browser and deployed-runtime proof remain required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification remains open until all release/runtime gates are green. |

## Latest execution boundary — 2026-09-09
- Main exact HEAD is **`0145edced820a1b02050647adb728e1eacbd38e0`**, superseding the previous documentation boundary.
- `package-lock.json` is present on `main`, lockfileVersion **3**, and its root package/dependency versions align with `package.json`. Exact CI verification is still required.
- Live Supabase project `aghbari-commerce` is **ACTIVE_HEALTHY** on PostgreSQL 17.6.1.
- Supabase security advisor no longer reports the prior `function_search_path_mutable` finding for `public.try_parse_import_numeric`; the function is immutable with explicit `search_path=pg_catalog, public` and no anon/authenticated EXECUTE grant.
- The live migration history contains `20260909020811_harden_import_numeric_search_path` and now also **`20260909021428_harden_product_prices_rls_organization_boundary`**. The repository contains the exact matching new migration file.
- A concrete tenant-isolation defect was found and fixed: `product_prices_staff_read` previously used only `is_staff()` and therefore lacked an organization predicate despite `product_prices` carrying `organization_id`. The live policy now requires `organization_id = current_organization_id()` **and** `is_staff()`.
- Live `product_prices` currently contains **2 rows and 0 NULL organization_id values**.
- Current Supabase security advisor warnings are limited to the intentional authenticated `SECURITY DEFINER` RPC surface (44 findings) and one external Auth configuration warning: leaked-password protection is disabled. These are not silently marked PASS.
- All **45/45 public tables have RLS enabled**.
- Current public RPC surface has **0 anon-executable functions**; authenticated execution is limited to the application RPC surface, with internal trigger/parser functions not exposed to authenticated clients.
- Adversarial parser checks passed for valid numeric input, whitespace/sign handling, overflow, injection-shaped input, and null input.
- Vercel remains externally blocked: access under team `team_xN16zQ6PKax27q3` / project `prj_h0zMpkGAEXB7hR4G153` returns **403 Forbidden / re-authentication required**. The GitHub Vercel status currently reports **failure** with a build-rate-limit target. No unrelated Vercel project was mutated.

## Runtime/security evidence already proven
- Tenant A catalog authorization returns only its authorized product/price/warehouse context.
- Tenant A created a real proof order and idempotent replay returned the same persisted order reference without creating a duplicate.
- Tenant A cannot use Tenant B's warehouse through the authoritative catalog RPC (`42501 warehouse not available`).
- Cart RPCs enforce authenticated customer context and organization/customer scoping server-side.
- `try_parse_import_numeric` is hardened against mutable search-path execution and is not directly callable by anon/authenticated clients.
- The application quality workflow checks out and verifies an exact SHA before typecheck, tests, lint, build and release audit.
- The migration-proof workflow performs duplicate-version checks, a clean local migration reset, pgTAP tests, and local migration inventory verification against its exact SHA.
- Runtime E2E is explicitly wired for exact-SHA checkout and authenticated browser evidence, but execution still requires runtime credentials and deployed URL.

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

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact **`0145edced820a1b02050647adb728e1eacbd38e0`**. Resolve code/database defects immediately; external runner/deployment gates remain explicitly blocked until executable evidence is obtained.
