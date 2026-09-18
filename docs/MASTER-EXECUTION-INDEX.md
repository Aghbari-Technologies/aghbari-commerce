# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Starting SHA ordered by this Owner-Level sprint: `0f28a8df8ce6efa8f4ee9569c36aa0d696d0386c`.
- Current exact implementation HEAD: `4753cc3319f551aeccbe2bd081b988fa68df8e87`.
- Single certification candidate: `4753cc3319f551aeccbe2bd081b988fa68df8e87`.
- No evidence from an earlier SHA transfers to this candidate.
- Scope: **Aghbari Commerce only**.

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
| VERIFIED | **PARTIAL** — exact 82af quality proof is PASS; 767579 exact-head proof is pending. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser execution is not proven in this environment. |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Remaining blockers
1. Finish fresh CI/migration/G1 proofs on exact candidate `767579168cfd3e687c1274bfa8eace879a288ebd`.
2. Execute real authenticated browser E2E for catalog/pricing/cart/checkout/order persistence, templates and Excel review/commit.
3. Execute Tenant-A/Tenant-B adversarial browser proof.
4. Map exact candidate SHA to Vercel Production and run Production browser smoke; current Vercel connector cannot deploy the project from this session.
5. Enable/configure Supabase leaked-password protection; live advisor still reports it disabled.
6. Complete adversarial runtime proof for sensitive authenticated SECURITY DEFINER RPCs.
7. Execute/prove outbox delivery/retry/terminal failure, invitation E2E, dynamic-admin behavior, RBAC direct-RPC denial, finance statement E2E, offline/recovery and import/export adversarial flows where not already covered by exact-head tests.
8. Resolve remaining RLS init-plan warnings only where workload-safe; no blanket rewrite without evidence.

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`

`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact certification candidate SHA may advance this index toward certification.


## Latest Exact-Head Reconciliation — 2026-09-18
- Candidate: `4753cc3319f551aeccbe2bd081b988fa68df8e87` on `execution/closure-hammer-20260918c`, PR #74.
- Terminal exact-SHA verification is PASS across the current candidate gates, including application quality, G1, migration proof, security, order contracts, concurrency, Test-the-Test, Fresh Local Supabase Browser E2E, and Local Production Artifact Browser E2E.
- Exact Deployment contract `35310024991`: PASS; browser child is SKIPPED because no deployment exists for the exact candidate SHA.
- Canonical Vercel project `aghbari-commerce-c2dd` (`prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`) is linked to `Aghbari-Technologies/aghbari-commerce`; latest observed READY deployments are on different SHAs.
- `Runtime E2E Certification` is dispatchable in source as `.github/workflows/runtime-e2e.yml`, requiring `base_url` and `exact_sha`; browser dispatch is blocked by authentication in the connected session.
- `Production Smoke / Exact Artifact` is verification-only; no Vercel deployment workflow exists in the repository.
- Certification remains NOT PROVEN. Production remains NO TOUCH.
