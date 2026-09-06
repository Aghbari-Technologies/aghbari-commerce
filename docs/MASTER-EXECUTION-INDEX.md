# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`2ab730f951650eb07631b278727823178cb6054e`**
- Latest execution boundary: order false-success hardening + core SECURITY DEFINER search_path hardening + exact-head verification/test coverage.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Scope lock
**Aghbari Commerce only.** `Report-Advisor` and every other project are permanently out of scope for this execution stream.

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfer/adjustment/thresholds/low-stock/stock count, purchasing/receiving, finance, import/export, outbox worker, PWA/offline primitives and browser/security hardening |
| INTEGRATED | **PASS at implementation level — exact current HEAD `2ab730f951650eb07631b278727823178cb6054e`** |
| VERIFIED | **NOT PROVEN** — fresh exact-head GitHub Actions evidence must be obtained from executable runners |
| RUNTIME PROVEN | **NOT PROVEN** — no connected Supabase target and no authenticated deployment runtime evidence available through current integrations |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current baseline
- Default branch: `main`.
- Repository is private and the connected GitHub integration has admin/maintain/push capability.
- Historical feature branches are not release evidence unless their exact tested SHA is selected as the release boundary.
- No historical CI result is reused as evidence for a later SHA.
- `package-lock.json` is still not present on `main`; a dedicated bootstrap branch `execution/bootstrap-lockfile-20260906` has an executable workflow trigger that generates and commits it automatically on a runner.

## Completed implementation surface
- React/Vite/TypeScript Arabic RTL operational application shell and command center.
- Authentication/session integration through Supabase Auth.
- Catalog/category reads with server-authoritative authorized pricing.
- **Warehouse-specific catalog availability**: catalog resolves stock for the checkout warehouse rather than whichever inventory balance was updated most recently.
- Customer cart and order submission through server-side RPC commands.
- Staff order workflow and server-side status transition enforcement.
- Product/category management, price management, inventory adjustment.
- Product image processing/storage boundary.
- XLSX staged validation and atomic commit path.
- Offline cart queue with authenticated user scoping and bounded retry behavior; retry exhaustion is terminal and duplicate online sync listeners have been removed.
- Customer lifecycle: create, tier change, activation state, server-side RBAC, audit evidence and UI.
- Inventory: atomic warehouse transfer, deterministic balance locking, stock thresholds, low-stock detection and transactional stock-count reconciliation.
- Purchasing/receiving: suppliers, purchase orders, submit/approve, atomic receiving and inventory movement evidence.
- Operational catalog/price CSV export with spreadsheet formula-injection hardening and tenant-scoped staff price visibility.
- Operational finance: invoices, partial/full payments, audited cash-account provisioning, cash ledger entries, expenses, balance calculation and overdraft protection.
- Durable outbox claim/ack/failure database boundary and deployable webhook worker with fail-closed inbound worker authentication, required outbound webhook token and delivery timeout.
- PWA manifest/service worker/offline fallback.
- Security headers including CSP and browser secret-boundary checks.
- Playwright authenticated browser critical-path gate, strengthened to cover real catalog → cart → order → exact-created-order persistence after refresh.
- **Tenant-isolation E2E now creates a real Tenant A order and verifies that a separately authenticated Tenant B session cannot read that exact order through the UI.**

