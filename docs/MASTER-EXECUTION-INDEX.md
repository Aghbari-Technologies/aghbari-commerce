# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`0300479e34c5d9bae0b2dc6a28fc5279e397d6e7`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: **`https://alamri.app/` (بوابة العامري الذكية)** is treated only as an external UX/product benchmark; Aghbari identity, naming and implementation remain independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — checkout, invoice RLS, finance runtime validation, transaction-boundary hardening, identity-helper ACL hardening, deterministic Vercel install contract, responsive navigation hardening, and Product/UI Excellence polish are implemented on `main`. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Latest execution boundary
- Product/UI Excellence Pass advanced with a stronger premium commerce presentation layer in `src/product-excellence.css`.
- Improved product-card hierarchy and hover/focus behavior, search focus treatment, category-chip interaction, image presentation, cart controls, checkout emphasis, responsive spacing, touch targets, keyboard focus, reduced-motion behavior and mobile ergonomics.
- Changes remain additive at the presentation layer and do not alter business logic, pricing authority, authorization or tenant boundaries.
- Benchmark rule: use the public `alamri.app` experience to identify opportunities, but do not copy its identity or treat it as the target ceiling. The Aghbari target is materially higher clarity, polish, responsiveness and operational UX.
- Current-head CI still has no usable PASS evidence; therefore no current-head verification is claimed.

## Batch 7 execution evidence
- Full live inventory of public `SECURITY DEFINER` functions was reviewed.
- Identity-context helpers `current_organization_id()`, `current_customer_id()`, and `current_role()` were found unnecessarily executable by `anon`.
- Migration `batch7_security_definer_runtime_hardening` was applied successfully to live Supabase project `mrcyqezbhpncuvaehwgf`.
- `EXECUTE` was revoked from `anon` and retained only for `authenticated` and `service_role` (plus owner `postgres`) for the three helpers.
- Post-migration ACL query confirmed the restricted grants.

## Previous execution evidence
- Batch 6 hardened order runtime boundaries and expanded adversarial order input tests.
- Batch 5 hardened finance, purchasing/receiving transaction boundaries and cart quantity limits.
- All 34 public RLS-enabled tables have at least one policy; previous invoice-table policy gaps were restored.
- Deployment install contract uses `npm ci --no-audit --no-fund`.
- Responsive navigation hardening was previously implemented in `src/styles.css`.

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
