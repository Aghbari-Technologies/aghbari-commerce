# Aghbari — Implementation Status V1

**Boundary:** current operational implementation through stock-count reconciliation, warehouse-specific catalog truth, release-audit hardening, exact-SHA CI gates, tenant-isolation E2E hardening, and outbox definer hardening; verification and runtime certification remain evidence gates.

## Status

- Architecture: RECONCILED
- Canonical ownership: ACCEPTED
- Physical relation families: IMPLEMENTED IN MIGRATION TREE
- Transactional domain POC invariants: PROVEN at prior exact boundary; fresh current-head execution evidence remains required
- Order workflow POC: PROVEN at prior exact boundary; fresh current-head execution evidence remains required
- Operational frontend/PWA: IMPLEMENTED and integrated
- Operational domain/services: IMPLEMENTED and integrated
- Supabase operational migrations/RLS/RPC layer: IMPLEMENTED in migration tree
- Catalog, cart, orders, import, image pipeline and offline queue: IMPLEMENTED
- Catalog availability: HARDENED — availability is resolved for the selected/active checkout warehouse instead of the most recently updated warehouse balance
- Purchasing + receiving vertical slice: IMPLEMENTED — migrations `0026`/`0027`, typed service, adversarial pgTAP coverage, operational command-center UI
- Customer lifecycle: IMPLEMENTED — create, tier, activation state, RBAC, audit and UI
- Inventory transfer + thresholds/low-stock: IMPLEMENTED — transactional RPCs, audit/outbox and UI
- Stock count/reconciliation: IMPLEMENTED — migration `0035`, typed service, command-center UI and adversarial pgTAP test
- Finance: IMPLEMENTED — invoices, payments, cash accounts, expenses and non-negative cash protection
- Catalog export: AVAILABLE through the existing operational export panel
- Outbox: durable claim/recovery contract implemented; deployable webhook worker now present; production delivery proof remains open; outbound delivery now fails closed without `OUTBOX_WEBHOOK_TOKEN` and uses a 10-second request timeout
- Offline cart: HARDENED — invalid user filters no longer expose the whole local queue; invalid user-scoped clear now fails closed; retry exhaustion is terminal and cannot block later operations; duplicate online-event replay trigger removed
- Real Auth/RLS E2E: BLOCKED pending connected staging Supabase target
- Browser E2E: IMPLEMENTED as an executable Playwright gate; covers authenticated catalog → cart → real order → refresh verification and a separate Tenant A/B isolation path; runtime execution remains pending target + dedicated credentials
- Production deployment: OPEN — runtime target and deployment proof not yet established
- Production certification: NOT CERTIFIED

## Current implementation boundary
**Latest current `main` implementation HEAD:** `977dc51bfbdcd8e16934e868c1c48dc42d29adfe`.

The repository contains a real React/Vite operational application, Supabase migration/RPC implementation, domain services/tests, offline/PWA assets, import pipeline, catalog export, order/cart hardening, purchasing/receiving, customer lifecycle, warehouse-aware catalog availability, inventory reconciliation, operational finance, and release/evidence hardening.

## Self-audit repairs completed in this boundary
1. Stock-count migration composite foreign-key target was corrected by adding the required `(id, organization_id)` unique key to `products`.
2. Stock-count idempotency now rejects reuse of the same key against a different warehouse.
3. Stock-count `SECURITY DEFINER` functions use an empty search path with explicit schema qualification.
4. Stock-count UI no longer truncates the active count to the first 50 lines, so a started count cannot be silently impossible to finish for products after row 50.
5. Catalog availability is now warehouse-specific through migration `0036_catalog_warehouse_truth.sql`, with a regression test proving different warehouse balances are returned for the same product.
6. Offline queue retry exhaustion is explicitly terminal and later operations continue processing.
7. Offline queue invalid user filters return no records instead of falling back to the complete local queue.
8. Offline queue clearing now ignores an invalid explicit user scope instead of deleting every queued operation.
9. Duplicate `online` event synchronization was removed from the cart service so the App remains the single runtime sync owner.
10. Production Vercel response headers now include a restrictive CSP in addition to the existing browser hardening.
11. Frontend `.env.example` was corrected to use `VITE_SUPABASE_PUBLISHABLE_KEY`, matching the actual client code and eliminating a configuration-name drift that could produce a false missing-environment failure.
12. An executable release-audit gate was added to detect missing release files/workflows, missing lockfile, legacy branding and suspicious completion markers in executable source.
13. Release audit now checks literal frontend Supabase RPC calls against PostgreSQL function definitions in migration history.
14. Runtime E2E is exact-SHA-bound and requires distinct Tenant B credentials for isolation proof.
15. Quality, migration-proof and security-audit workflows verify the checked-out exact SHA before executing their gates.
16. Outbox `SECURITY DEFINER` functions are redefined in migration `0038` with an empty `search_path`; original migration history remains unchanged.
17. pgTAP coverage includes `013-outbox-definer-search_path.test.sql` for the four outbox worker functions.
18. Application-quality no longer requests npm dependency caching while `package-lock.json` is absent, removing a known lockfile-dependent CI setup failure path.
19. A deterministic lockfile bootstrap workflow is available on `execution/bootstrap-lockfile-20260906` and is designed to generate/commit `package-lock.json` when a GitHub runner is available.

## Current executable evidence
- Fresh current-head GitHub Actions verification has not produced usable step-level evidence through the current connector; previous attempts terminate with `failure` and expose no executable job steps/logs. This remains an **external CI infrastructure/startup evidence blocker**, not a code PASS and not a code defect without logs.
- Historical G1/domain/PostgreSQL/order evidence remains prior-boundary regression evidence only.
- Current post-repair implementation has **NOT PROVEN** CI until a workflow actually executes its steps successfully.
- Runtime E2E remains **NOT PROVEN** against a real deployment.
- Live Supabase Auth/RLS/DB execution remains unavailable through the current authorized Supabase connection because no Supabase projects are connected; no live PASS is claimed.
- Outbox external delivery remains **NOT PROVEN**.

## Remaining closure work
1. Restore executable GitHub Actions runner/check execution and obtain step-level evidence for the exact current SHA.
2. Generate and commit a deterministic npm lockfile, then switch CI from floating `npm install` to `npm ci` where appropriate.
3. Execute all current pgTAP suites against reset and upgrade paths, including `010`, `011`, `012`, and `013` stock/catalog/outbox security tests.
4. Connect/provision staging Supabase with Tenant A/B identities and execute Auth/RLS role-negative tests.
5. Execute authenticated browser proof against the deployment target: login → catalog → cart → order → refresh → verify, plus Tenant A/B isolation.
6. Complete offline runtime proof: offline mutation, reload, reconnect, replay, terminal retry and tenant isolation.
7. Complete outbox runtime proof: claim, delivery, retry/backoff, terminal failure/DLQ, consumer idempotency and secret rejection.
8. Complete import/export runtime proof: malformed input, quarantine/staging, atomic commit, authorization and export isolation.
9. Confirm and close any remaining Sales/Inventory requirements from the canonical business scope; do not invent non-required modules.
10. Add representative performance/load evidence and inspect database advisor findings once a real Supabase environment exists.
11. Add production observability, audit completeness, backup/recovery and rollback evidence.
12. Execute production deployment smoke tests and verify the deployed artifact matches the frozen SHA.
13. Final audit → final regression → exact final HEAD verification → release candidate → certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction remains:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## Evidence rule
Every future PASS claim must name the exact HEAD, execution environment, test path, and evidence artifact. A commit alone is never a runtime PASS.
