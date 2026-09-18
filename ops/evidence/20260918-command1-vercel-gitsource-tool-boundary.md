# 2026-09-18 — Command 1 — Vercel Git-source connector boundary

## Purpose
Re-test the strongest safe exact-SHA deployment path without altering the frozen candidate or Production.

## Exact candidate
- SHA: `4753cc3319f551aeccbe2bd081b988fa68df8e87`
- Branch: `execution/closure-hammer-20260918c`
- Vercel project: `aghbari-commerce-c2dd` / `prj_ww25V0FNP0YQCIcCAEFKVPkzLyOm`

## Findings
1. Official Vercel deployment documentation exposes `gitSource` as a supported alternative to `files` for deployment creation.
2. The connected `deploy_to_vercel` tool wrapper rejects a `gitSource`-only request before reaching the deployment API:
   `INVALID_ARGUMENT: files: Invalid input: expected array, received undefined`
3. No deployment was created by this probe.
4. The candidate remains absent from the canonical Vercel deployment list and the GitHub candidate status remains the Vercel deployment-rate-limit failure.
5. PR #72 remains isolated. Its exact head `92fa7bffb8971eecb10d91fe588709da0e06675a` has terminal PASS security/tooling runs but its `supabase-migration-proof` run `35308340466` fails in existing pgTAP baseline tests; this is not candidate evidence and no product change was made.

## Classification
- Deployment: BLOCKED / NOT_AVAILABLE
- Deployment Browser: BLOCKED — approved `VERCEL_AUTOMATION_BYPASS_SECRET` unavailable
- Formal Final Regression: NOT_PROVEN — no connected workflow-dispatch capability
- Candidate source: FROZEN / unchanged
- Production: NO TOUCH

## Durable rule
Do not add partial or reconstructed `files[]` merely to satisfy the connector schema when the release claim requires exact candidate-source identity. Use a Git-linked deployment path or a complete exact-source upload with independently verifiable identity.
