# Runtime Reconciliation Boundary

The 2026-09-07 operational reconciliation is intentionally isolated on `execution/live-runtime-reconciliation-20260907` until CI and migration proof are available.

## Verified live facts

- 13 reconciled operational RPCs are executable by `authenticated`.
- 0 of those reconciled RPCs are executable by `anon`.
- 11 reconciled operational tables have RLS enabled.
- SECURITY DEFINER functions inspected use a fixed public search path where required.

## Non-certified facts

- No claim is made that the current branch can recreate the live database without applying the complete migration chain.
- No CI PASS is claimed.
- No browser E2E PASS is claimed.
- No production certification is claimed.

## Required next proof

1. Run the migration proof from the exact branch HEAD.
2. Run privilege/RLS pgTAP tests.
3. Generate the synchronized npm lockfile and prove `npm ci`.
4. Run typecheck, unit, lint, build and release audit.
5. Only then promote the reconciled branch toward the main certification candidate.
