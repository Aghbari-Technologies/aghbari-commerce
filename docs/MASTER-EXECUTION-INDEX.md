# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`688990adc10d58f43cfe76793d5611cb8d4263f8`**
- Latest execution boundary: release hardening — deterministic lockfile bootstrap path and exact deployed-artifact SHA verification.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Scope lock
**Aghbari Commerce only.** `Report-Advisor` and every other project are permanently out of scope for this execution stream.

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfer/adjustment/thresholds/low-stock/stock count, purchasing/receiving, finance, import/export, outbox worker, PWA/offline primitives and browser/security hardening |
| INTEGRATED | **PASS at implementation level — exact current HEAD `688990adc10d58f43cfe76793d5611cb8d4263f8`** |
| VERIFIED | **NOT PROVEN** — fresh exact-head GitHub Actions evidence is not yet available as PASS |
| RUNTIME PROVEN | **NOT PROVEN** — no connected Supabase target and no authenticated deployment runtime evidence available through current integrations |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current baseline
- Default branch: `main`.
- Repository is private and the connected GitHub integration has admin/maintain/push capability.
- Historical feature branches are not release evidence unless their exact tested SHA is selected as the release boundary.
- No historical CI result is reused as evidence for a later SHA.
- `package-lock.json` is still not present at this exact boundary; a deterministic bootstrap workflow is now installed on `main` so a real GitHub runner can generate, validate and commit it without fabricating dependency data.
- The new production smoke workflow is available for post-deployment exact-SHA verification.

## Completed implementation surface
- React/Vite/TypeScript Arabic RTL operational application shell and command center.
- Authentication/session integration through Supabase Auth.
- Catalog/category reads with server-authoritative authorized pricing.
- Warehouse-specific catalog availability for the checkout warehouse.
- Customer cart and order submission through server-side RPC commands.
- Staff order workflow and server-side status transition enforcement.
- Product/category management, price management, inventory adjustment.
- Product image processing/storage boundary.
- XLSX staged validation and atomic commit path.
- Offline cart queue with authenticated user scoping and bounded retry behavior; retry exhaustion is terminal and duplicate online sync listeners have been removed.
- Customer lifecycle with server-side RBAC, audit evidence and UI.
- Inventory: atomic warehouse transfer, deterministic balance locking, stock thresholds, low-stock detection and transactional stock-count reconciliation.
- Purchasing/receiving: suppliers, purchase orders, submit/approve, atomic receiving and inventory movement evidence.
- Operational catalog/price CSV export with spreadsheet formula-injection hardening and tenant-scoped staff price visibility.
- Operational finance: invoices, partial/full payments, audited cash-account provisioning, cash ledger entries, expenses, balance calculation and overdraft protection.
- Durable outbox claim/ack/failure database boundary and deployable webhook worker with fail-closed inbound worker authentication, required outbound webhook token and delivery timeout.
- PWA manifest/service worker/offline fallback.
- Security headers including CSP and browser secret-boundary checks.
- Playwright authenticated browser critical-path gate covering catalog → cart → order → exact-created-order persistence after refresh.
- Tenant-isolation E2E coverage for a real Tenant A order versus separately authenticated Tenant B UI access.

## Latest release hardening
- Admin command input validation rejects malformed identifiers, blank required text, invalid money and unsafe/non-zero inventory deltas before backend mutation; currency is normalized to uppercase.
- Admin command response handling fails closed for malformed entity, money and inventory responses, with deterministic regression coverage.
- Customer order summaries fail closed on malformed UUIDs, order numbers, statuses, totals, currencies and timestamps, with deterministic regression coverage.
- Staff order summaries and transition responses fail closed on malformed identifiers, status, money, customer metadata and timestamps; transition inputs are validated before RPC invocation, with deterministic regression coverage.
- Prior order, catalog/admin, customer, inventory, purchasing and finance SECURITY DEFINER boundaries remain hardened with empty `search_path` via corrective migrations.
- Import inventory delta accounting remains canonical and import staging/commit SECURITY DEFINER boundaries remain hardened.
- Exact-SHA CI/runtime workflow protections remain in force.
- Production builds now emit `build-meta.json` containing the product identity, application version and source/build SHA from Vercel/GitHub environment metadata.
- A production smoke gate now verifies HTTPS input, deployed `build-meta.json` exact SHA, required security headers and a valid HTML application response.

