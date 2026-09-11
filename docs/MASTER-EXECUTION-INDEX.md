# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `execution/day2-product-gap-closure`
- Current exact implementation HEAD after this execution boundary: **`591c105e31c6cc9421a7a516ac2cedeb64159c48`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: `https://alamri.app/` only; Aghbari identity remains independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — customer order templates are database-authoritative, and Excel Quick Order confirmation now routes through an atomic server-authoritative cart mutation with idempotency and audit. |
| VERIFIED | **PARTIAL** — direct Supabase runtime evidence is fresh for the changed database/RPC paths; exact-head GitHub CI for the final checkpoint is required. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser/runtime business-flow proof remains open. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — final release gates remain open. |

## Latest execution boundary — 2026-09-11
- Order Templates database boundary was executed and verified directly against the live Supabase project: RLS enabled; four operation-specific authenticated policies; anonymous DML privilege removed; own-customer read/create works; cross-tenant and cross-customer reads/deletes are denied; foreign-customer insert is denied; line-count boundaries 1 and 100 are accepted while 0 and 101 are rejected.
- Test-the-Test was executed: a deliberately permissive SELECT policy was added only inside a transaction and rolled back; the cross-tenant query then returned 1 row instead of the expected 0, proving the security test would detect a broken isolation policy.
- Added `supabase/tests/015-order-templates-adversarial-boundary.test.sql` to preserve the adversarial boundary as executable pgTAP evidence.
- Added `public.apply_quick_order(text,uuid,jsonb)` as the server-authoritative Excel/Quick Order mutation. It validates authenticated customer context, tenant, warehouse, active product, authorized price, quantity, duplicate lines and inventory; performs atomic cart merge; records idempotency; and writes an audit event.
- Direct Supabase proof of `apply_quick_order` succeeded: commit, identical retry, audit row, completed idempotency record and cart persistence; changed idempotency payload, duplicate product, insufficient stock and anonymous execution were rejected with the expected server errors. The proof transaction was rolled back after capture.
- Added `supabase/tests/016-quick-order-server-boundary.test.sql` for authenticated/anonymous execute grants, successful commit, idempotent retry, payload conflict, duplicate line, insufficient stock and foreign-warehouse denial.
- Wired `src/AppV3Fixed.tsx` to the new RPC through `src/services/quickOrder.ts`; Excel upload remains a review step, and final cart mutation is now server-authoritative rather than a browser loop of cart writes.
- Expanded customer template E2E to cover create → reload → logout/login → use → cart observation → delete. Runtime execution remains gated on real configured E2E credentials/environment.
- CI continues to be used as evidence generation; no old PASS is transferred to the changed SHA.

## Exact-head evidence
- `public.apply_quick_order(text,uuid,jsonb)` is confirmed as SECURITY DEFINER with `search_path=''`; `anon` EXECUTE=false and `authenticated` EXECUTE=true.
- Remote Supabase migration inventory contains `20260911104556 / harden_order_template_persistence` and `20260911105816 / atomic_quick_order_cart_merge`.
- `order_templates` constraints verified from `pg_constraint`: JSONB must be an array and array length must be 1–100.
- `create_order` DB proof remains valid for its exact tested implementation: server stored `unit_price=1000.00` and `total=8000.00` for quantity 8 despite client-supplied price/total fields; stock moved from 99 to 91 inside the proof transaction; identical idempotent replay returned the same order; changed payload rejected `40001`; invalid product, duplicate, zero, negative and insufficient-stock cases rejected.
- Previous application-quality `04d677...` failure was lint-only after Typecheck and Unit/Integration passed. Previous migration-proof failure occurred at local Supabase startup before pgTAP execution. Current final checkpoint must generate fresh exact-head CI evidence.
- Production is not certified: deployed SHA was not reverified in this batch, and authenticated browser runtime credentials/environment are not fabricated.

## Remaining closure work — priority order
### P0 — Release blockers
1. Fresh exact-head CI: typecheck, lint, unit/integration, build and release audit.
2. Clean-source migration reset + full pgTAP on the exact certification HEAD, including tests 014/015/016.
3. Authenticated browser E2E: login, catalog/search/product, cart, templates persistence/use/delete, Excel upload/parse/review/confirm/reload, checkout, real order and merchant-side lifecycle.
4. Authenticated cross-tenant browser proof and adversarial UI-bypass/API/RPC proof.
5. Deploy exact certified SHA, then production smoke + console + network + DB/runtime evidence.
6. Resolve leaked-password-protection Auth configuration before final certification.

### P1 — Reliability proof
7. True multi-session concurrency proof for stock/order operations; current `create_order` and quick-order paths lock authoritative inventory rows, but a single SQL session is not concurrency certification.
8. Offline refresh/cache/reconnect/replay/conflict/recovery runtime proof.
9. Outbox claim/delivery/retry/backoff/terminal-failure and consumer idempotency runtime proof.
10. Import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant runtime proof.
11. Full pgTAP repeat/reset/replay suite.

### P2 — Final hardening
12. Query-plan and representative-load review.
13. Observability, audit, backup/recovery and rollback evidence.
14. Final gap scan → exact-SHA regression → release freeze → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. An object-storage policy is not a runtime upload proof. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

## Resume
On a new session, load `project_execution_state.json`, this index, the current branch SHA, open blockers and the latest checkpoint. Resume from the last verified state and do not reopen closed work without an impact trigger.
