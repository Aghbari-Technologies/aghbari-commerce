# Aghbari — Implementation Status V1

**Boundary:** executable implementation + R5 purchasing/receiving + reliability hardening

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
- Purchasing + receiving vertical slice: IMPLEMENTED — migrations `0026`/`0027`, typed service, adversarial pgTAP coverage, operational command-center UI
- Catalog export: AVAILABLE through the existing operational export panel
- Outbox: durable claim/recovery contract implemented; deployable webhook worker now present; production delivery proof remains open
- Real Auth/RLS E2E: BLOCKED pending connected staging Supabase target
- Browser E2E: BLOCKED pending authenticated browser runtime
- Production deployment: OPEN — runtime target and deployment proof not yet established
- Production certification: NOT CERTIFIED

## Current implementation boundary
The repository contains a real React/Vite operational application, Supabase migration/RPC implementation, domain services/tests, offline/PWA assets, import pipeline, catalog export, order/cart hardening, and purchasing/receiving operations.

R5 now covers:
- tenant-bound suppliers;
- purchase-order creation with server-side validation;
- submit → approve workflow;
- atomic receiving into warehouse inventory;
- inventory movement evidence;
- audit/outbox evidence;
- operation-level idempotency;
- rejection of same-key/different-payload replay;
- adversarial pgTAP coverage;
- staff command-center controls for supplier creation, purchase creation, approval and receiving.

## Verification boundary
Current PR #15 head is `a71ac34eebf4b05629f149b6e2ab243448becac5`. The three available current-head GitHub Actions checks (`quality`, `security`, `migration-proof`) were created for this exact SHA but completed in approximately two seconds with failure before any workflow step executed. Therefore this is recorded as **verification infrastructure failure**, not a code PASS and not a certification PASS.

## Immediate execution order
1. Re-run/repair the GitHub Actions runner/check execution so the current exact HEAD can receive executable CI evidence.
2. Provision/connect a staging Supabase project and run direct-request authorization + RLS negative tests.
3. Execute the new purchasing/receiving pgTAP suite against an empty database and verify upgrade migration behavior.
4. Complete durable outbox delivery/retry/consumer-idempotency proof against a real endpoint.
5. Complete authenticated browser/runtime proof for catalog → cart → order → warehouse → purchasing/receiving.
6. Add deployment smoke, recovery, performance and observability evidence.
7. Freeze one exact HEAD and issue final production certification only after all gates pass.

## Product boundary — non-negotiable
Aghbari owns operational truth. Report-Advisor owns analytics/intelligence. The allowed direction remains:

`Aghbari → Intelligence Integration Gateway → Canonical Analytical Dataset → Report-Advisor`.

No duplicate BI/analytics dashboard or operational write path is introduced into Aghbari.

## Evidence rule
Every future PASS claim must name the exact HEAD, execution environment, test path, and evidence artifact. A commit alone is never a runtime PASS.