## Forensic repairs and release hardening
- Stock-count composite product tenant FK now has a valid referenced unique key.
- Stock-count idempotency cannot silently bind one key to another warehouse.
- Stock-count definer functions use `search_path=''` and schema-qualified references.
- Stock-count UI renders all active count lines instead of truncating at 50.
- Catalog RPC now requires/validates an active warehouse and returns that warehouse's balance.
- Offline invalid-user filters fail closed; terminal retry state prevents repeated exhausted processing.
- **Offline queue clear fails closed for an invalid supplied user scope instead of clearing the entire queue.**
- Production CSP was added to `vercel.json`.
- Outbox worker requires an outbound webhook secret and times out delivery attempts after 10 seconds.
- Frontend environment example uses `VITE_SUPABASE_PUBLISHABLE_KEY` consistently.
- **Node 22 runtime contract is explicitly pinned in `package.json`.**
- **Typecheck is an explicit package/CI gate.**
- **Release audit scans shipped HTML/PWA/config artifacts and executable source for legacy branding and suspicious completion/mock markers.**
- **Release audit discovers literal frontend Supabase RPC calls and verifies each has a matching PostgreSQL function definition in migration history.**
- **Runtime E2E workflow requires an explicit `exact_sha`, checks out that exact commit, verifies `git rev-parse HEAD`, and names uploaded evidence with the certified SHA.**
- **Runtime E2E requires distinct Tenant B credentials instead of silently reducing isolation proof to a single-user test.**
- **Quality, migration-proof and security-audit workflows support explicit exact-SHA dispatch and verify the checked-out HEAD before executing gates.**
- **Outbox SECURITY DEFINER functions are redefined in migration `0038` with an empty `search_path`, while original migration history remains unchanged.**
- **pgTAP test `013-outbox-definer-search_path.test.sql` checks all four outbox worker functions for the hardened search_path contract.**
- **Application-quality no longer requests npm dependency caching while `package-lock.json` is absent; this removes a known lockfile-dependent CI setup failure path.**
- **Deterministic lockfile bootstrap is executable on a dedicated branch and is designed to commit the generated lockfile automatically when a GitHub runner is available.**
- **Order creation now fails closed when the RPC returns no trustworthy persisted order reference; the UI cannot clear the cart or display a success message from an empty/malformed response.**
- **Focused order response-contract regression tests cover valid, empty, malformed, zero and unsafe order-number responses.**
- **Core SECURITY DEFINER command functions across order, catalog/admin, customer, inventory, purchasing and finance/cash operations now have `search_path=''` via migration `0039`; historical migrations were not rewritten.**
- **pgTAP test `014-core-definer-search_path.test.sql` verifies the hardened configuration for all 20 targeted functions.**

## Evidence boundary
- Current exact SHA `2ab730f951650eb07631b278727823178cb6054e` contains the latest order-response and security hardening plus prior implementation/test work.
- Fresh exact-head CI execution is **NOT PROVEN** until a runner produces step-level evidence; missing surfaced evidence is never converted to PASS.
- Runtime browser E2E is executable and exact-SHA-bound, but **NOT RUNTIME-PROVEN** until executed against a real deployment with real credentials for both tenant contexts.
- The authorized Supabase integration currently returns **zero connected projects**, so live DB/Auth/RLS proof cannot honestly be claimed.
- Production deployment/runtime is therefore **NOT CERTIFIED**.

## Remaining closure work — bounded priority order
### P0 — Core vertical slice
1. Obtain executable runner step evidence for exact current HEAD.
2. Generate and commit deterministic `package-lock.json`; then switch quality/security installation to `npm ci` where appropriate.
3. Connect/provision a dedicated staging Supabase target when the required Supabase organization/access is available.
4. Execute real Auth/session/role/Tenant A-B/RLS negative tests.
5. Execute authenticated browser E2E on the deployed Aghbari target with exact-SHA evidence.

### P1 — Reliability and data safety
6. Run all pgTAP suites on reset/upgrade/repeat paths.
7. Prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant isolation in runtime.
8. Prove outbox claim/delivery/retry/backoff/terminal failure/DLQ and consumer idempotency in runtime.
9. Prove import/export malformed-input, quarantine, atomic-commit, authorization and cross-tenant cases.
10. Confirm remaining in-scope Sales/Inventory operational requirements and close only verified gaps.

### P2 — Production hardening
11. Run Supabase Security Advisor + Performance Advisor, query-plan review and representative load tests once a real Supabase environment exists.
12. Complete observability, audit completeness, backup/recovery and rollback evidence.
13. Production deployment smoke test + deployed artifact/SHA verification.
14. Final regression → exact final HEAD freeze → release candidate → certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green run on an earlier SHA is not exact-HEAD evidence. A documentation PASS is not a runtime PASS. A successful local build is not production runtime proof.

**NEXT EXECUTION LOOP:** continue Aghbari-only code hardening and evidence strengthening on the current exact HEAD, while treating runner/Supabase/deployment access as explicit external gates. Every new fix must be tested and recorded against its exact SHA before closure.