# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Truth Reset
- Current `main` observed: `fb6700fb7829c57f9dde5e00f0d54d2ee8039778`.
- Current closure work is split into narrow PRs; no prior SHA evidence transfers automatically.
- Scope: **Aghbari Commerce only**.

## Executed in current closure pass
1. Confirmed `main` moved past the previous candidate and reset certification truth to the exact observed HEAD.
2. Restored the previously reverted tenant/import reconciliation pgTAP contract in PR #53; the proof verifies Commerce `import_jobs` ownership and rejects cross-tenant dataset pairing.
3. Added a compact owner-level closure gate in PR #54 covering P0 security/data-integrity, core business, reporting boundary, and runtime/release proof gates.
4. Added a compact Commerce → Reporting Gateway → Report-Advisor boundary contract gate in PR #55.
5. Added a compact operational certification ledger in PR #56.
6. Preserved the rule that documentation/evidence changes do not constitute production certification.

## Existing implementation baseline
- The repository already contains the Arabic RTL commerce application, operational domain services, Supabase migrations/RPCs, PWA/offline primitives, import pipeline, catalog export, order/cart hardening, purchasing/receiving, audit/outbox foundations, security hardening, Enterprise B2B work, order-template persistence, and Excel Quick Order flow.

## Current proven facts
- `README.md` explicitly defines Commerce as the operational system of record and Report-Advisor as the analytics/decision layer.
- Current package scripts include typecheck, build, lint, Vitest under `src`, Playwright E2E, and release audit.
- Live evidence recorded by the previous exact-head index included 54/54 public tables with RLS, no public functions executable by `anon`, protected template RPCs, and nine FK indexes; these are historical evidence and must be re-proven on a changed candidate when required by impact.

## Exact-head proof gates still required
- Fresh CI quality, migration proof, and domain proof on the release candidate.
- Authenticated customer/admin browser E2E.
- Tenant-A/Tenant-B adversarial browser proof.
- Sensitive SECURITY DEFINER RPC adversarial runtime proof.
- Outbox delivery/retry/terminal failure proof.
- Invitation E2E, dynamic-admin behavior, RBAC direct-RPC denial, finance statement E2E, offline/recovery, and import/export adversarial coverage where not already exact-head proven.
- Exact candidate → Vercel production mapping, READY deployment, runtime inspection, and production browser smoke.
- Supabase leaked-password protection configuration.

## Certification state
| Stage | State |
|---|---|
| BUILT | **ADVANCED** |
| INTEGRATED | **SUBSTANTIALLY CLOSED** |
| VERIFIED | **PARTIAL — exact-head reproof pending** |
| RUNTIME PROVEN | **PARTIAL** |
| PRODUCTION CERTIFIED | **NOT PROVEN** |

## No-false-closure
`CODE != TEST != CI != RUNTIME != LIVE != PRODUCTION`

`IMPLEMENTED != VERIFIED != PROVEN != CERTIFIED`

Only evidence produced against the exact certification candidate SHA may advance this index toward certification.
