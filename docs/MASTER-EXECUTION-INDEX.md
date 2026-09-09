# Aghbari — Master Execution Index

**Canonical status ledger. Updated after every meaningful execution boundary.**

## Identity
- Product: **بوابة الأغبري للمواد الغذائية**
- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Current exact implementation HEAD after this execution boundary: **`34cdccb065b7e398fbfde9f2b153dbeb6d2aafca`**.
- Scope: **Aghbari Commerce only.** `Report-Advisor` and every other project are out of scope.
- Benchmark reference: `https://alamri.app/` only; Aghbari identity remains independent.

## Certification stages
| Stage | Current state |
|---|---|
| BUILT | **ADVANCED IMPLEMENTED** — commerce shell, catalog/pricing, cart/orders, staff operations, customers, inventory, purchasing/receiving, finance, import/export, outbox, PWA/offline and security hardening are present. |
| INTEGRATED | **IMPLEMENTATION PASS** — current main includes product-price tenant-boundary hardening, import numeric hardening, search_path hardening, operation-idempotency authorization hardening, and purchase/receipt idempotency payload hardening. |
| VERIFIED | **NOT PROVEN** — fresh exact-head GitHub Actions evidence is still required. |
| RUNTIME PROVEN | **PARTIAL / NOT CERTIFIED** — live Supabase proof exists for selected authenticated flows; full browser/deployed runtime proof remains required. |
| PRODUCTION CERTIFIED | **NOT PROVEN** — release gates remain open. |

## Latest execution boundary — 2026-09-09
- Current main exact HEAD is **`34cdccb065b7e398fbfde9f2b153dbeb6d2aafca`**.
- Live Supabase migration history now ends with:
  - `20260909021428_harden_product_prices_rls_organization_boundary`
  - `20260909021749_harden_purchase_receipt_idempotency_payloads`
  - `20260909021819_fix_purchase_numeric_finiteness_and_payload_conflicts`
- Repository migration files now contain both purchase migrations with the exact live versions; the previously-created incorrectly-versioned `20260909022000` file was removed.
- A real purchase-command defect was discovered during adversarial runtime probing: `create_purchase_order` called nonexistent `isfinite(numeric)`, causing a PostgreSQL `42883` failure before a valid purchase could be created. The final migration replaces that with explicit rejection of `Infinity`, `-Infinity`, and `NaN` numeric values.
- A second real defect was identified: purchase and receipt idempotency replay previously returned the existing record without validating that the replay payload matched the original payload. The live functions now canonicalize and compare supplier/warehouse/currency/notes/lines for purchases and purchase-order/notes/receipt lines for receipts, rejecting mismatches with `40001 idempotency key payload conflict`.
- Existing pgTAP coverage already expects these semantics: purchase payload changes are rejected, receipt payload changes are rejected, and exact replays do not duplicate inventory. The implementation has now been brought into alignment with those tests.
- The live Supabase database remains **ACTIVE_HEALTHY**. Previous RLS/search_path hardening remains in force: 45/45 public tables have RLS, 0 anon-executable RPCs, and the `product_prices_staff_read` organization boundary is enforced.
- Supabase security-advisor residuals remain the intentional authenticated SECURITY DEFINER surface and the external Auth leaked-password-protection configuration warning. Neither is marked PASS without closure evidence.
- Vercel remains externally blocked by 403/re-authentication/build-rate-limit conditions; production runtime is therefore not certified.

## Evidence reviewed
- Purchasing/receiving pgTAP covers create, exact replay, changed-payload rejection, approval, receipt, inventory mutation, Outbox emission, and receipt replay. 
- Purchase full-payload pgTAP covers currency and notes conflicts under an existing idempotency key.
- Inventory pgTAP covers atomic transfer, idempotent replay, insufficient-stock rejection, and threshold behavior.
- Stock-count pgTAP covers completion gating, idempotency, reconciliation mutation, variance audit, and cross-tenant mutation rejection.
- Finance pgTAP covers invoice creation, partial/final payment, overpayment rejection, and cash balance.
- Migration-proof workflow is exact-SHA aware and is designed to reset an empty local Supabase database, run pgTAP, and verify migration inventory.

## Remaining closure work — priority order
### P0 — Release blockers
1. Obtain fresh exact-head GitHub Actions evidence for typecheck, lint, unit/domain tests, build and release audit.
2. Execute clean-source migration reset + full pgTAP on exact current HEAD.
3. Execute authenticated browser E2E including tenant isolation and exact-created-order persistence.
4. Re-authenticate Vercel team scope, verify/deploy the exact current SHA, then execute deployed runtime smoke.
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
A migration file is not migration execution evidence. A UI restriction is not authorization evidence. A queued outbox event is not successful delivery evidence. A green run on an earlier SHA is not exact-current-HEAD evidence. A documentation PASS is not a runtime PASS. Test credentials must never be fabricated or committed.

**NEXT EXECUTION LOOP:** continue Aghbari-only execution from exact **`34cdccb065b7e398fbfde9f2b153dbeb6d2aafca`**. Resolve concrete defects immediately; external runner/deployment gates remain blocked until executable evidence exists.
