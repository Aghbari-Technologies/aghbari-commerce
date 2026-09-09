# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`b63e98aec3fb50bbfc203f5f4ae69cc4db783c44`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: `https://alamri.app/` only; Aghbari identity remains independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current main includes product-price tenant-boundary hardening, import numeric hardening, search_path hardening, operation-idempotency authorization hardening, purchase/receipt idempotency payload hardening, defense-in-depth product-media storage limits, and storage-limit regression proof. |
| VERIFIED | **PARTIAL** — G1 Domain Proof is PASS on exact `b63e98a...`; complete exact-head CI and clean migration/pgTAP evidence still required for final verification. |
| RUNTIME PROVEN | **PARTIAL** — the Aghbari Vercel project is correctly linked to `Aghbari-Technologies/aghbari-commerce`, and production deployment `dpl_HDq2CezGeDHE6GFiQJ6ExL6ftuLQ` is READY on exact SHA `b63e98a...`. Build metadata, HTTPS shell, security headers, PWA manifest, and service worker have been verified. Authenticated browser E2E and real business mutation proof remain required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — final release gates remain open. |

## Latest execution boundary — 2026-09-09
- Added `docs/MASTER-EXECUTABLE-PRODUCT-SPECIFICATION-FOR-DEVELOPER.md` as the master executable specification for implementation and completion.
- Hardened the `product-media` storage bucket server-side: private bucket, 5 MiB maximum object size, and WebP-only objects. Live verification confirms these exact settings.
- Added regression assertions to `supabase/tests/001-storage-boundary.test.sql` proving the bucket is private, enforces the 5 MiB limit, and accepts only WebP objects, in addition to the existing organization-boundary and registration tests.
- Updated `scripts/release-audit.mjs` so future release audits require the canonical product-media storage hardening contract to remain present in migration history.
- Previous purchase/receipt idempotency, numeric finiteness, product-price RLS, import numeric/search_path, RPC hardening, domain/order workflow proof, and PWA/offline hardening remain part of the implementation baseline.
- Vercel project `aghbari-commerce-c2dd` is linked to the canonical Aghbari GitHub repository and currently serves exact `b63e98a...` as a READY production deployment.
- Supabase security-advisor residuals remain the intentional authenticated SECURITY DEFINER surface and the external Auth leaked-password-protection configuration warning. Neither is marked PASS without closure evidence.

## Evidence reviewed
- Purchasing/receiving pgTAP covers create, exact replay, changed-payload rejection, approval, receipt, inventory mutation, Outbox emission, and receipt replay.
- Purchase full-payload pgTAP covers currency and notes conflicts under an existing idempotency key.
- Inventory pgTAP covers atomic transfer, idempotent replay, insufficient-stock rejection, and threshold behavior.
- Stock-count pgTAP covers completion gating, idempotency, reconciliation mutation, variance audit, and cross-tenant mutation rejection.
- Finance pgTAP covers invoice creation, partial/final payment, overpayment rejection, and cash balance.
- Migration-proof workflow is exact-SHA aware and is designed to reset an empty local Supabase database, run pgTAP, and verify migration inventory.
- Product-media unit tests cover allowed MIME types, source-size bounds, decompression-bomb dimensions, and UUID/path validation.
- Product-media pgTAP now covers private-bucket state, server-side size limit, WebP-only storage policy, organization isolation, path validation, and server registration.
- Production deployment evidence confirms Vercel cloned `Aghbari-Technologies/aghbari-commerce` at exact `b63e98a...`, completed the Vite production build, generated `build-meta.json`, and reached READY state.

## Remaining closure work — priority order
### P0 — Release blockers
1. Obtain complete fresh exact-head GitHub Actions evidence for typecheck, lint, unit/domain tests, build and release audit on the final certification HEAD.
2. Execute clean-source migration reset + full pgTAP on the exact certification HEAD.
3. Execute authenticated browser E2E including tenant isolation and exact-created-order persistence.
4. Execute deployed production smoke against the exact deployed SHA, then perform authenticated browser/runtime business-flow proof.
5. Resolve Auth leaked-password-protection configuration warning.

### P1 — Reliability proof
6. Runtime-prove offline refresh/cache/reconnect/replay/conflict/recovery and tenant scoping.
7. Runtime-prove outbox claim/delivery/retry/backoff/terminal failure and consumer idempotency.
8. Runtime-prove import/export malformed-input, quarantine, atomic commit, authorization and cross-tenant cases.
9. Re-run all pgTAP suites on clean/reset/repeat paths.

### P2 — Final hardening
10. Complete query-plan and representative-load review.
11. Complete observability, audit, backup/recovery and rollback evidence.
12. Release candidate → exact-SHA smoke → final regression → freeze → production certification.

## No-false-closure
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. An object-storage policy is not a runtime upload proof. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact **`b63e98aec3fb50bbfc203f5f4ae69cc4db783c44`**. Resolve concrete defects immediately; external access is now available for the canonical Vercel project, while authenticated runtime credentials remain required for full browser certification.