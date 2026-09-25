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


## 2026-09-25 — SECURITY DEFINER classification checkpoint
- Live Supabase inspection found 62 public SECURITY DEFINER routines executable by `authenticated`, 0 executable by `anon`.
- The live inspection found 0 public SECURITY DEFINER routines without an explicit empty `search_path`.
- Canonical RLS helper functions `current_organization_id()`, `current_customer_id()`, `is_staff()` and `is_staff_reader()` remain executable by `authenticated` because policies invoke them; anonymous execution remains denied.
- The advisor warning for authenticated-callable SECURITY DEFINER routines is therefore treated as an intentional per-RPC classification queue, not a reason for blanket privilege revocation.
- Repository test `supabase/tests/031-security-definer-exposure-classification.test.sql` locks the intended exposure invariant for fresh verification.

## 2026-09-25 — Dynamic client control authorization hardening
- The customer UI settings control plane is now database-gated to organization owner/admin roles for INSERT, UPDATE and DELETE. Organization-scoped SELECT remains available to authenticated organization members.
- UI visibility is therefore aligned with the server/RLS boundary: client-side hiding is not treated as authorization.
- The barcode catalog RPC is recorded in live migration provenance and remains authenticated-only with empty search_path and anonymous denial.
