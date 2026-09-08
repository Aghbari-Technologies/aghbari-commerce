# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD: **`17930735e3fd0f9aa25702dba76f15d783ee7f30`**
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current `main` contains the latest merged security/runtime hardening, FK-index hardening, readiness register, deployment-payload hardening, checkout input hardening, and operational-invoice RLS restoration. |
| VERIFIED | **NOT PROVEN** — fresh exact-head CI evidence still required. |
| RUNTIME PROVEN | **NOT PROVEN** — authenticated browser/deployment proof still required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — certification gate remains open until runtime evidence is green. |

## Current execution evidence
- `docs/IMPLEMENTATION-READINESS-REGISTER-V1.md` remains the source-to-runtime closure register.
- Checkout hardening validates warehouse UUIDs, bounds idempotency keys, limits checkout lines, validates product UUIDs, rejects duplicate products, requires safe positive integer quantities, and fails closed on an untrustworthy create-order response.
- Regression coverage for checkout input boundaries and false-success guards exists in `src/services/orders.input.test.ts`; execution evidence is still runner-gated.
- Connected Supabase evidence currently shows **34/34 public tables with RLS enabled** and **0 public routines granting EXECUTE to anon**.
- A live security gap was found and fixed: `operational_invoices` and `operational_invoice_items` had RLS enabled but no policies. The canonical read policies were added to source and applied to the live Aghbari Supabase project. Post-fix verification confirms both authenticated SELECT policies exist.
- Static review of public SECURITY DEFINER functions found the current authenticated RPC surface is role/context guarded in the live definitions; the remaining Supabase advisor WARNs are the expected pattern warning for authenticated access to SECURITY DEFINER RPCs, not proof of unrestricted authorization.
- Live migration history remains **not source-identical** to the repository migration filenames/sequence. This is an actual P0 reconciliation item: the live project has timestamped/legacy migration records that do not map one-to-one to the current canonical repository chain. No false PASS is recorded for clean provisioning until this is reconciled.
- `.vercelignore` keeps deployment payload focused on runtime/build inputs; no application source or public runtime assets are excluded.

## Remaining closure work — priority order
### P0 — Release blockers
1. Produce and commit a deterministic `package-lock.json` on a real GitHub runner. Current bootstrap runner attempts are failing before the first step with no runner assigned; this is an external GitHub Actions execution-layer blocker.
2. Obtain fresh step-level typecheck, lint, unit/domain, database/pgTAP, build, security and release-audit evidence for the exact current HEAD.
3. Reconcile the repository migration chain with the live migration history/schema so a clean environment can be provisioned deterministically from source.
4. Provision two dedicated authenticated E2E test identities (Tenant A and Tenant B) with known non-production credentials and run the authenticated browser proof. The repository E2E contract already requires `E2E_EMAIL/E2E_PASSWORD` and `E2E_EMAIL_B/E2E_PASSWORD_B`; credentials are not present in this execution context and must never be invented or committed.
5. Execute authenticated browser E2E with real credentials, including tenant isolation and exact-created-order persistence.
6. Execute deployment/runtime smoke tests against the exact deployed build SHA. No Aghbari Vercel project is currently connected in the available Vercel team; the available projects are unrelated, so no unrelated deployment will be mutated.

### P1 — Reliability proof
7. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
8. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
9. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
10. Re-run full pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
11. Complete query-plan and representative load review with production-like data.
12. Complete observability, audit, backup/recovery and rollback evidence.
13. Deploy release candidate → exact-SHA smoke → final regression → freeze exact HEAD → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact `main` HEAD after this index commit. Code defects are fixed immediately; external runner/deployment/auth gates remain explicitly blocked until executable evidence is obtained.
