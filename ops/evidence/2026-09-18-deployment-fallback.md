# 2026-09-18 — Deployment fallback sweep / exact candidate

- Exact certification candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34`; no candidate source mutation.
- Exact candidate CI remains proven: 11/11 certification gates terminal PASS, including application quality, security, G1, order workflow, Supabase migration proof, local production artifact, customer/admin local browser E2E, concurrency, and test-the-test.
- Canonical Vercel project `aghbari-commerce-c2dd` currently reports `api-deployments-free-per-day` with remaining `0`; direct API deployments for both canonical and isolated project scopes fail with HTTP 402 until the quota reset.
- Current READY Vercel deployment `dpl_DV8KfvckbwwprYYKMRHGHodcWmQW` is on SHA `87aaa32a4b675c342cfd5c5aaff36a5c2c46e637`. GitHub compare proves it is exactly three commits ahead of candidate and those three commits touch only workflow/E2E files; no `src/**` product code differs. This is runtime correlation only, not exact-candidate deployment evidence.
- Canonical Vercel project runtime-error scan over the last 24h returned no runtime errors.
- Netlify exact-candidate fallback workflow `35381203602`, rerun attempt 2, successfully rebuilt and verified the exact candidate artifact, then failed closed at `Require Netlify token`: `NETLIFY_AUTH_TOKEN` is absent from GitHub Actions. No secret was written to source control.
- A temporary GitHub Pages fallback branch/workflow was tested and then its workflow file was removed after the workflow failed with zero jobs; it is not certification evidence.
- Production remains NO TOUCH. No promotion or production mutation was performed.
