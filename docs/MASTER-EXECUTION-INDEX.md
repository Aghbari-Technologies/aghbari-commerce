# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Starting SHA ordered by this Owner-Level sprint: `0f28a8df8ce6efa8f4ee9569c36aa0d696d0386c`.
- Current exact implementation HEAD: `34428c982c098859ad0247e37a00a801ee4df82d`.
- Single certification candidate: `34428c982c098859ad0247e37a00a801ee4df82d`.
- No evidence from an earlier SHA transfers to this candidate.
- Scope: **Aghbari Commerce only**.

## Executed
1. Added tenant-bound normalized order-template persistence:
   - `order_templates.organization_id`
   - `order_template_lines`
   - `order_template_apply_operations`
   - RLS and tenant/customer predicates
   - authenticated server RPC `save_order_template`
   - authenticated server RPC `apply_order_template`
2. `apply_order_template` validates the complete template before any cart mutation: template ownership, organization, active warehouse, active product, warehouse stock and authorized price. Mutation occurs only after the full validation pass, inside the same database transaction.
3. Template apply is idempotent and records an audit event.
4. Added `src/services/orderTemplates.ts` wired to the canonical RPCs and normalized line storage.
5. Added exact database contract coverage: `supabase/tests/023-order-template-enterprise-contract.test.sql`.
6. Existing `apply_quick_order` was inspected live and confirmed to already implement server-side tenant/customer authorization, idempotency, duplicate-line rejection, authorized pricing, stock locking and atomic cart merge.

## Live database evidence
- Applied migration history contains `enterprise_order_templates_atomic`.
- `order_template_lines` exists and RLS is enabled.
- `order_template_apply_operations` exists and RLS is enabled.
- Both template RPCs exist.
- Anonymous execute privilege is denied for both template RPCs.
- Ten exact live database contract assertions returned `pass=true`.
- Live counts currently show zero template rows and zero apply-operation rows; this is expected because no real customer template mutation was performed merely to manufacture evidence.

## Certification state
| Stage | State |
|---|---|
| BUILT | **ADVANCED / PARTIAL CLOSURE** |
| INTEGRATED | **PARTIAL** — enterprise template backend and service are integrated on current main. |
| VERIFIED | **PARTIAL** — live database contract is proven; full exact-head CI remains pending. |
| RUNTIME PROVEN | **PARTIAL** — current main deployment is queued/building and authenticated browser proof is not yet fresh on the candidate SHA. |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## Remaining release blockers
1. Current `AppV3Fixed.tsx` on main still contains the legacy localStorage template UI path; the database/service implementation is present but current-main UI integration is not yet proven.
2. Current-main Excel UI remains parse-only; the stronger reviewed Excel implementation exists on the separate execution branch and has not been transferred/proven on this exact main candidate.
3. Fresh exact-head CI/typecheck/lint/unit/build/release-audit evidence for `34428c982c098859ad0247e37a00a801ee4df82d` is not yet available.
4. Clean migration reset + full pgTAP evidence on this exact candidate is not yet available.
5. Latest Vercel production deployment for the current candidate is still `QUEUED`; no production PASS is claimed.
6. Auth leaked-password protection remains disabled according to the live Supabase security advisor.
7. Security advisor still reports an authenticated SECURITY DEFINER surface; no blanket removal is performed because several functions are deliberate authorization boundaries and each must be reviewed individually.
8. Fresh authenticated browser E2E, tenant-isolation E2E and production persistence proof remain outstanding.

## Evidence links / identifiers
- Candidate HEAD: `34428c982c098859ad0247e37a00a801ee4df82d`
- Template DB migration: `20260914235034_enterprise_order_templates_atomic.sql`
- Contract test: `supabase/tests/023-order-template-enterprise-contract.test.sql`
- Template service commit: `7eed5cbe0c06868179e9c7d5442c35a785072ad5`
- DB implementation commit: `1c5792439dadde9a9bbbd5996b059e7c0f536dec`
- Current candidate Vercel deployment: `dpl_D4SeCB6z3d9YHaMsL3vjf6NxzezH` — target production, currently queued.

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`

`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact candidate SHA may advance this index toward certification.
