# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `execution/day2-product-gap-closure`
- Current exact implementation HEAD after this execution boundary: **`c6aed5ad07f4f398e6daae89abe878e390d8dbec`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: `https://alamri.app/` only; Aghbari identity remains independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — customer order templates are database-authoritative, and Excel Quick Order confirmation now routes through an atomic server-authoritative cart mutation with idempotency and audit. |
| VERIFIED | **PARTIAL** — direct Supabase runtime evidence is fresh for the changed database/RPC paths; exact-head GitHub CI for `c6aed5ad...` is executing. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser/runtime business-flow proof remains open. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — final release gates remain open. |

## Latest execution boundary — 2026-09-11
- Order Templates database boundary verified directly: RLS enabled, four operation-specific authenticated policies, anonymous table DML privilege removed, own-customer access allowed, cross-tenant and cross-customer reads/deletes denied, foreign-customer insert denied, and `lines` 1/100 accepted while 0/101 are rejected.
- Added adversarial pgTAP coverage for the Order Templates security and payload boundary; the test is registered under `supabase/tests/015-order-templates-adversarial-boundary.test.sql`.
- Added `public.apply_quick_order(text,uuid,jsonb)`: authenticated-only, customer/tenant/warehouse/product/authorized-price/inventory validation, duplicate-line rejection, atomic cart merge, idempotency, and audit event creation.
- Direct Supabase proof exercised the new quick-order RPC: commit succeeded, identical retry returned the same cart, changed payload rejected with `40001`, duplicate rejected with `22023`, insufficient stock rejected with `P0001`, anonymous execution denied with `42501`, audit row and completed idempotency row observed, and cart persistence observed. The transaction was rolled back after evidence capture.
- Wired Excel confirmation in `src/AppV3Fixed.tsx` to the new server-authoritative RPC through `src/services/quickOrder.ts`; browser parsing remains review-only until explicit confirmation.
- Expanded customer template E2E to cover create → reload → logout/login → use → cart observation → delete. Runtime execution is still dependent on configured authenticated E2E credentials and environment.
- Exact-head CI was allowed to continue rather than treating queued/blocked infrastructure as a product failure.

## Exact-head evidence
- Database/RPC evidence for the new quick-order server path was executed against Supabase project `mrcyqezbhpncuvaehwgf` after the migration was applied; the corresponding implementation checkpoint before the registry-only commit was `5cd4eb6...`.
- `public.order_templates` remote migration inventory contains `20260911104556 / harden_order_template_persistence`; `pg_constraint` confirms the array and 1–100 line constraints.
- Previous application-quality attempt on `04d677...`: Typecheck PASS and Unit/Integration PASS; Lint FAILED. Previous migration-proof attempt on `04d677...` failed at local Supabase startup before pgTAP execution. These are retained as failure evidence, not converted to PASS.
- Current exact-head `c6aed5ad...` GitHub Actions are required before code-level VERIFIED status can be upgraded.
- Vercel remains externally blocked/unevaluated in this batch; no Production PASS is inferred.

## Remaining closure work — priority order
### P0 — Release blockers
1. Complete exact-current-head CI evidence for typecheck, lint, unit/domain tests, build and release audit.
2. Execute clean-source migration reset + full pgTAP on the exact certification HEAD, including Order Templates and Quick Order.
3. Execute authenticated browser E2E including tenant isolation, template persistence/use/delete, Excel upload/commit, checkout and created-order persistence.
4. Execute deployed production smoke against the exact deployed SHA, then authenticated runtime E2E with console/network/database evidence.
5. Resolve Auth leaked-password-protection configuration warning.

### P1 — Reliability proof
6. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
7. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
8. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
9. Re-run all pgTAP suites on clean/reset/repeat paths.
10. Complete concurrency evidence with real concurrent sessions where the environment permits it; the order/stock SQL already locks inventory rows and checks the authoritative balance, but concurrency is not certified from a single SQL session.

### P2 — Final hardening
11. Complete query-plan and representative-load review.
12. Complete observability, audit, backup/recovery and rollback evidence.
13. Release candidate → exact-SHA smoke → final regression → freeze → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. An object-storage policy is not a runtime upload proof. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

## Resume
On a new session, load `project_execution_state.json`, this index, the current branch SHA, open blockers and the latest checkpoint. Resume from the last verified state and do not reopen closed work without an impact trigger.
