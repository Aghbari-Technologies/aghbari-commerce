# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `execution/day2-product-gap-closure`
- Current exact implementation HEAD: **`72a94cb149c5c7221e04cd6b9d6a3b78b35b04df`**.
- Previous implementation HEAD: **`d91c6bfa1a612671a343e76b185839596e1f1114`**.
- Registry-only commits must never be used as code-test SHAs.
- Scope: **Aghbari Commerce only.**

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — core commerce, catalog/pricing, cart/orders, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — DB-backed templates and server-authoritative Excel Quick Order are implemented. An additional atomic template-apply RPC is implemented but not yet wired into the customer App. |
| VERIFIED | **SUBSTANTIAL / NOT FINAL** — exact-head CI on `d91c6bfa...` is PASS; fresh verification of the newer `72a94cb...` head is pending. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser execution has not been run with real credentials in this batch. |
| PRODUCTION CERTIFIED | **NOT PROVEN**. |

## Latest execution boundary — 2026-09-11
- Fresh CI at exact implementation SHA `d91c6bfa...` passed application quality, G1 domain proof, security audit and Order Workflow Proof.
- Clean migration proof was executed against its actual checkout target and exposed a real migration defect: `20260909014946_index_missing_foreign_keys.sql` attempted to index nonexistent `public.import_profiles`, producing SQLSTATE `42P01`. This was **not** converted to PASS.
- Root cause fixed in `60ca73d87bf1278c2a14e36b34f76bba3c830a73`: each optional advisor index is now created only when its target table exists, using `to_regclass` guards and dynamic SQL.
- Test `015-order-templates-adversarial-boundary.test.sql` was made self-contained with explicit organization/customer/profile fixtures, so it no longer relies on another test leaving committed rows.
- Test `016-quick-order-server-boundary.test.sql` was made self-contained with organization/branch/warehouse/customer/profile/product/price/inventory fixtures.
- `supabase-migration-proof.yml` was hardened to test the **PR head SHA**, not the GitHub synthetic merge SHA, and retains explicit exact-head verification.
- `application-quality.yml` was hardened with the same PR-head SHA selection.
- Runtime E2E workflow now validates HTTPS base URL, exact SHA, requires real E2E secrets, and installs Chromium + Firefox + Microsoft Edge for the configured five-browser/device projects.
- An atomic `public.apply_order_template(uuid)` SECURITY DEFINER RPC was added with `search_path=''`, authenticated-only execution, ownership/product/price/inventory validation, all validation before mutation, and atomic cart replacement + audit. It remains **IMPLEMENTED_NOT_VERIFIED_RUNTIME** and is not yet wired from `AppV3Fixed.tsx`.

## Exact evidence currently valid
- `d91c6bfa...` application-quality: exact SHA checkout PASS; Typecheck PASS; Unit/Integration **23 files / 181 tests PASS**; Lint PASS; Production Build PASS; Release Audit PASS.
- `d91c6bfa...` G1 Domain Proof: PASS.
- `d91c6bfa...` security-audit: PASS.
- `d91c6bfa...` Order Workflow Proof: PASS.
- Existing live Supabase evidence for unchanged DB/RPC paths remains valid under the SHA-discipline rule; changed migration/function paths require fresh evidence.
- Order Templates DB/adversarial evidence remains closed unless an impact/regression appears.
- Quick Order DB/idempotency/audit evidence remains closed unless an impact/regression appears.

## Current open gates
### P0
1. Fresh exact-head migration reset + pgTAP 014/015/016 on `72a94cb...`.
2. Customer authenticated browser E2E with real configured credentials.
3. Cross-tenant/cross-customer browser + direct API/RPC bypass evidence.
4. Full order lifecycle runtime: customer order → merchant confirm/process → inventory consistency → customer status.
5. Production deployment exact-SHA verification and runtime evidence.

### P1
6. True multi-session concurrency: Stock 10 / Session A 8 / Session B 8, with DB proof.
7. Double checkout / duplicate submit / retry / duplicate Quick Order / duplicate import idempotency proof.
8. Failure engineering: expired/invalid session, network/DB failure, OOS, changed price, malformed Excel, invalid/expired invitation, refresh/back during checkout.
9. Offline/reconnect/replay/outbox delivery proof if those features are in active scope.
10. Admin/RBAC runtime role matrix and API/RPC privilege escalation proof.
11. Finance runtime: invoice → order relationship → amount → payment state → account/ledger consistency.
12. Browser matrix execution: Chrome, Edge, Firefox, desktop, tablet, mobile.

### P2
13. Load/query-plan review, observability, backup/recovery, rollback evidence, final regression and release freeze.

## Test numbering
Current targeted pgTAP files verified present in repository: **014**, **015**, **016**. No missing 014 condition exists; Registry references match the actual filenames. Existing older suite numbering is retained and not renumbered because that would create unrelated churn.

## No-false-closure
`IMPLEMENTED` ≠ `VERIFIED` ≠ `VERIFIED_DB` ≠ `VERIFIED_RUNTIME` ≠ `PRODUCTION_CERTIFIED`.
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued event is not successful delivery evidence. A green run on another SHA is not current-head evidence. No credentials are fabricated.

## Resume
Load `project_execution_state.json`, this index, current branch SHA, blockers and evidence. Reuse known registries; discover only when the registry lacks the required fact. Do not reopen closed features without impact.
