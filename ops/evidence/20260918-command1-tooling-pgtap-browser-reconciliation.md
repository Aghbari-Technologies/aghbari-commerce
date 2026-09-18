# 2026-09-18 — Command 1 — tooling + pgTAP + candidate browser reconciliation

## Exact source state
- Candidate: `4d5057d7952e213d6b5328a80f0229f1ff9fb861` (frozen)
- Main: `4505bcb655c0b747aeea7e1cc526a94f93270d3d`
- Production: `b102ce5e9aebe61bb13581cd9a8f45d1cc43c497` (NO TOUCH)
- Tooling PR #72 head: `92fa7bffb8971eecb10d91fe588709da0e06675a`
- PgTAP diagnostic PR #73 head: `cf7db1c376e40c44ed0cec1956c9b59ee8f5d7f0`

## Tooling PR #72 — exact-head CI
Terminal PASS:
- Application Quality `35308340448`
- Bootstrap Release Lockfile `35308340467`
- G1 Domain Proof `35308340484`
- Intelligence Contract Proof `35308340474`
- Order Workflow Proof `35308340482`
- Order Invariant Contract `35308340457`
- Security / CodeQL `35308340483`
- Security / Gitleaks `35308340477`
- Security / Semgrep CE `35308340528`
- Security / Trivy `35308340452`
- Security Audit `35308340469`
Migration Proof `35308340466` = FAIL only at pgTAP after empty-database migration application succeeded.
Therefore the tooling branch is isolated and the remaining red gate is baseline database-contract evidence, not branch contamination.

## PgTAP baseline-repair PR #73
Run `35308829558`, job `105486436596`, exact SHA `cf7db1c376e40c44ed0cec1956c9b59ee8f5d7f0`.
- SHA validation, checkout, duplicate migration check, Supabase CLI, local Supabase startup, and empty-DB migration apply = PASS.
- pgTAP = FAIL.
- 31 files / 308 tests executed.
Remaining failed assertions (12 total, 5 files):
1. `001-storage-boundary.test.sql`: 5 — storage path/object ownership boundary currently fails on main.
2. `003-purchasing-receiving.test.sql`: 1 — missing durable `purchase.received` event on the exact receipt aggregate.
3. `009-cash-account-expense.test.sql`: 1 — overdraw does not raise SQLSTATE `22003`.
4. `014-core-definer-search_path.test.sql`: 1 — `transfer_inventory` reports `search_path=public`.
5. `019-security-definer-contract.test.sql`: 4 — `get_catalog`, `stage_product_import`, `commit_product_import`, and `transfer_inventory` are not pinned to empty search_path on main.

The earlier test-harness problems were corrected on PR #73 (fixture typing, plans, RLS-safe inspection, missing legacy RPC handling, malformed syntax). These five remaining failures are therefore classified as product/schema contract gaps on main, not proof-harness defects.

## Cross-reference to live production migration ledger
Supabase live project `mrcyqezbhpncuvaehwgf` is ACTIVE_HEALTHY and has already recorded production migrations that correspond to these gaps, including:
- `harden_expense_cash_balance`
- `harden_transfer_inventory_search_path`
- `harden_purchase_receipt_outbox_v2`
- `harden_product_media_read_binding_v2`
- `canonicalize_product_media_storage_boundary_20260917090000`
- `harden_remaining_security_definer_search_paths`
This is read-only corroboration only. No production mutation occurred during this execution.

## Candidate browser proof
Candidate deployment: `dpl_5TaJDPGjjqT9asUJSnS9YDnxvH32`.
Fresh temporary access link was used without weakening Vercel protection.
TinyFish run `683148ee-b515-4e81-a2cb-ff4fa4a07ca0` completed:
- page_loaded = true
- brand = `بوابة الأغبري التجارية (Aghbari Commercial Portal)`
- RTL = true
- login_visible = true
- visible_errors = []
- broken_links_or_images = []
No login, credential submission, or data mutation was performed.

## Certification boundaries
- Authenticated Deployment Browser E2E remains BLOCKED. Exact GitHub job evidence reports missing `VERCEL_AUTOMATION_BYPASS_SECRET`; credential boundary is not available through the connected mutation surface.
- Formal Final Regression remains NOT_PROVEN because workflow dispatch is not exposed.
- Production remains untouched and no promotion occurred.
- Certification remains NO.
