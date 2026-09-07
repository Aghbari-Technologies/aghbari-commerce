# Aghbari Commerce — Execution Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch: RPC privilege closure + order state-machine boundary + offline queue adversarial hardening

### Completed implementation evidence
- Added `supabase/tests/018-rpc-privilege-surface.test.sql`: 57 assertions covering anonymous/PUBLIC denial, authenticated execution, context helpers, and legacy 4-argument catalog denial.
- Added `supabase/tests/019-security-definer-contract.test.sql`: 12 assertions covering fixed `search_path = public` and intentional SECURITY DEFINER status on the exposed command/read RPC boundary.
- Added `supabase/tests/020-order-state-machine-boundary.test.sql`: 8 assertions for same-tenant order creation, unauthorized viewer transition denial, cross-tenant transition denial, RLS isolation, inventory decrement, and status-history scoping.
- Corrected test `020` after source inspection showed `transition_order` explicitly returns `42501` for an unauthorized role; the test now asserts the real contract rather than an invented error code.
- Expanded `src/services/offlineQueue.test.ts` with adversarial coverage for offline browser gating, queue mutation during draining, terminal-operation skipping, cyclic payload rejection, malformed retry timestamps, maximum-attempt retry timing, whitespace normalization, and explicit invalid-user filtering.
- Corrected the new retry-boundary assertion to the actual configured maximum-attempt delay (`256000ms`); the implementation's `15min` ceiling is above the current 8-attempt boundary and therefore is not falsely claimed as reached.

### Live/source evidence retained
- Live privilege aggregation independently re-checked after the RPC regression work: 18/18 expected privilege rows passed; 0 failed. The legacy 4-argument catalog boundary remains denied to authenticated/anon/PUBLIC.
- `src/services/cart.ts` calls the authenticated customer RPC surface (`get_cart`, `set_cart_item`, `remove_cart_item`, `clear_cart`) and validates product UUIDs and quantity bounds before online calls/offline queueing.
- `src/services/catalog.ts` calls only the mandatory 5-argument warehouse-aware `get_catalog`; it resolves an active warehouse from the authenticated user's organization when none is supplied and preserves finite-number guards for returned quantity/price.
- `supabase/migrations/0005_order_state_machine.sql` confirms `transition_order` locks the order by both order id and authenticated organization context, then applies explicit role/state authorization and records history/audit evidence.
- Tenant A/B cart/order runtime-equivalent isolation remains proven from the prior batch: foreign product rejected, foreign warehouse rejected, foreign order transition rejected, opposite-tenant orders hidden by RLS, and own order creation succeeds.
- Import correctness remains proven with inventory deltas `0→4 = +4` and `4→7 = +3`; successive price versioning uses `clock_timestamp()`.
- Migration numeric-prefix reconciliation remains complete at source level with no duplicate-prefix blocker in the scanned tree.

### CI / runner boundary
- GitHub workflow definitions are correctly bound to exact SHA where required; application quality uses Node 22 and `npm ci` plus typecheck/test/lint/build/release-audit.
- The bootstrap workflow is triggered on `security/rpc-surface-final6`, but a synchronized `package-lock.json` is still not proven present.
- The offline-queue change triggered workflow execution on the new commit; job-step/log evidence remains unavailable and the observed workflow result is not used as a code-level diagnosis. CI therefore remains **NOT PROVEN**.
- No production certification is claimed from workflow existence or a failure status without runner evidence.

### Current branch
- Branch: `security/rpc-surface-final6`
- Latest branch HEAD: `4136fd0a47b1d06cca699e5e2b9f45e4508a41df`
- PR: `#42`
- PR remains open and unmerged.

### Certification boundary
- RPC privilege surface: **LIVE 18/18 PASS**.
- RPC SECURITY DEFINER/search-path contract: source regression added; CI execution still not proven.
- Order state-machine boundary: source regression added after inspecting the canonical transition contract.
- Offline queue: adversarial source regression expanded; runtime/CI execution not yet proven.
- Tenant/RPC/catalog/cart/order/import hardening: materially strengthened and transactionally exercised.
- CI runner evidence, lockfile/npm-ci, authenticated browser E2E, and production runtime proof: **NOT CERTIFIED**.

**No production certification is claimed by this log.**
