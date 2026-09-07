# Aghbari Commerce — Runtime Reconciliation Log 2026-09-07

**Scope:** `Aghbari-Technologies/aghbari-commerce` only.

## Batch objective
Close live/source drift and exercise the corrected Purchasing/Receiving, Customer and Finance operational boundary with rollback-safe runtime proofs.

## Real work completed

1. Reconciled the operational schema into canonical source migrations `0059` and `0060`.
2. Applied the same schema/RPC canonicalization to the dedicated Aghbari Supabase project.
3. Added explicit authenticated-only privileges for the 13 operational RPCs; anonymous execution remains denied.
4. Added RLS coverage for the 9 newly canonicalized operational tables.
5. Added regression coverage `021`, `022`, and `023` for privilege, RLS, and object/security contracts.
6. Executed a real rollback-safe owner transaction covering supplier creation and purchase-order creation.
7. Executed purchase-order state flow `draft -> submitted -> approved`.
8. Executed partial receiving and verified inventory increased from `5` to `7` in the same transaction.
9. Executed customer creation with tier `wholesale`.
10. Executed cash-account creation with opening balance `100`.
11. Executed expense recording for `25` and verified computed cash balance `75`.
12. Verified all runtime fixtures were rolled back: organization/user/supplier/purchase-order/cash-account counts returned to zero.
13. Found a real defect in `receive_purchase_order`: output parameter `purchase_order_id` shadowed the table column. Fixed in `0061` with explicit aliases.
14. Re-ran the flow and found a second real defect: enum assignment in the status `CASE` was inferred as text. Fixed in `0062` with explicit `public.purchase_order_status` casts.
15. Re-ran the complete purchase/receiving/customer/cash/expense transaction successfully after both fixes.
16. Verified the corrected operational RPC surface: `anon_exposed=0`, `authenticated_exposed=13`; mutating RPCs remain SECURITY DEFINER with fixed `search_path=public`.

## Exact GitHub evidence

- `b5afa8b52fd3a2e9316c9bcc49229e5c63c0c2c6` — canonical operational schema migration `0059`.
- `224d593605a5af58bd6352b55e7a57bb12957b72` — canonical operational RPC migration `0060`.
- `687b4a4beccf9b160c62047d04493f7df9dd2117` — real column-shadowing fix `0061`.
- `cee2ed9d80ec8529db8119f84c4f2f961de0146e` — real enum-cast fix `0062`.
- `c2392ec686a82a8d3ca8adb6396e3b429a8a8828` — operational runtime contract regression `023`.

## Current evidence boundary

- Live operational schema: **APPLIED + EXERCISED**.
- Live operational runtime transaction: **PASS** after two discovered defects were fixed and re-tested.
- Live operational RLS: **ENABLED** on all 9 canonicalized tables.
- Live operational anonymous execution: **0 EXPOSED**.
- Live operational authenticated execution: **13 EXPOSED**.
- CI runner proof: **NOT PROVEN**.
- `package-lock.json`: **NOT PROVEN PRESENT**.
- Browser E2E: **NOT PROVEN**.
- Production: **NOT CERTIFIED**.

No CI, browser, or production PASS is inferred from these live SQL results.
