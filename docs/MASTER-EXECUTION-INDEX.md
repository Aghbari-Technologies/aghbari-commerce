# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Starting SHA ordered by this Owner-Level sprint: `0f28a8df8ce6efa8f4ee9569c36aa0d696d0386c`.
- Current exact implementation HEAD before this documentation commit: `82af52a178a0f52f0a70d2ad8c7a7ba0fbb97b22`.
- Single certification candidate: `82af52a178a0f52f0a70d2ad8c7a7ba0fbb97b22`.
- No evidence from an earlier SHA transfers to this candidate.
- Scope: **Aghbari Commerce only**.

## Executed in this sprint
1. Integrated the reviewed PR #45 customer-facing template/Excel work into current main rather than merging the stale 122-commit branch wholesale.
2. Replaced the customer template UI path with cloud-backed `orderTemplates` service operations for create/list/delete/apply; browser `localStorage` is no longer the template source of truth in the integrated UI path.
3. Integrated the reviewed Excel Quick Order flow: upload → parse → validation/matching → review → explicit commit-to-cart, with rejected rows surfaced rather than silently inserted.
4. Hardened template persistence with normalized `order_template_lines`, tenant/customer binding, RLS, atomic apply, idempotency and audit.
5. Added server-side template-limit enforcement from organization UI configuration.
6. Added covering indexes for all nine foreign-key findings reported by the live performance advisor.
7. Added an authenticated template persistence/apply/delete browser E2E contract that fails loudly when credentials are absent; it is intentionally not treated as executed until a real authenticated environment runs it.
8. Fixed CI's Vitest scope so Playwright E2E files are not accidentally collected by the unit-test command.
9. Closed PR #45 without merging its stale branch; its reviewed valid product changes were integrated selectively on current main.

## Live database evidence
- Applied migration history contains `enterprise_order_templates_atomic`, `enforce_template_limits`, and `add_missing_fk_indexes`.
- `order_template_lines` exists and RLS is enabled.
- `order_template_apply_operations` exists and RLS is enabled.
- Both template RPCs exist.
- Anonymous execute privilege is denied for both template RPCs.
- Direct live security contract: 54/54 public tables have RLS; 0 public tables with RLS lack policies; 0 public functions are executable by `anon`.
- Direct live checks confirm anonymous execution is denied for template save/apply, quick order and cart mutation RPCs.
- Live pgTAP is **not claimed**: the production database does not expose the pgTAP `plan()` function; clean-source pgTAP remains a CI/local-database proof boundary.
- Live performance advisor now has the nine FK indexes applied; unused-index findings remain informational and are not removed blindly.

## CI evidence
- Exact SHA `ad517dbb74f79268990a05b8866ff53a5718db1b`: typecheck passed; unit/integration failed because Vitest was collecting Playwright E2E files.
- Exact SHA `0a8a907323f3c76329a0e79351f180b88c1d6240`: typecheck, unit/integration and lint all passed; production build was cancelled because a newer push superseded the run.
- Exact SHA `82af52a178a0f52f0a70d2ad8c7a7ba0fbb97b22`: fresh application-quality and migration-proof runs were triggered; final conclusions are still pending at this documentation boundary.

## Certification state
| Stage | State |
|---|---|
| BUILT | **ADVANCED / P0 PRODUCT CLOSURE IMPLEMENTED** |
| INTEGRATED | **SUBSTANTIALLY CLOSED** — templates and Excel UI/service paths are integrated on current main. |
| VERIFIED | **PARTIAL** — live DB security/structure checks are proven; exact-head CI and clean migration proof are still pending. |
| RUNTIME PROVEN | **PARTIAL** — no fresh authenticated browser execution has been completed in this environment. |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Remaining release blockers
1. Fresh exact-head CI must finish on `82af52a...` and any resulting SHA after fixes must be re-certified from scratch.
2. Clean-source migration reset + full pgTAP must finish successfully on the exact certification SHA.
3. Authenticated browser E2E for catalog → pricing → cart → checkout → order persistence is still required.
4. Authenticated template E2E and Excel review/commit E2E are still required.
5. Tenant-A/Tenant-B adversarial browser proof remains required; live DB privilege checks do not substitute for browser E2E.
6. Production deployment mapping for the exact certification SHA and production browser smoke remain required; Vercel connector access currently returns 403 for the project, so no production PASS is claimed.
7. Auth leaked-password protection remains disabled according to the live Supabase security advisor and is a release blocker until enabled or explicitly dispositioned by platform configuration evidence.
8. Authenticated SECURITY DEFINER functions remain a deliberate security boundary; each sensitive RPC still requires adversarial runtime proof.
9. Outbox delivery/retry/terminal-failure proof, invitation E2E, dynamic-admin behavior proof, RBAC direct-RPC denial proof, finance statement E2E, offline/recovery proof and import/export adversarial E2E remain to be executed where not already covered by existing exact-head CI contracts.
10. Performance RLS init-plan warnings remain; current policies already use scalar subqueries around profile/auth context in the affected template/settings paths, so no unsafe blanket rewrite is applied without workload verification.

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`

`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact certification SHA may advance this index toward certification.
