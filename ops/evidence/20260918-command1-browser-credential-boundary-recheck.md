# 2026-09-18 — Command 1 continuation — browser boundary verification

## Exact candidate deployment
- Candidate SHA: `4d5057d7952e213d6b5328a80f0229f1ff9fb861`
- Deployment: `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32`
- State: READY
- Vercel metadata SHA: exact candidate SHA
- Canonical project: `aghbari-commerce-c2dd` / `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`

## Authenticated browser rerun
- Original failed browser job was re-run without changing candidate source.
- New job: `105488272913`
- Run: `35299467671`
- Exact candidate SHA: `4d5057d7952e213d6b5328a80f0229f1ff9fb861`
- Step 2 failed closed before browser execution because `VERCEL_AUTOMATION_BYPASS_SECRET` is empty.
- `E2E_BASE_URL` and `EXPECTED_SHA` were present and valid; the missing secret is the decisive blocker.
- Customer/admin browser tests were skipped after the fail-closed validation.
- No credentials were generated, printed, stored, or bypassed.

## Read-only browser proof
- TinyFish run: `683148ee-b515-4e81-a2cb-ff4fa4a07ca0`
- page_loaded=true
- Arabic RTL=true
- brand=`بوابة الأغبري التجارية (Aghbari Commercial Portal)`
- login_visible=true
- visible_errors=[]
- broken_links_or_images=[]
- Read-only only; no login or mutations.

## Tooling / regression state
- Tooling PR #72: `92fa7bffb8971eecb10d91fe588709da0e06675a`; 11 terminal CI PASS gates, migration proof FAIL in pgTAP after migrations apply cleanly.
- PgTAP diagnostic PR #73: `cf7db1c376e40c44ed0cec1956c9b59ee8f5d7f0`; 12 real product/schema contract failures remain after harness repair.
- Formal Final Regression: NOT_PROVEN; no executable dispatch workflow is available through the connected GitHub mutation surface.
- Vercel team plan observed as Hobby; no protection was disabled and no automation bypass secret was manufactured.

## Release safety
- Candidate remains frozen.
- Production SHA `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` remains untouched.
- Certification remains NO.
