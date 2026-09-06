# Aghbari — Master Execution Index

**Canonical status ledger.** Updated after every meaningful execution boundary.

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`0048b1485b16904f5b1e36698282381271adf7b7`**
- Latest execution boundary: release-hardening audit, explicit typecheck/Node runtime contract, shipped-artifact branding checks, and strengthened browser persistence evidence.

## Standing execution command
**`1` = CONTINUE / EXECUTE AUTONOMOUSLY / DEEPEN / TEST / VERIFY / DOCUMENT / SELF-IMPROVE.**

## Certification stages
| Stage | State |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — executable commerce shell + catalog/pricing/orders/cart, staff operations, customers, inventory transfer/adjustment/thresholds/low-stock/stock count, purchasing/receiving, finance, import/export, outbox worker, PWA/offline primitives and browser/security hardening |
| INTEGRATED | **PASS at implementation level — exact current HEAD `0048b1485b16904f5b1e36698282381271adf7b7`** |
| VERIFIED | **NOT PROVEN** — no executable workflow run or step-level CI evidence has been surfaced for the latest SHA |
| RUNTIME PROVEN | **NOT PROVEN** — no connected Supabase target and no authenticated deployment runtime evidence available through current integrations |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Current baseline
- Default branch: `main`.
- Repository is private and the connected GitHub integration has admin/maintain/push capability.
- PR #33 (`execution/release-hardening-audit-20260906`) was merged into `main` at squash commit `bb2cc53b7a81d8bdad952f6881d731c8ba6aa6ff`.
- Subsequent direct release-hardening commits advanced `main` to `e97f0c7bad9ca1f86076510079e6e5edae31fe48`.
- PR #34 (`execution/e2e-persistence-hardening-20260906`) was merged into `main` at squash commit `0048b1485b16904f5b1e36698282381271adf7b7`.
- Historical feature branches are not treated as release evidence unless their exact tested SHA is selected as the release boundary.
- No historical CI result is reused as evidence for a later SHA.

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
- Playwright authenticated browser critical-path gate, strengthened to cover real catalog → cart → order → exact-created-order persistence after refresh.
- Workspace ignore rules and corrected non-secret environment-variable example using `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Forensic repairs in current boundary
- Stock-count composite product tenant FK now has a valid referenced unique key.
- Stock-count idempotency cannot silently bind one key to another warehouse.
- Stock-count definer functions use `search_path=''` and schema-qualified references.
- Stock-count UI renders all active count lines instead of truncating at 50.
- Catalog RPC now requires/validates an active warehouse and returns that warehouse's balance.
- Offline invalid-user filters fail closed; terminal retry state prevents repeated exhausted processing.
- **Offline queue clear now fails closed for an invalid supplied user scope instead of clearing the entire queue.**
- Production CSP was added to `vercel.json`.
- Outbox worker now requires an outbound webhook secret and times out delivery attempts after 10 seconds.
- Frontend environment example no longer disagrees with the runtime key name.
- **Executable release-audit gate is part of the application quality gate and scans shipped HTML/PWA/config artifacts as well as executable source.**
- **Node 22 runtime contract is explicitly pinned in `package.json`.**
- **Typecheck is exposed as an explicit package/CI gate rather than being implicit only inside the production build.**
- **E2E persistence assertion was hardened so the post-checkout verification extracts the exact created order number and requires that same order to be present after a full browser refresh; a pre-existing order can no longer falsely satisfy the critical-path proof.**

## Evidence boundary
- Latest SHA `0048b1485b16904f5b1e36698282381271adf7b7` currently has no surfaced GitHub workflow runs/statuses through the authorized connector; therefore CI is **NOT PROVEN**, not PASS.
- Historical domain/G1/PostgreSQL/order evidence is retained but is **not** reused as proof for later SHAs.
- Runtime browser E2E is implemented and strengthened, but **NOT RUNTIME-PROVEN** until executed against a real deployment with real credentials.
- No Supabase project is currently connected to the authorized Supabase integration (`list_projects` returned no connected projects), so live DB/Auth/RLS/advisor/runtime proof cannot honestly be claimed.
- Production deployment/runtime is therefore **NOT CERTIFIED**.

## Remaining closure work — execution order
1. Restore executable GitHub Actions runner/check execution and capture step-level evidence on the exact current SHA.
2. Generate and commit a deterministic `package-lock.json`; then switch CI from floating `npm install` to `npm ci` where appropriate.
3. Run all pgTAP suites, including `010-stock-count-reconciliation.test.sql`, `011-catalog-warehouse-truth.test.sql`, and `012-stock-count-concurrency.test.sql`, on reset and upgrade paths.
4. Provision/connect a staging Supabase target and execute Tenant A/B Auth + RLS + role-negative tests.
5. Execute authenticated browser E2E on the actual deployment target.
6. Prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant isolation in runtime.
7. Prove outbox claim/delivery/retry/backoff/terminal failure/DLQ/consumer-idempotency and secret rejection in runtime.
8. Prove import/export with malformed files, validation/quarantine, atomic commit, authorization and cross-tenant isolation.
9. Confirm any remaining Sales/Inventory operational requirements from the approved product scope and close only those actually required.
10. Run Supabase Security Advisor + Performance Advisor, query-plan review and representative load tests once a real Supabase environment exists.
11. Complete observability, audit completeness, backup/recovery and rollback evidence.
12. Production deployment smoke test + deployed artifact/SHA verification.
13. Final regression → exact final HEAD freeze → release candidate → certification.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction is:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful external delivery evidence. A green run on an earlier SHA is not exact-HEAD evidence. A documentation PASS is not a runtime PASS. A successful local build is not production runtime proof.

**NEXT EXECUTION LOOP:** continue code-level hardening and evidence strengthening on the current baseline while treating CI/Supabase/deployment access as explicit external gates; every new fix must be tested and recorded against its exact SHA before closure.