## Evidence boundary
- Current exact SHA: `688990adc10d58f43cfe76793d5611cb8d4263f8`.
- Fresh exact-head GitHub Actions PASS is **NOT PROVEN** until runner jobs expose successful step-level evidence.
- `package-lock.json` remains open until the new main bootstrap workflow completes successfully and commits the generated lockfile.
- Runtime browser E2E is executable and exact-SHA-bound, but **NOT RUNTIME-PROVEN** until executed against a real deployment with real credentials for both tenant contexts.
- The authorized Supabase integration currently has no connected project available for live DB/Auth/RLS proof, so no live PASS is claimed.
- Production deployment/runtime remains **NOT CERTIFIED**.

## Remaining closure work — bounded priority order
### P0 — Core vertical slice
1. Complete the main-branch deterministic lockfile bootstrap on a real GitHub runner and commit `package-lock.json`.
2. Obtain successful step-level CI evidence for the exact current `main` HEAD.
3. After the lockfile is present and synchronized, switch release CI installation from `npm install` to `npm ci` and rerun all quality/security gates.
4. Connect/provision a dedicated staging Supabase target with Tenant A/B identities.
5. Execute real Auth/session/role/RLS negative tests and cross-tenant isolation.
6. Execute authenticated browser E2E against the deployed Aghbari target with exact-SHA evidence.

### P1 — Reliability and data safety
7. Run all pgTAP suites on reset/upgrade/repeat paths, including stock, catalog warehouse truth and outbox security coverage.
8. Prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant isolation in runtime.
9. Prove outbox claim/delivery/retry/backoff/terminal failure/DLQ and consumer idempotency in runtime.
10. Prove import/export malformed-input, quarantine, atomic-commit, authorization and cross-tenant cases.
11. Confirm remaining in-scope Sales/Inventory operational requirements and close only verified gaps; do not invent non-required modules.

### P2 — Production hardening
12. Run Supabase Security Advisor + Performance Advisor, query-plan review and representative load tests once a real Supabase environment exists.
13. Complete observability, audit completeness, backup/recovery and rollback evidence.
14. Deploy the release candidate and run the new production smoke gate, including exact deployed SHA verification.
15. Final regression → exact final HEAD freeze → release candidate → certification.

## Protocol binding — command `1`
- `1` is an immediate execution command, not a planning request.
- Each `1` resumes from the latest exact trusted boundary and continues until safe executable work is exhausted.
- Mandatory loop: LOAD STATE → OPEN WORK → PRIORITIZE P0/P1/P2 → RESCAN → FIND → ROOT CAUSE → FIX → TEST → REGRESSION → CONSUMER/SECURITY/RUNTIME PROOF → EVIDENCE → EXACT-HEAD CHECK → DOCUMENT → RESCAN → NEXT.
- PASS/READY/SUCCESS/BLOCKED/CERTIFIED are evidence-bound states, never assumptions.
- Code defects are fixed immediately; external environment gates are documented while independent executable work continues.
- Git history, immutable migrations, certification evidence and completed work are protected from unsafe mutation.
- Scope is permanently locked to `Aghbari-Technologies/aghbari-commerce`.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green run on an earlier SHA is not exact-HEAD evidence. A documentation PASS is not a runtime PASS. A successful local build is not production runtime proof.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `main` HEAD `688990adc10d58f43cfe76793d5611cb8d4263f8`, using the lockfile/CI path and production artifact proof already installed, while treating Supabase/Auth/deployment access as explicit external gates. Every new fix must be tested and recorded against its exact SHA before closure.
