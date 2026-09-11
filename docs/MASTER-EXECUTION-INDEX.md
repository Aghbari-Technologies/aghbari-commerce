# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `execution/day2-product-gap-closure`
- Current exact implementation HEAD after this execution boundary: **`6038f747eb96475e278ccbf6b35a99873c6e8e23`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: `https://alamri.app/` only; Aghbari identity remains independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current execution adds database-authoritative customer order templates and a real Excel Quick Order review/commit path without replacing the existing backend commands. |
| VERIFIED | **PARTIAL** — prior exact-SHA domain/security evidence remains valid only for unchanged relevant code; this batch requires fresh exact-head CI and migration/pgTAP evidence. |
| RUNTIME PROVEN | **PARTIAL** — production/runtime proof remains open until authenticated browser evidence is available. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — final release gates remain open. |

## Latest execution boundary — 2026-09-11
- Closed the customer Order Templates persistence gap: templates now use the existing `public.order_templates` table and existing customer-owned RLS instead of browser-only `localStorage` business state.
- Added create/read/delete service operations with input/response validation and authenticated customer binding.
- Added database hardening for `order_templates.lines`: array-only payloads, 1–100 line bounds, and authenticated CRUD grant with anonymous access revoked.
- Added deterministic unit coverage for template input boundaries.
- Closed the customer Excel Quick Order stub: upload → parse → structure checks → duplicate detection → product/SKU matching → quantity/inventory checks → review → explicit confirmation → persistent cart writes.
- The quick-order path reuses the canonical catalog RPC/service and the existing server-authoritative cart command; no mock repository was introduced.
- `project_execution_state.json` is now the execution registry for this branch and records the queue, resources, blockers, decisions and evidence rules.

## Remaining closure work — priority order
### P0 — Release blockers
1. Obtain complete fresh exact-head GitHub Actions evidence for typecheck, lint, unit/domain tests, build and release audit on the final certification HEAD.
2. Execute clean-source migration reset + full pgTAP on the exact certification HEAD, including the new order-template database contract.
3. Execute authenticated browser E2E including tenant isolation and exact-created-order persistence.
4. Execute deployed production smoke against the exact deployed SHA, then perform authenticated browser/runtime business-flow proof.
5. Resolve Auth leaked-password-protection configuration warning.

### P1 — Reliability proof
6. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
7. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
8. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
9. Re-run all pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
10. Complete query-plan and representative-load review.
11. Complete observability, audit, backup/recovery and rollback evidence.
12. Release candidate → exact-SHA smoke → final regression → freeze → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. An object-storage policy is not a runtime upload proof. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

## Resume
On a new session, load `project_execution_state.json`, this index, the current branch SHA, open blockers and the latest checkpoint. Resume from the last verified state and do not reopen closed work without an impact trigger.
