# Operational Certification Ledger — 2026-09-16

## Candidate truth
- Current `main`: `fb6700fb7829c57f9dde5e00f0d54d2ee8039778`
- This ledger does not inherit certification from prior SHAs.

## Closed by source evidence
- Operational B2B application and domain services are present.
- Enterprise order-template persistence/apply path is integrated.
- Excel quick-order flow is integrated through validation/quarantine/review.
- Inventory reconciliation has a dedicated tenant/import-boundary proof restored on PR #53.
- Repository engineering contract explicitly separates implementation, verification, runtime proof and production certification.

## Open proof gates
- Exact-head CI and migration/domain proof.
- Authenticated browser E2E.
- Tenant A/B browser adversarial proof.
- Sensitive RPC adversarial runtime proof.
- Outbox/retry terminal-state proof.
- Invitation, dynamic-admin, RBAC, finance, offline/recovery and import/export adversarial proofs as applicable.
- Vercel production mapping and production browser smoke.
- Supabase leaked-password protection configuration.

## Release rule
Do not label the candidate `PRODUCTION CERTIFIED` until all mandatory gates have exact-SHA evidence in the same release candidate.
