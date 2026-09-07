# Aghbari Commerce — Execution Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch: RPC privilege closure + order state-machine + offline queue + client transition boundary

### Completed implementation evidence
- Added `supabase/tests/018-rpc-privilege-surface.test.sql`: 57 assertions covering anonymous/PUBLIC denial, authenticated execution, context helpers, and legacy 4-argument catalog denial.
- Added `supabase/tests/019-security-definer-contract.test.sql`: 12 assertions covering fixed `search_path = public` and intentional SECURITY DEFINER status on the exposed command/read RPC boundary.
- Added `supabase/tests/020-order-state-machine-boundary.test.sql`: 8 assertions for same-tenant order creation, unauthorized viewer transition denial, cross-tenant transition denial, RLS isolation, inventory decrement, and status-history scoping.
- Corrected test `020` after source inspection showed `transition_order` explicitly returns `42501` for an unauthorized role; the test now asserts the real contract.
- Expanded `src/services/offlineQueue.test.ts` with adversarial coverage for offline browser gating, queue mutation during draining, terminal-operation skipping, cyclic payload rejection, malformed retry timestamps, maximum-attempt retry timing, whitespace normalization, explicit invalid-user filtering, payload/queue ceilings, and user isolation.
- Corrected the retry-boundary assertion to the actual configured maximum-attempt delay (`256000ms`); the implementation's `15min` ceiling is above the current 8-attempt boundary and is not falsely claimed as reached.
- Hardened `src/services/orders.ts` with fail-closed validation for client order-transition inputs: UUID order id plus canonical `order_status` enum values, with whitespace normalization before the RPC call.
- Expanded `src/services/orders.test.ts` with valid normalization coverage and invalid UUID/empty/unknown-status rejection cases.

### Live/source evidence retained
- Live privilege aggregation independently re-checked: 18/18 expected privilege rows passed; 0 failed. Legacy 4-argument catalog remains denied to authenticated/anon/PUBLIC.
- `src/services/cart.ts` calls the authenticated customer RPC surface and validates product UUIDs and quantity bounds before online calls/offline queueing.
- `src/services/catalog.ts` calls only the mandatory 5-argument warehouse-aware `get_catalog` and preserves finite-number guards.
- `transition_order` canonical source locks by order id plus authenticated organization, then applies explicit role/state authorization and records history/audit.
- Tenant A/B cart/order runtime-equivalent isolation remains proven: foreign product, foreign warehouse, and foreign order transition are rejected; opposite-tenant orders are hidden; own order creation succeeds.
- Import correctness remains proven with inventory deltas `0→4 = +4` and `4→7 = +3`; successive price versioning uses `clock_timestamp()`.
- Migration numeric-prefix reconciliation remains complete at source level with no duplicate-prefix blocker in the scanned tree.

### CI / runner boundary
- Workflow definitions remain exact-SHA-bound where required; application quality uses Node 22 and `npm ci` plus typecheck/test/lint/build/release-audit.
- Bootstrap workflow is triggered on `security/rpc-surface-final6`, but a synchronized `package-lock.json` is still not proven present.
- New commits trigger workflow execution, but job-step/log evidence remains unavailable; CI therefore remains **NOT PROVEN** and no code-level diagnosis is inferred from the failure status.
- No production certification is claimed from workflow existence or failure status without runner evidence.

### Current branch
- Branch: `security/rpc-surface-final6`
- Exact latest execution commit: `61f537566bbe5aa086ba54862f4a12b3ff8c7b0e`
- PR: `#42`
- PR remains open and unmerged.

### Certification boundary
- RPC privilege surface: **LIVE 18/18 PASS**.
- RPC SECURITY DEFINER/search-path contract: source regression added; CI execution still not proven.
- Order state-machine boundary: source regression added after inspecting canonical transition contract.
- Client order-transition input boundary: hardened and regression-covered at source level.
- Offline queue: adversarial source regression expanded; runtime/CI execution not yet proven.
- Tenant/RPC/catalog/cart/order/import hardening: materially strengthened and transactionally exercised.
- CI runner evidence, lockfile/npm-ci, authenticated browser E2E, and production runtime proof: **NOT CERTIFIED**.

**No production certification is claimed by this log.**
