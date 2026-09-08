# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`510e0d35fff385b90104407454b0466832b0eddc`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: **`https://alamri.app/` (بوابة العامري الذكية)** is treated only as an external UX/product benchmark; Aghbari identity, naming and implementation remain independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — checkout, invoice RLS, finance runtime validation, transaction-boundary hardening, identity-helper ACL hardening, deterministic Vercel install contract, responsive navigation hardening, Product/UI Excellence interaction-state hardening, export completeness/current-price handling, and runner-backed lockfile bootstrap are implemented on `main`. |
| VERIFIED | **NOT PROVEN** — a fresh exact-head GitHub Actions quality run has not yet completed successfully. |
| RUNTIME PROVEN | **PARTIAL / NOT CERTIFIED** — live Supabase authenticated-context database proof now covers catalog authorization, tenant/warehouse binding, order creation, inventory decrement and idempotent replay; browser and deployed-runtime proof are still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until all runtime and release evidence is green. |

## Latest execution boundary
- Added `.github/workflows/bootstrap-lockfile.yml` so a real GitHub runner generates `package-lock.json` with Node 22, validates it with `npm ci`, and commits only the generated lockfile back to `main`; the workflow is guarded against bot recursion and does not store credentials.
- This closes the repository-side mechanism for the deterministic-lockfile blocker, but **does not claim completion until the runner actually executes and the resulting lockfile is present and verified**.
- Two dedicated non-production Supabase Auth identities for the Tenant A/B runtime path were provisioned and verified.
- Live Supabase fixture linkage is present for both identities: each has its own organization, branch, warehouse, customer, profile, category, product, wholesale price and positive inventory fixture. The fixtures use fixed E2E-only identifiers and contain no credentials.
- Fixture verification returned one isolated fixture per tenant in each core fixture table, including `inventory_balances` with quantity 100.
- Authenticated-context DB execution was exercised by setting the E2E user's JWT subject inside a transaction: Tenant A successfully read its catalog with its authorized wholesale price and warehouse stock, successfully created order `#9` for 1 unit at YER 1,000, and an immediate replay with the same idempotency key returned the same persisted order reference without creating a duplicate. The replay transaction was rolled back, preserving the single committed proof order.
- A Tenant A attempt to read Tenant B's warehouse through the authoritative catalog RPC was rejected with `42501 warehouse not available`, proving the RPC's tenant/warehouse boundary rather than merely relying on UI filtering.
- Source inspection confirms the current Admin service exposes tenant-scoped category/product/price/inventory commands but does **not** expose an organization/profile onboarding command; the fixture was therefore provisioned through the privileged test/bootstrap boundary rather than a browser-side RLS bypass.
- The authenticated runtime E2E workflow requires two credential pairs, an HTTPS deployed URL, and an exact certification SHA before execution.
- No credentials are stored in the repository or documentation.

## Export reliability boundary
- Product export paginates the catalog instead of silently truncating at the first 5,000 rows.
- Exported prices are restricted to currently valid price records (`valid_from <= now` and `valid_to IS NULL OR valid_to >= now`) before selecting the newest authorized tier value.
- Safe upper bounds were added for product and price export volume to prevent unbounded browser-side export work.
- Spreadsheet formula-injection escaping remains enabled.
- No business authorization, pricing authority, tenant boundary or order behavior was changed.

## Previous execution evidence
- Product/UI Excellence interaction-state hardening improved keyboard-visible focus treatment, disabled-state affordances, focus-within elevation, quantity-control states, empty-state sizing, mobile cart spacing and reduced-motion behavior.
- Source audit found no `localStorage` usage outside the dedicated offline queue, no `dangerouslySetInnerHTML`, and no `TODO`/`FIXME` markers at the previous boundary.
- Offline queue remains user-scoped, operation-type allowlisted, size/attempt bounded, corruption-tolerant, and retry-backoff controlled; runtime delivery is still NOT PROVEN.
- Batch 7 restricted `current_organization_id()`, `current_customer_id()`, and `current_role()` execution from `anon` to authenticated/service_role.
- Batch 6 hardened order runtime boundaries and expanded adversarial order input tests.
- Batch 5 hardened finance, purchasing/receiving transaction boundaries and cart quantity limits.
- All 34 public RLS-enabled tables have at least one policy; previous invoice-table policy gaps were restored.
- Deployment install contract uses `npm ci --no-audit --no-fund`.

## Remaining closure work — priority order
### P0 — Release blockers
1. Execute the new runner-backed lockfile bootstrap and verify `package-lock.json` is committed and synchronized with `package.json`.
2. Obtain fresh step-level typecheck, lint, unit/domain, database/pgTAP, build, security and release-audit evidence for the final exact HEAD.
3. Execute a clean-source Supabase migration reset/pgTAP run and reconcile the complete repository chain against live history.
4. Tenant A/B fixture linkage is completed; remaining requirement is authenticated browser runtime proof against these fixtures.
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

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from the latest exact `main` HEAD. Code defects are fixed immediately; external runner/deployment gates remain explicitly blocked until executable evidence is obtained.
