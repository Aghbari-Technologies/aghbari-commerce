# Aghbari Commerce — Runtime Reconciliation Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch

**Objective:** close live/source drift discovered while exercising the operational Purchasing, Receiving, Customer and Finance surfaces.

### Real findings

1. The live Supabase project contained operational RPCs that were not represented by the current candidate source migration set.
2. Newly reconciled operational tables required RLS coverage; live audit confirmed `11/11` enabled after reconciliation.
3. PostgreSQL default function execution inheritance exposed the newly reconciled RPC surface to `anon` until explicit grants/revokes were applied.
4. After correction, the live operational privilege boundary is `anon_exposed=0`, `authenticated_exposed=13`.
5. SECURITY DEFINER operational functions inspected retain fixed `search_path=public` where applicable.

### Source evidence

- `0047_operational_runtime_reconciliation.sql` mirrors the live privilege boundary and explicitly revokes execution from PUBLIC before granting authenticated execution.
- `021-operational-rpc-privilege-boundary.test.sql` adds regression assertions for anonymous/PUBLIC denial across the operational RPC surface.

### Exact commits

- `77b3fe687f753f5b7c9b6db945019b75b2ceeaa9` — operational runtime reconciliation migration.
- `26c8cb082f15d80cb885d562e2003c3c121dad44` — operational RPC privilege regression test.
- `ac1ff0dde942e5fccb6e14ee0192697d70d5fb75` — status/log synchronization.

### Certification boundary

- Live operational schema reconciliation: **APPLIED**.
- Live operational RLS coverage: **11/11 ENABLED**.
- Live operational anonymous execution exposure: **0**.
- Live operational authenticated execution surface: **13**.
- CI execution: **NOT PROVEN**.
- Browser E2E: **NOT PROVEN**.
- Production certification: **NOT CERTIFIED**.

No production PASS is inferred from schema or source presence alone.
