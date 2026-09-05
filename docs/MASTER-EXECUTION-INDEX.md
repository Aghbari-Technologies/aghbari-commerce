# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`32736612729211b3e83af7208c23f3de532dd78b`**
- Latest execution boundary: warehouse-aware catalog truth + stock-count/offline/outbox/security hardening.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfer/adjustment/thresholds/low-stock/stock count, purchasing/receiving, finance, import/export, outbox worker, PWA/offline primitives and browser/security hardening |
| INTEGRATED | **PASS at implementation level — exact current HEAD `32736612729211b3e83af7208c23f3de532dd78b`** |
| VERIFIED | **NOT PROVEN** — fresh executable CI is blocked by workflow startup/infrastructure failures with no job steps/logs exposed |
| RUNTIME PROVEN | **NOT PROVEN** — no connected Supabase target and no authenticated deployment credentials available through current integrations |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current baseline
- Default branch: `main`.
- Repository is private and the connected GitHub integration has admin/maintain/push capability.
- Active feature branches are historical `feat/finance-operational-slice-20260906` and `feat/inventory-ops-slice-20260906`; they are not ahead of the current `main` boundary and do not contain unmerged implementation that should be blindly merged.
- Active execution/evidence branches include closed earlier verification attempts and open PR #29 (`execution/current-head-quality-20260906-v4`), which is evidence-only.
- PRs #1–#25 are historical execution waves; the material operational waves were merged into `main` (order core, cart hardening, import/media, export, customer lifecycle, inventory, purchasing/receiving, finance, outbox security and runtime gate).
- No current PR is authorized to become certification evidence unless its tested SHA is the exact frozen release SHA.

## Completed implementation surface
- React/Vite/TypeScript Arabic RTL operational application shell and command center.
- Authentication/session integration through Supabase Auth.
- Catalog/category reads with server-authoritative authorized pricing.
- **Warehouse-specific catalog availability**: catalog now resolves stock for the checkout warehouse rather than whichever inventory balance was updated most recently.
- Customer cart and order submission through server-side RPC commands.
- Staff order workflow and server-side status transition enforcement.
- Product/category management, price management, inventory adjustment.
- Product image processing/storage boundary.
- XLSX staged validation and atomic commit path.
- Offline cart queue with authenticated user scoping and bounded retry behavior; retry exhaustion is terminal and duplicate online sync listeners have been removed.
- Customer lifecycle: create, tier change, activation state, server-side RBAC, audit evidence and UI.
- Inventory: atomic warehouse transfer, deterministic balance locking, idempotent replay, stock thresholds, low-stock detection and transactional stock-count reconciliation.
- Purchasing/receiving: suppliers, purchase orders, submit/approve, atomic receiving and inventory movement evidence.
- Operational catalog/price CSV export with spreadsheet formula-injection hardening and tenant-scoped staff price visibility.
- Operational finance: invoices, partial/full payments, audited cash-account provisioning, cash ledger entries, expenses, balance calculation and overdraft protection.
- Durable outbox claim/ack/failure database boundary and deployable webhook worker with fail-closed inbound worker authentication, required outbound webhook token and delivery timeout.
- PWA manifest/service worker/offline fallback.
- Security headers including CSP and browser secret-boundary checks.
- Playwright authenticated browser critical-path gate, strengthened to cover real catalog → cart → order → refresh verification.
- Workspace ignore rules and corrected non-secret environment-variable example using `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Forensic repairs in current boundary
- Stock-count composite product tenant FK now has a valid referenced unique key.
- Stock-count idempotency cannot silently bind one key to another warehouse.
- Stock-count definer functions use `search_path=''` and schema-qualified references.
- Stock-count UI renders all active count lines instead of truncating at 50.
- Catalog RPC now requires/validates an active warehouse and returns that warehouse's balance.
- Offline invalid-user filters fail closed; terminal retry state prevents repeated exhausted processing.
- Production CSP was added to `vercel.json`.
- Outbox worker now requires an outbound webhook secret and times out delivery attempts after 10 seconds.
- Frontend environment example no longer disagrees with the runtime key name.

## Evidence boundary
- Fresh exact-head CI was attempted repeatedly. Current PR #29 produced repeated `quality`, `migration-proof`, and `security` check runs; the surfaced runs terminate within seconds with `failure` and no executable steps/logs available through the connector. This is classified as an **external CI runner/startup evidence blocker** rather than a code PASS/FAIL determination.
- Historical domain/G1/PostgreSQL/order evidence is retained but is **not** reused as proof for later SHAs.
- Runtime browser E2E is implemented but **NOT RUNTIME-PROVEN**.
- No Supabase project is currently connected to the authorized Supabase integration (`list_projects` returned no connected projects), so live DB/Auth/RLS/advisor/runtime proof cannot honestly be claimed.
- Production deployment/runtime is therefore **NOT CERTIFIED**.

## Remaining closure work — execution order
1. Restore executable GitHub Actions runner/check execution and capture step-level evidence on the exact current SHA.
2. Generate and commit a deterministic `package-lock.json`; move CI to `npm ci` once the lockfile exists.
3. Run all pgTAP suites, including `010-stock-count-reconciliation.test.sql` and `011-catalog-warehouse-truth.test.sql`, on reset and upgrade paths.
4. Provision/connect a staging Supabase target and execute Tenant A/B Auth + RLS + role-negative tests.
5. Execute authenticated browser E2E on the actual deployment target.
6. Prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant isolation in runtime.
7. Prove outbox claim/delivery/retry/backoff/terminal failure/DLQ/consumer-idempotency and secret rejection in runtime.
8. Prove import/export with malformed files, validation/quarantine, atomic commit, authorization and cross-tenant isolation.
9. Confirm any remaining Sales/Inventory operational requirements from the approved product scope and close only those actually required.
10. Run Supabase Security Advisor + Performance Advisor, query-plan review and representative load tests once a real Supabase environment exists. Supabase explicitly recommends these checks for production readiness. citeturn5search2turn5search6
11. Complete observability, audit completeness, backup/recovery and rollback evidence.
12. Production deployment smoke test + deployed artifact/SHA verification.
13. Final regression → exact final HEAD freeze → release candidate → certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green run on an earlier SHA is not exact-HEAD evidence. A documentation PASS is not a runtime PASS. A successful local build is not production runtime proof.

**NEXT EXECUTION LOOP:** execute the remaining code-independent release fronts, obtain a functioning CI runner, then provision the real Supabase/deployment environment and convert every remaining gate to evidence-bound PASS.
