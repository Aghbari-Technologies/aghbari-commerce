# 🔴 AGHBARI — CANONICAL SECURITY, RELIABILITY, OFFLINE & INTEGRATIONS

**Authority:** Security model, isolation, external side effects, offline/weak-network behavior and integration contracts.

## Security chain
UI → service/API authorization → domain policy → database/RLS → audit.

## Minimum security model
Deny-by-default; least privilege; RBAC; tenant/branch/warehouse/customer isolation; RLS; locked RPC execution; hardened SECURITY DEFINER and search_path; input validation; rate/abuse controls; secure headers; secrets isolation; storage boundaries; invitation security; sensitive-payload minimization; negative security tests.

## Integration pattern
Domain command → transaction → outbox/event → worker → adapter → delivery record → retry/dead-letter/terminal failure. Use idempotency and correlation identifiers. Core transactions must not depend synchronously on unreliable external systems.

## Offline rule
Offline cache/drafts are never authoritative. Synchronize through bounded, idempotent operations; server remains authoritative for price, stock, permissions and order acceptance; conflicts are explicit.

## Integration boundaries
Onyx/legacy migration, WhatsApp and Report-Advisor remain external boundaries. BI/advanced analytics do not become part of Commerce transactional truth.

## Canonical source merge register
The manifest lists the security/offline/integration sources that must be fully merged here before retirement.
