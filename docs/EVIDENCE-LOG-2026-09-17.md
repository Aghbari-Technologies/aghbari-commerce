# Aghbari Commerce — Evidence Log — 2026-09-17

## Current closure candidate
`946176e695c11d03d3f10ad9b93ec857b9ec1cce`

Closure branch: `execution/final-closure-surgery-20260917`
Base: `main` at `fb6700fb7829c57f9dde5e00f0d54d2ee8039778`
Main was not modified.

## Findings from exact-SHA execution
- The C72 round exposed actual source/test drift, not merely missing evidence.
- Clean-source migrations were missing the chunked import lifecycle used by the application.
- Clean-source migrations were missing `update_customer` and owner-only `set_organization_user_role`.
- Clean-source security regression exposed three public functions executable by `anon` after later function recreation.
- RBAC price fixtures conflicted with the temporal unique key because repeated `set_product_price` calls share the same transaction timestamp; the test now uses distinct price lists without pre-seeded conflicting rows.
- Import foreign-tenant checks were corrected to exercise the security boundary at valid lifecycle/query-visibility stages.

## Fixes on closure branch
`ed523b558d611dfef7ed162648b01c1356d5b22d` restored chunked import RPCs and repaired the existing RBAC fixture/signatures.

`946176e695c11d03d3f10ad9b93ec857b9ec1cce` restored customer update/owner role management, revoked anon execution across the public function surface, and repaired the existing RBAC and Import proofs.

## Exact observed CI
For `ed523b558d611dfef7ed162648b01c1356d5b22d`:
- Application Quality run `35171051497`: PASS.
- Order Workflow run `35171051485`: PASS.
- Migration proof run `35171051517`: empty-database migration application PASS; pgTAP then exposed the defects above.
- Test-the-Test run `35171051535`: exact checkout and fresh DB setup PASS; baseline sensitive suite FAIL, therefore mutation stages remained fail-closed.
- Fresh Local Browser E2E run `35171051544`: exact checkout/clean install/local Supabase startup executed; evidence invalidated after the code/test HEAD advanced.

For `946176e695c11d03d3f10ad9b93ec857b9ec1cce`:
- Fresh exact-SHA closure workflows were created automatically after the fixes.
- No PASS is claimed until the new runs complete on this exact SHA.

## External boundaries
- Vercel matching deployment remains externally blocked by build-capacity/rate-limit state.
- Report-Advisor handoff remains externally blocked until its URL/token contract is configured.
- Supabase leaked-password protection remains an external plan/configuration gate; no forced upgrade/workaround.

## Certification
Not certified until the current exact SHA proves internal gates and then matching deployment -> artifact -> live runtime -> browser -> production smoke.
