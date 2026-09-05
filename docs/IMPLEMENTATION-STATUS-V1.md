# Aghbari — Implementation Status V1

**Boundary:** current operational implementation through stock-count reconciliation and warehouse-specific catalog truth; verification and runtime certification remain evidence gates.

## Status

- Architecture: RECONCILED
- Canonical ownership: ACCEPTED
- Physical relation families: IMPLEMENTED IN MIGRATION TREE
- Transactional domain POC invariants: PROVEN at prior exact boundary
- Order workflow POC: PROVEN at prior exact boundary
- Operational frontend/PWA: IMPLEMENTED and integrated
- Operational domain/services: IMPLEMENTED and integrated
- Supabase operational migrations/RLS/RPC layer: IMPLEMENTED in migration tree
- Catalog, cart, orders, import, image pipeline and offline queue: IMPLEMENTED
- Catalog availability: HARDENED — availability is now resolved for the selected/active checkout warehouse instead of the most recently updated warehouse balance
- Purchasing + receiving vertical slice: IMPLEMENTED — migrations `0026`/`0027`, typed service, adversarial pgTAP coverage, operational command-center UI
- Customer lifecycle: IMPLEMENTED — create, tier, activation state, RBAC, audit and UI
- Inventory transfer + thresholds/low-stock: IMPLEMENTED — transactional RPCs, audit/outbox and UI
- Stock count/reconciliation: IMPLEMENTED — migration `0035`, typed service, command-center UI and adversarial pgTAP test
- Finance: IMPLEMENTED — invoices, payments, cash accounts, expenses and non-negative cash protection
- Catalog export: AVAILABLE through the existing operational export panel
- Outbox: durable claim/recovery contract implemented; deployable webhook worker now present; production delivery proof remains open; outbound delivery now fails closed without `OUTBOX_WEBHOOK_TOKEN` and uses a 10-second request timeout
- Offline cart: HARDENED — invalid user filters no longer expose the whole local queue; retry exhaustion is terminal and cannot block later operations; duplicate online-event replay trigger removed
- Real Auth/RLS E2E: BLOCKED pending connected staging Supabase target
- Browser E2E: IMPLEMENTED as an executable Playwright gate; now covers authenticated catalog → cart → real order → refresh verification; runtime execution remains pending target + dedicated credentials
- Production deployment: OPEN — runtime target and deployment proof not yet established
- Production certification: NOT CERTIFIED

## Current implementation boundary
**Latest current `main` implementation HEAD:** `2e7d63c7368837439c59bb1e5842a82d4f82ccdc`.

The repository contains a real React/Vite operational application, Supabase migration/RPC implementation, domain services/tests, offline/PWA assets, import pipeline, catalog export, order/cart hardening, purchasing/receiving, customer lifecycle, warehouse-aware catalog availability, inventory reconciliation and operational finance.

## Self-audit repairs completed in this boundary
1. Stock-count migration composite foreign-key target was corrected by adding the required `(id, organization_id)` unique key to `products`; PostgreSQL requires referenced composite columns to be covered by a unique/primary key constraint. citeturn6search3turn6search11
2. Stock-count idempotency now rejects reuse of the same key against a different warehouse.
3. Stock-count `SECURITY DEFINER` functions use an empty search path with explicit schema qualification, following the current Supabase security guidance. citeturn3search0turn3search1
4. Stock-count UI no longer truncates the active count to the first 50 lines, so a started count cannot be silently impossible to finish for products after row 50.
5. Catalog availability is now warehouse-specific through migration `0036_catalog_warehouse_truth.sql`, with a regression test proving different warehouse balances are returned for the same product.
6. Offline queue retry exhaustion is explicitly terminal and later operations continue processing.
7. Offline queue invalid user filters return no records instead of falling back to the complete local queue.
8. Duplicate `online` event synchronization was removed from the cart service so the App remains the single runtime sync owner.
9. Production Vercel response headers now include a restrictive CSP in addition to the existing browser hardening.
10. Frontend `.env.example` was corrected to use `VITE_SUPABASE_PUBLISHABLE_KEY`, matching the actual client code and eliminating a configuration-name drift that could produce a false missing-environment failure.

## Current executable evidence
- Fresh current-head GitHub Actions verification was attempted through exact-head PR #29. All surfaced checks (`quality`, `migration-proof`, and `security`, with repeated attempts) terminate within seconds with `failure` and no executable job steps/logs exposed by the connector. This is classified as a **CI infrastructure/startup evidence blocker**, not a code PASS and not a code defect without logs.
- Historical G1/domain/PostgreSQL/order evidence remains prior-boundary regression evidence only.
- Current post-repair implementation has **NOT PROVEN** CI until a workflow actually executes its steps successfully.
- Runtime E2E remains **NOT PROVEN** against a real deployment.
- Live Supabase Auth/RLS/DB execution remains unavailable through the current authorized Supabase connection because no Supabase projects are connected; no live PASS is claimed.
- Outbox external delivery remains **NOT PROVEN**.

## Remaining closure work
1. Restore executable GitHub Actions runner/check execution and obtain step-level evidence for the exact current SHA.
2. Generate and commit a deterministic npm lockfile, then switch CI from floating `npm install` to `npm ci` where appropriate.
3. Execute all current pgTAP suites against reset and upgrade paths, including the new catalog/stock-count tests.
4. Connect/provision staging Supabase with Tenant A/B identities and execute Auth/RLS role-negative tests.
5. Execute authenticated browser proof against the deployment target: login → catalog → cart → order → refresh → verify.
6. Complete offline runtime proof: offline mutation, reload, reconnect, replay, terminal retry and tenant isolation.
7. Complete outbox runtime proof: claim, delivery, retry/backoff, terminal failure/DLQ, consumer idempotency and secret rejection.
8. Complete import/export runtime proof: malformed input, quarantine/staging, atomic commit, authorization and export isolation.
9. Confirm and close any remaining Sales/Inventory requirements from the canonical business scope; do not invent non-required modules.
10. Add representative performance/load evidence and inspect database advisor findings once a real Supabase environment exists. Supabase recommends Security Advisor and Performance Advisor as production-readiness checks. citeturn5search2turn5search6
11. Add production observability, audit completeness, backup/recovery and rollback evidence.
12. Execute production deployment smoke tests and verify the deployed artifact matches the frozen SHA.
13. Final audit → final regression → exact final HEAD verification → release candidate → certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction remains:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## Evidence rule
Every future PASS claim must name the exact HEAD, execution environment, test path, and evidence artifact. A commit alone is never a runtime PASS. Supabase's migration guidance likewise treats migration execution/testing as a separate deployment concern. citeturn2search1
