# 2026-09-18 — Deployment fallback sweep / exact candidate

- Exact certification candidate remains `2facceb39aaa826413f20245a6f20b6c2ff7cd34`; no candidate source mutation.
- Exact candidate CI remains proven: 11/11 certification gates terminal PASS, including application quality, security, G1, order workflow, Supabase migration proof, local production artifact, customer/admin local browser E2E, concurrency, and test-the-test.
- Canonical Vercel project `aghbari-commerce-c2dd` currently reports `api-deployments-free-per-day` with remaining `0`; direct API deployments for both canonical and isolated project scopes fail with HTTP 402 until the quota reset.
- Current READY Vercel deployment `dpl_DV8KfvckbwwprYYKMRHGHodcWmQW` is on SHA `87aaa32a4b675c342cfd5c5aaff36a5c2c46e637`. GitHub compare proves it is exactly three commits ahead of candidate and those three commits touch only workflow/E2E files; no `src/**` product code differs. This is runtime correlation only, not exact-candidate deployment evidence.
- Canonical Vercel project runtime-error scan over the last 24h returned no runtime errors.
- Netlify exact-candidate fallback workflow `35381203602`, rerun attempt 2, successfully rebuilt and verified the exact candidate artifact, then failed closed at `Require Netlify token`: `NETLIFY_AUTH_TOKEN` is absent from GitHub Actions. No secret was written to source control.
- A temporary GitHub Pages fallback branch/workflow was tested and then its workflow file was removed after the workflow failed with zero jobs; it is not certification evidence.
- Production remains NO TOUCH. No promotion or production mutation was performed.

## Append-only continuation — 2026-09-18 20:00 +03

- User created a Netlify Personal Access Token and stored it only as GitHub Actions secret `NETLIFY_AUTH_TOKEN`. The token value was never written to repository source or chat.
- Netlify probe workflow was corrected to deploy the already-built `dist/` artifact with Netlify CLI `--no-build`, preventing Netlify from rebuilding from probe-branch SHA and breaking exact artifact identity.
- Netlify probe workflow correction commit: `47d7e99a3984fba56779fc70436a577992d65b72`.
- First corrected probe run `35388454447` / job `105740911335`: exact candidate checkout/build/deploy/public SHA verification passed, but deployed Customer E2E failed because the frontend build had no Supabase public runtime configuration; observed error: `Supabase runtime configuration is missing`.
- Connected Supabase project `mrcyqezbhpncuvaehwgf` was identified as the active `aghbari-commerce` project. The public project URL and enabled publishable key were used only as frontend configuration; no service-role key was used.
- Netlify production build environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` were also configured on site `6c515d48-3385-46eb-958c-3ff2ee17e95e` for future builds. Values are public frontend configuration.
- Probe workflow build was corrected to inject the same public Supabase configuration during the exact-candidate build while preserving `VITE_BUILD_SHA=2facceb...`. Correction commit: `edf3b10486d62f69e414f0c13ce99532eb8bd028`.
- Final Netlify probe run: `35388800852`, job `105742046560`, completed SUCCESS.
  - Exact source checkout: PASS, actual HEAD `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
  - Exact artifact build + metadata verification: PASS.
  - Netlify token presence: PASS.
  - Netlify exact artifact deployment: PASS.
  - Public `build-meta.json`: PASS with exact SHA `2facceb39aaa826413f20245a6f20b6c2ff7cd34`.
  - Chromium install + browser credentials: PASS.
  - Deployed Customer E2E: PASS.
  - Deployed Admin E2E: PASS; 1 test passed.
  - Browser evidence artifact: uploaded as GitHub Actions artifact `10564948795`.
- Netlify deploy produced by the successful run is deploy ID `6aad96f8f09963d71ffa10dc`, state `ready`, production URL `https://aghbari-commerce-web.netlify.app`, deploy URL `https://6aad96f8f09963d71ffa10dc--aghbari-commerce-web.netlify.app`.
- This proves exact-candidate live Netlify deployment plus authenticated Customer/Admin browser E2E for the candidate artifact. It does not by itself replace any separately required canonical/formal runtime certification workflow if such a workflow is still gated elsewhere.
- Production remains NO TOUCH; the Vercel quota blocker remains external.