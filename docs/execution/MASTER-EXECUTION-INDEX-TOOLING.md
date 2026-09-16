# Execution Tooling Boundary

The current execution environment can inspect and write repository content, create branches/PRs, query GitHub Actions, and query the connected Supabase project. Vercel project/deployment access is account-permission dependent.

Evidence rules:
- Never report local test execution unless CI or a local runner actually executed it.
- Never report browser E2E unless an authenticated browser session actually produced evidence.
- Never report Vercel Production READY/runtime proof unless the connected account returns that evidence.
- Never substitute source inspection for runtime proof.
- Keep all blockers exact-SHA scoped.
