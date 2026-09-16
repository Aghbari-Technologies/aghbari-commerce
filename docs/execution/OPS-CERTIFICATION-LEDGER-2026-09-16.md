# Compact Ops Certification Ledger — 2026-09-16

## Candidate truth
- Current `main`: `fb6700fb7829c57f9dde5e00f0d54d2ee8039778`
- This ledger does not inherit certification from prior SHAs.

## Closed by source evidence
- Operational B2B application and domain services are present.
- Enterprise order-template persistence/apply path is integrated.
- Excel quick-order flow is integrated through validation/quarantine/review.
- Live public and anon EXECUTE privilege on public functions is zero.
- Live `get_low_stock()` search_path is pinned to empty; source parity is tracked in PR #57.
- Twenty-five previously targeted operational FK indexes plus seven newly covered FK advisor findings exist live.
- Onyx is treated as an external operational integration boundary; Report-Advisor remains the analytics/decision layer.

## Open proof gates
- Exact-head migration proof still has stale/drifting test contracts.
- Authenticated browser E2E.
- Tenant A/B browser adversarial proof.
- Sensitive RPC adversarial runtime proof.
- Outbox/retry terminal-state proof.
- Invitation, dynamic-admin, RBAC, finance, offline/recovery and import/export adversarial proofs as applicable.
- Vercel production mapping and production browser smoke.
- Supabase leaked-password protection configuration.

## Release rule
Do not label the candidate `PRODUCTION CERTIFIED` until all mandatory gates have exact-SHA evidence in the same release candidate.
