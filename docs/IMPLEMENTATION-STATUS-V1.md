# Aghbari — Implementation Status V1

**Boundary:** post-Batch-3 reconciliation + executable implementation verticalization

## Status

- Architecture: RECONCILED
- Canonical ownership: ACCEPTED
- Physical relation families: IMPLEMENTED IN MIGRATION TREE
- Transactional domain POC invariants: PROVEN at prior exact boundary
- Order workflow POC: PROVEN at prior exact boundary
- Operational frontend/PWA: IMPLEMENTED IN PR #15
- Operational domain/services: IMPLEMENTED IN PR #15
- Supabase operational migrations/RLS/RPC layer: IMPLEMENTED IN PR #15
- Catalog, cart, orders, import, image pipeline and offline queue: IMPLEMENTED IN PR #15
- Purchasing + receiving vertical slice: IMPLEMENTED — migrations `0026`/`0027`, typed service, adversarial pgTAP coverage
- Worker/outbox: FOUNDATIONAL DATABASE CONTRACT IMPLEMENTED; durable deployed worker runtime still open
- Real Auth/RLS E2E: BLOCKED pending connected staging Supabase target
- Browser E2E: BLOCKED pending authenticated browser runtime
- Production deployment: OPEN — runtime target and deployment proof not yet established
- Production certification: NOT CERTIFIED

## Current implementation boundary
The repository now contains a real React/Vite operational application, Supabase migration/RPC implementation, domain services/tests, offline/PWA assets, import pipeline, and the first purchasing/receiving runtime vertical slice. This supersedes the earlier documentation-only implementation status.

The purchasing/receiving slice provides:
- tenant-bound suppliers;
- purchase-order creation with server-side validation;
- submit → approve workflow;
- atomic receiving into warehouse inventory;
- inventory movement evidence;
- audit/outbox evidence;
- operation-level idempotency;
- rejection of same-key/different-payload replay;
- adversarial pgTAP coverage for the above boundaries.

## Verification boundary
Current PR-head changes have been committed through exact HEAD `50579f05d4f178729900d42774828eeeaf10e5b5`. The available PR-triggered GitHub Actions runs for the preceding head completed as failures before executing any job steps, so no current-head runtime PASS is asserted from those runs. The repository remains evidence-bound: implementation is not converted into runtime or production certification until the corresponding real-environment gates execute successfully.

## Immediate execution order
1. Keep PR #15 as the integration boundary until its checks can execute against the current head.
2. Provision/connect a staging Supabase project and run direct-request authorization + RLS negative tests.
3. Complete durable outbox worker runtime and delivery/retry/consumer-idempotency proof.
4. Complete authenticated browser/runtime proof for catalog → cart → order → warehouse/purchase receiving.
5. Add import/export, performance, observability, recovery and deployment evidence gates.
6. Run deterministic full-suite certification against one frozen exact HEAD.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction remains:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

Do not create duplicate BI/analytics dashboards or operational write paths from Report-Advisor into Aghbari.

## Evidence rule
All future PASS claims must name the exact HEAD, execution environment, test path, and evidence artifact. A commit alone is never a runtime PASS.
