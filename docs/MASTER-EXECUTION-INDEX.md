# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Starting SHA ordered by this Owner-Level sprint: `0f28a8df8ce6efa8f4ee9569c36aa0d696d0386c`.
- Current exact implementation HEAD: `fc4b9ee002e56636ed213444acfbbd76175ddc9a`.
- Single certification candidate: `fc4b9ee002e56636ed213444acfbbd76175ddc9a`.
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
- Exact SHA `fc4b9ee002e56636ed213444acfbbd76175ddc9a`: `application-quality` **PASS**, `security-audit` **PASS**, `G1 Domain Proof` **PASS**, and `supabase-migration-proof` **PASS**.
- Migration proof on this exact SHA reset the database from empty, applied the full migration set in filename order, then ran clean-source pgTAP: **33 test files / 317 tests / 0 failures**.
- The prior migration-proof failure was isolated to `017-import-inventory-delta.test.sql`: both imports occurred in one transaction, so `created_at` was not a safe ordering key. The contract now binds the second assertion to the second import's `source_id`.
- The repair Excel workflow was changed earlier to manual/read-only; no production/main write path is allowed from that workflow.

## Certification state
| Stage | State |
|---|---|
| BUILT | **ADVANCED / P0 PRODUCT CLOSURE IMPLEMENTED** |
| INTEGRATED | **SUBSTANTIALLY CLOSED** |
| VERIFIED | **PARTIAL** — exact 82af quality proof is PASS; 767579 exact-head proof is pending. |
| RUNTIME PROVEN | **PARTIAL** — authenticated browser execution is not proven in this environment. |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Remaining blockers
1. Execute authenticated browser E2E against an exact deployed artifact whose build metadata matches the exact candidate SHA.
2. Execute Tenant-A/Tenant-B adversarial browser proof plus sensitive authenticated SECURITY DEFINER runtime denial/authorization paths.
3. Run Production Smoke and browser smoke against the exact production deployment; current Vercel deployments visible in the connected team are older SHAs and do not prove this candidate.
4. Resolve external platform configuration required for leaked-password/HIBP protection; the current Supabase organization is on the Free plan, so this is not represented as a code-pass failure.
5. Complete any remaining live E2E coverage called out by the product closure scope: invitation activation, dynamic-admin/RBAC denial, finance statement flow, offline/recovery, and import/export adversarial paths where exact-head coverage is not already sufficient.
6. Only after the runtime and production evidence gates close, perform the final candidate freeze and promotion review.

## Operational boundary
- This index is the canonical compact evidence ledger for the current execution branch.
- Evidence is exact-SHA scoped; any subsequent commit invalidates current CI evidence for certification purposes.

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`

`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact certification candidate SHA may advance this index toward certification.
