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


## 2026-09-27 — Reference asset safety and bounded resources

- Reference screenshots are treated as untrusted documentation inputs and must not contain or reproduce secrets, access tokens, session material or private business data.
- Visual fidelity work cannot weaken RLS, RBAC, tenant isolation, storage policies or RPC authorization to reproduce a screenshot.
- Local caches, offline queues, retries and temporary artifacts must remain bounded and must not become alternate sources of transactional truth.
- Security evidence remains exact-SHA evidence; screenshot/reference comparison never substitutes for runtime security verification.

## 2026-09-27 — Visual implementation cannot weaken boundaries

- A screenshot/reference is untrusted input for visual fidelity and cannot justify relaxing RLS, RBAC, tenant isolation, storage policies, RPC privilege boundaries or audit requirements.
- Missing requirements discovered from UI references must be classified against actual callers, roles, tenant scope and data sensitivity before any implementation.
- Reference-driven error/loading/offline states must preserve the same authorization and server-authoritative truth model as the happy path.
- Bounded resource rules apply to offline queues, retries, caches, browser persistence and visual test artifacts.

## 2026-09-27 — Offline catalog cache isolation
- Any local catalog snapshot must be scoped to the authenticated organization, customer, warehouse and user context.
- An offline cache miss must fail closed to an empty catalog rather than falling back to another account's snapshot.
- Cached catalog data remains display-only; online server responses remain authoritative for pricing, stock and transactions.

## 2026-09-28 — Customer address security
- customer_addresses has RLS enabled and its SELECT policy requires both current_organization_id() and current_customer_id() to match the row.
- Direct authenticated INSERT/UPDATE/DELETE table privileges remain revoked; mutations use authenticated-only RPCs that derive tenant/customer context and validate active-customer ownership.
- Address RPCs are SECURITY DEFINER only because they must write the existing audit log without broadening direct table mutation rights. They pin search_path='', validate authenticated customer context, and are explicitly denied to anon.
- The single-default invariant is backed by a partial unique index plus per-customer transaction locking, and the SQL contract test includes negative privilege/execution assertions.

## 2026-09-28 — Supplier / warehouse update security
- Supplier and warehouse update RPCs are SECURITY DEFINER with search_path='', executable by authenticated users only, and explicitly denied to anon.
- Business authorization remains owner/admin-only inside the functions; UI permissions do not substitute for server authorization.
- Tenant scope is derived server-side and the mutation is audited; no direct client write path is introduced by the UI.


## 2026-09-28 — Customer self profile security
- update_customer_self_profile is authenticated-only, anonymous-denied, SECURITY DEFINER, and pinned to search_path=''. It rejects staff contexts and requires an active customer in the current tenant.
- UI editability is not the security boundary; server-side authorization remains authoritative.
