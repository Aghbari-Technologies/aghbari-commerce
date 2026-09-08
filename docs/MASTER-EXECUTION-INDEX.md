# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`ed45010cf8d0fb388f949322f3099632a24602ae`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: **`https://alamri.app/` (بوابة العامري الذكية)** is treated only as an external UX/product benchmark; Aghbari identity, naming and implementation remain independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — checkout, invoice RLS, finance runtime validation, transaction-boundary hardening, identity-helper ACL hardening, deterministic Vercel install contract, responsive navigation hardening, Product/UI Excellence interaction-state hardening, and export completeness/current-price handling are implemented on `main`. |
| VERIFIED | **NOT PROVEN** — exact-head CI currently has no workflow run evidence. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Latest execution boundary
- Export reliability hardening completed in `src/ExportPanel.tsx`.
- Product export now paginates the catalog instead of silently truncating at the first 5,000 rows.
- Exported prices are restricted to currently valid price records (`valid_from <= now` and `valid_to IS NULL OR valid_to >= now`) before selecting the newest authorized tier value.
- Safe upper bounds were added for product and price export volume to prevent unbounded browser-side export work.
- Spreadsheet formula-injection escaping remains enabled.
- No business authorization, pricing authority, tenant boundary or order behavior was changed.
- Exact-head CI remains **NOT PROVEN** because no usable current-head workflow evidence is available.

## Previous execution evidence
- Product/UI Excellence interaction-state hardening improved keyboard-visible focus treatment, disabled-state affordances, focus-within elevation, quantity-control states, empty-state sizing, mobile cart spacing and reduced-motion behavior.
- Source audit found no `localStorage` usage outside the dedicated offline queue, no `dangerouslySetInnerHTML`, and no `TODO`/`FIXME` markers at the previous boundary.
- Offline queue remains user-scoped, operation-type allowlisted, size/attempt bounded, corruption-tolerant, and retry-backoff controlled; runtime delivery is still NOT PROVEN.
- Batch 7 restricted `current_organization_id()`, `current_customer_id()`, and `current_role()` execution from `anon` to authenticated/service_role.
- Batch 6 hardened order runtime boundaries and expanded adversarial order input tests.
- Batch 5 hardened finance, purchasing/receiving transaction boundaries and cart quantity limits.
- All 34 public RLS-enabled tables have at least one policy; previous invoice-table policy gaps were restored.
- Deployment install contract uses `npm ci --no-audit --no-fund`.

## Remaining closure work — priority order
### P0 — Release blockers
1. Produce and commit deterministic `package-lock.json` on a real GitHub runner. Current runner attempts fail before workflow steps; external execution-layer blocker.
2. Obtain fresh step-level typecheck, lint, unit/domain, database/pgTAP, build, security and release-audit evidence for the final exact HEAD.
3. Execute a clean-source Supabase migration reset/pgTAP run and reconcile the complete repository chain against live history.
4. Provision two dedicated non-production authenticated E2E identities (Tenant A/B) through secure runtime secrets; never fabricate or commit credentials.
5. Execute authenticated browser E2E, including tenant isolation and exact-created-order persistence.
6. Connect/deploy the actual Aghbari Vercel project and execute runtime smoke against the exact deployed SHA. No unrelated Vercel project will be mutated.

### P1 — Reliability proof
7. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
8. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
9. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
10. Re-run full pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
11. Complete query-plan and representative-load review with production-like data.
12. Complete observability, audit, backup/recovery and rollback evidence.
13. Deploy release candidate → exact-SHA smoke → final regression → freeze exact HEAD → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from the latest exact `main` HEAD. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
