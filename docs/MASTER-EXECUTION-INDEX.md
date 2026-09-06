# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`130117ae64006963fd2e3f1dc1c7c8c4a85c2608`**
- Latest execution boundary: exact-head documentation synchronization + deterministic lockfile bootstrap investigation.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Scope lock
**Aghbari Commerce only.** `Report-Advisor` and every other project are permanently out of scope for this execution stream.

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfer/adjustment/thresholds/low-stock/stock count, purchasing/receiving, finance, import/export, outbox worker, PWA/offline primitives and browser/security hardening |
| INTEGRATED | **PASS at implementation level — exact current HEAD `130117ae64006963fd2e3f1dc1c7c8c4a85c2608`** |
| VERIFIED | **NOT PROVEN** — fresh exact-head GitHub Actions evidence is not available as PASS; recent jobs are failing before step evidence is exposed |
| RUNTIME PROVEN | **NOT PROVEN** — no connected Supabase target and no authenticated deployment runtime evidence available through current integrations |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current baseline
- Default branch: `main`.
- Repository is private and the connected GitHub integration has admin/maintain/push capability.
- Historical feature branches are not release evidence unless their exact tested SHA is selected as the release boundary.
- No historical CI result is reused as evidence for a later SHA.
- `package-lock.json` is still not present on `main`.
- Deterministic lockfile bootstrap is executable on `execution/bootstrap-lockfile-20260906`; its latest triggered run against `a03fca2cb2d649b98fadc818b747e6d5ff44ca33` failed without producing a lockfile. The failure was retried, and the job is currently queued; no lockfile PASS is claimed.
- Recent independent `security-audit` and `application-quality` jobs also failed with empty step evidence and no assigned runner details, indicating an execution-environment/runner gate rather than a proven product failure.

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

## Latest forensic hardening
- Admin command input validation now rejects malformed identifiers, blank required text, invalid money and unsafe/non-zero inventory deltas before backend mutation; currency is normalized to uppercase.
- Admin command response handling fails closed for malformed entity, money and inventory responses, with deterministic regression coverage in `src/services/admin.contract.test.ts`.
- Prior order, catalog/admin, customer, inventory, purchasing and finance SECURITY DEFINER boundaries remain hardened with empty `search_path` via historical corrective migrations.
- Import inventory delta accounting remains canonical and import staging/commit SECURITY DEFINER boundaries remain hardened.
- Exact-SHA CI/runtime workflow protections remain in force; no earlier SHA is reused as current evidence.

## Evidence boundary
- Current exact SHA `130117ae64006963fd2e3f1dc1c7c8c4a85c2608` contains the latest hardening plus the synchronized execution index.
- GitHub combined-status query for the current exact HEAD exposes `statuses: []`; therefore **no CI PASS is claimed**.
- A deterministic lockfile bootstrap run was triggered and failed; a rerun is queued. `package-lock.json` has not been produced.
- Runtime browser E2E is executable and exact-SHA-bound, but **NOT RUNTIME-PROVEN** until executed against a real deployment with real credentials for both tenant contexts.
- The authorized Supabase integration currently returns zero connected projects, so live DB/Auth/RLS proof cannot honestly be claimed.
- Production deployment/runtime is therefore **NOT CERTIFIED**.

## Remaining closure work — bounded priority order
### P0 — Core vertical slice
1. Repair the deterministic lockfile bootstrap failure and generate/commit `package-lock.json` on the release path.
2. Obtain executable runner step evidence for the exact current `main` HEAD.
3. Switch quality/security installation to `npm ci` after the lockfile is committed and synchronized.
4. Connect/provision a dedicated staging Supabase target when the required Supabase organization/access is available.
5. Execute real Auth/session/role/Tenant A-B/RLS negative tests.
6. Execute authenticated browser E2E on the deployed Aghbari target with exact-SHA evidence.

### P1 — Reliability and data safety
7. Run all pgTAP suites on reset/upgrade/repeat paths.
8. Prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant isolation in runtime.
9. Prove outbox claim/delivery/retry/backoff/terminal failure/DLQ and consumer idempotency in runtime.
10. Prove import/export malformed-input, quarantine, atomic-commit, authorization and cross-tenant cases.
11. Confirm remaining in-scope Sales/Inventory operational requirements and close only verified gaps.

### P2 — Production hardening
12. Run Supabase Security Advisor + Performance Advisor, query-plan review and representative load tests once a real Supabase environment exists.
13. Complete observability, audit completeness, backup/recovery and rollback evidence.
14. Production deployment smoke test + deployed artifact/SHA verification.
15. Final regression → exact final HEAD freeze → release candidate → certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green run on an earlier SHA is not exact-HEAD evidence. A documentation PASS is not a runtime PASS. A successful local build is not production runtime proof.

**NEXT EXECUTION LOOP:** continue Aghbari-only code hardening and evidence strengthening from exact HEAD `130117ae64006963fd2e3f1dc1c7c8c4a85c2608`, while treating runner/Supabase/deployment access as explicit external gates. Every new fix must be tested and recorded against its exact SHA before closure.
