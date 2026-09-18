# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Starting SHA ordered by this Owner-Level sprint: `0f28a8df8ce6efa8f4ee9569c36aa0d696d0386c`.
- Current exact implementation HEAD recorded by this main-branch index: `767579168cfd3e687c1274bfa8eace879a288ebd`.
- Single certification candidate recorded by this historical main-branch index: `767579168cfd3e687c1274bfa8eace879a288ebd`.
- No evidence from an earlier SHA transfers to that candidate.
- Scope: **Aghbari Commerce only**.
- **Current canonical release state is maintained separately on `ops/execution-control-plane`; never infer current certification from this historical section.**

## Executed in this sprint
1. Reviewed PR #45 against current main and closed the stale 122-commit branch without merging it wholesale; valid template/Excel work was integrated selectively on current main.
2. Customer order templates now use PostgreSQL normalized storage through `orderTemplates` service operations for create/list/delete/apply; the integrated customer UI no longer uses browser `localStorage` as the template source of truth.
3. Excel Quick Order is integrated as upload → parse → normalize/match → validation/quarantine → review → explicit commit-to-cart.
4. Template persistence is tenant/customer bound with RLS, atomic apply, idempotency, authorization and audit.
5. Template limits are enforced server-side, including a safe default of 50 when organization UI settings are absent.
6. Added covering indexes for the nine remaining FK findings from the live performance advisor.
7. Added an authenticated template persistence/apply/delete Playwright contract that fails loudly when real E2E credentials are absent.
8. Fixed Vitest CI scope to execute application tests under `src` only.

## Live database evidence
- Applied migration history contains `enterprise_order_templates_atomic`, `enforce_template_limits`, `add_missing_fk_indexes`, and `fix_template_limit_default`.
- `order_template_lines` and `order_template_apply_operations` exist with RLS enabled.
- `save_order_template(text,jsonb,text)` and `apply_order_template(uuid,uuid,text)` exist.
- Anonymous execute privilege is denied for both template RPCs.
- Direct live security contract: 54/54 public tables have RLS; 0 RLS-enabled public tables lack policies; 0 public functions are executable by `anon`.
- Direct live checks deny anonymous execution for template save/apply, quick order and cart mutation RPCs.
- Live pgTAP is not claimed; clean-source pgTAP remains a CI/local-database proof boundary.
- Nine FK indexes were applied; unused-index findings were not deleted blindly.

## CI evidence
- Exact SHA `82af52a178a0f52f0a70d2ad8c7a7ba0fbb97b22`: application-quality completed **PASS** through typecheck, unit/integration, lint, production build and release audit.
- Exact SHA `767579168cfd3e687c1274bfa8eace879a288ebd`: fresh `application-quality` and `G1 Domain Proof` runs were triggered; their final results are pending, and `supabase-migration-proof` is also running.

## Certification state
| Stage | State |
|---|---|
| BUILT | **ADVANCED / P0 PRODUCT CLOSURE IMPLEMENTED** |
| INTEGRATED | **SUBSTANTIALLY CLOSED** |
| VERIFIED | **PARTIAL** — exact 82af52 quality proof is PASS; 767579 exact-head proof was pending at the time this historical index entry was written. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser execution is not proven in this historical entry. |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Market-aligned requirements baseline — added 2026-09-18

A fresh Upwork market scan was converted into a non-certifying requirements baseline. The detailed 28-item matrix is in:

- `docs/UPWORK-MARKET-REQUIREMENTS-20260918.md`

The market signal is used to **strengthen acceptance criteria for requirements already inside Aghbari**, not to introduce uncontrolled scope.

| Market dimension | Aghbari acceptance basis | Classification |
|---|---|---|
| Multi-tenant + RLS | tenant isolation must hold at app + DB layers with negative tests | **CORE** |
| RBAC / least privilege | server/database enforcement + forbidden-path proof | **CORE** |
| Catalog + pricing | SKU/barcode/unit/category + server-authoritative price | **CORE** |
| Customers + suppliers | lifecycle, scope, authorization, audit | **CORE** |
| Orders + reliability | transactional state machine, idempotency, replay/conflict handling | **CORE** |
| Inventory + warehouse/branch | server truth, no-oversell, concurrency proof | **CORE** |
| Admin / operations portal | action-oriented workflows, filtering, bulk operations, exceptions | **CORE** |
| Customer B2B portal | catalog → cart → order → tracking → ledger | **CORE** |
| Excel/import/export | quarantine → validate → preview → explicit commit → provenance | **CORE** |
| APIs / webhooks / outbox | contract validation, auth, retry, terminal failure, duplicate prevention | **CORE-RELIABILITY** |
| Arabic / RTL responsive UX | RTL-first behavior across desktop/mobile/forms/tables/dialogs | **CORE-UX** |
| Production proof | artifact identity, deployment, runtime E2E, smoke, observability, recovery | **RELEASE** |
| SaaS plans / theme / WhatsApp | commercial and integration extensions with separate boundaries | **P1** |
| AI | integration-ready boundary only; BI/Decision Intelligence stays in Report-Advisor | **P2 / OPTIONAL** |

### Market-derived Definition of Done

For market-facing production credibility, applicable flows should be supported by exact-head evidence covering:

`AUTH + TENANT ISOLATION + RBAC + CATALOG + PRICING + INVENTORY + ORDERS + IMPORT/EXCEL + AUDIT + IDEMPOTENCY + CONCURRENCY + INTEGRATIONS + ARABIC/RTL + E2E + OBSERVABILITY + DEPLOYMENT`

Market research does **not** override the existing Evidence-First rules, Release Gates, exact-SHA law, or Production-NO-TOUCH boundary.

## Remaining blockers
1. Finish fresh CI/migration/G1 proofs on the exact active certification candidate maintained by the canonical control plane.
2. Execute real authenticated browser E2E for catalog/pricing/cart/checkout/order persistence, templates and Excel review/commit.
3. Execute Tenant-A/Tenant-B adversarial browser proof.
4. Map exact candidate SHA to Vercel Production and run Production browser smoke; current Vercel connector/path may be rate-limited or unavailable and must be reconciled against exact deployment SHA.
5. Enable/configure Supabase leaked-password protection when the project plan/provider path permits it; do not claim PASS while plan-gated or unconfigured.
6. Complete adversarial runtime proof for sensitive authenticated SECURITY DEFINER RPCs.
7. Execute/prove outbox delivery/retry/terminal failure, invitation E2E, dynamic-admin behavior, RBAC direct-RPC denial, finance statement E2E, offline/recovery and import/export adversarial flows where not already covered by exact-head tests.
8. Resolve remaining RLS init-plan warnings only where workload-safe; no blanket rewrite without evidence.
9. Promote P1 market-fit extensions only through an explicit scope decision; do not mutate a frozen certification candidate merely to mirror an Upwork posting.

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`

`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact certification candidate SHA may advance this index toward certification.
