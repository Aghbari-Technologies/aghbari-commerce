# 🔴 AGHBARI COMMERCE — PROJECT MEMORY / PRIMARY CONTROL

**Project:** Aghbari Commerce | الأغبري
**Repository:** Aghbari-Technologies/aghbari-commerce
**Status:** CANONICAL CONTROL LAYER
**Scope:** Commerce only. Report-Advisor is separate and out of scope.

## 1. PURPOSE

This is the permanent root memory. It is the only file that a new execution session must treat as the starting memory after verifying the exact Git HEAD.

It does not compete with specialist documents. It decides:
- which document is authoritative for each concern;
- how work is resumed;
- how evidence is accepted;
- how regressions are prevented;
- how legacy documents are retired.

## 2. CANONICAL DOCUMENT SYSTEM

| Layer | Canonical file | Authority |
|---|---|---|
| Router | AGHBARI-EXECUTION-START.md | launch only |
| Primary memory/control | PROJECT_MEMORY.md | permanent rules/decisions |
| Product/requirements | docs/canonical/01-PRODUCT-REQUIREMENTS.md | product scope + acceptance |
| UX/UI | docs/canonical/02-UX-UI-CUSTOMER-EXPERIENCE.md | complete interface contract |
| Architecture/data/domain | docs/canonical/03-ARCHITECTURE-DATA-DOMAIN.md | architecture + ownership + invariants |
| Security/reliability/integrations | docs/canonical/04-SECURITY-RELIABILITY-INTEGRATIONS.md | security + offline + integration contracts |
| Quality/certification/release | docs/canonical/05-QUALITY-CERTIFICATION-RELEASE.md | proof + release gates |
| Market/differentiation | docs/canonical/06-MARKET-DIFFERENTIATION-PORTFOLIO.md | market value within scope |
| Development history | ops/AGHBARI-DEVELOPMENT-PROGRESS.md | historical execution |
| Current state | ops/AGHBARI-LATEST-EXECUTION-STATE.md | live checkpoint + resume pointer |
| Consolidation manifest | docs/CANONICAL-DOCUMENT-SYSTEM.md | source-to-canonical map + retirement gate |

## 3. AUTHORITY ORDER

EXACT CURRENT REPOSITORY STATE
→ LATEST EXECUTION STATE
→ CANONICAL SPECIALIST DOCUMENT
→ VERIFIED EVIDENCE
→ HISTORICAL MERGED CORPUS
→ CHAT HISTORY

A historical document can explain what happened; it cannot override current code, current database state, or current exact-SHA evidence.

## 4. NO-REGRESSION RULE

Never restart from an older phase because:
- an old document is still visible in Git;
- an old branch exists;
- an old issue describes an earlier gap;
- a historical SHA appears in an execution log.

Resume from the newest exact HEAD and newest CURRENT RESUME POINTER.

Reopen closed work only when there is:
- a regression;
- a relevant code/dependency change;
- an environment change;
- invalidated evidence;
- a security finding;
- a direct requirement change.

## 5. EXECUTION ALLOCATION — EVERY LAUNCH

Execution capacity is **parallel and gap-driven**, not a fixed 50/50 split.

Required active fronts:
- FULL UI/UX CLOSURE;
- CORE / DATABASE / SECURITY / QA / INTEGRATION / PERFORMANCE / RELEASE.

Allocate effort by risk, dependency and closure value. However, while UI gaps and core/security gaps are independently executable, neither may be postponed behind the other.

A blocked front never blocks an independent executable front.

## 6. UI COMPLETENESS STANDARD

A UI section is not complete because its route exists.

Completion must consider, when applicable:
route → subroute → component → form → dialog/drawer → table/card → search → filters → sort → pagination → bulk action → validation → permission → loading → empty → error → success → disabled → offline → responsive → accessibility → real persistence/logic.

Fake buttons, placeholders, fake data and dead interaction are incomplete work.

## 7. CORE COMPLETENESS STANDARD

Every material capability must connect through:
UI → service/domain → API/RPC → authorization → database/RLS → persistence → audit → verification.

The database/server remains authoritative for prices, stock, permissions, order acceptance and transactional truth.

## 8. PARALLEL EXECUTION

Required independent fronts:
UI/UX, core transactions, security/data integrity, QA/browser/test-the-test, deployment/release proof, performance/resource preservation.

A blocked front must not stop an independent executable front.

## 9. RESOURCE RULES

Reuse before adding.
Refactor before duplicating.
CSS/design-system before new UI dependencies.
Bound caches/queues/storage.
Avoid duplicate builds/CI/deployments/assets.
Never delete business, financial or audit data merely to save space.

## 10. EXACT-SHA EVIDENCE

PASS requires:
exact SHA + environment + executable check + result + relevant evidence.

Never transfer evidence between:
HEADs, branches, PRs, CI runs, artifacts, candidates, deployments, runtime targets or production.

CODE != TEST != CI != ARTIFACT != CANDIDATE != DEPLOYMENT != PRODUCTION.

## 11. MEMORY WRITE-BACK

At the end of every execution:
- update PROJECT_MEMORY.md only when a durable rule/decision changes;
- append a compact run record to ops/AGHBARI-DEVELOPMENT-PROGRESS.md;
- replace ops/AGHBARI-LATEST-EXECUTION-STATE.md with the newest exact state and one executable resume pointer.

The resume pointer must name the domain, files, specific unfinished work, dependencies and proof to run next.

## 12. DOCUMENT CONSOLIDATION RULE

The repository previously accumulated a large Markdown corpus. The final state must have:
- one authoritative root memory;
- one authoritative specialist document per concern;
- one historical progress ledger;
- one live state file;
- one consolidation manifest.

Legacy documents are retired only after their content has been semantically merged and the coverage audit proves that no requirement, invariant, decision, risk, acceptance criterion, or evidence note was lost.

Deleting first is prohibited.

## 13. PRODUCT NORTH STAR

Build a serious sellable Arabic-first B2B operational commerce product:
- excellent Admin/Staff command center;
- excellent Customer Portal;
- reliable catalog/pricing/customers/orders/purchasing/inventory/finance/import/export;
- strong tenant isolation and RBAC/RLS;
- reliable offline/weak-network behavior;
- durable integrations/outbox;
- evidence-backed release discipline;
- market differentiation based on operational speed, trust, migration readiness and Arabic/RTL quality.

## 14. CURRENT COMMAND

Command "1" means:
**EXECUTE NOW FROM THE LATEST EXACT HEAD.**

## 15. DURABLE IMPLEMENTATION DECISIONS — 2026-09-24

- Customer checkout keeps one idempotency key for the active submission attempt and rotates it only after a successful order response; retrying an ambiguous failure must not silently create a new key.
- Customer portal editing may continue offline where the existing cart queue supports it, but order submission remains server-bound and is explicitly blocked without connectivity.
- Customer order-detail mapping is a runtime trust boundary: UUIDs, quantities, prices, totals/currency and status-history states are validated before presentation.
- Security advisory warnings for intentionally callable `SECURITY DEFINER` RPCs are classified against the function's tenant/role checks and `search_path`; an advisor warning is never represented as a clean security result without evidence.

## 16. DURABLE OFFLINE RELIABILITY RULE — 2026-09-24

- Offline cart mutations are the only currently permitted queued mutations.
- Reconnect must automatically re-authenticate through the current session, replay the user-scoped cart queue, and refresh authoritative server state.
- Queued operations now carry explicit lifecycle state: `queued`, `retrying`, `conflicted`, or `terminal`.
- HTTP conflict responses (409/412) are terminal-conflict records and are never replayed automatically; authorization/validation 4xx failures are terminal; transient failures remain bounded retries.
- A local execution test passed for the offline queue classification/replay guard. This is source-level/executable local evidence only and is not CI or browser certification.


## 17. DURABLE SCHEMA DECISION — 2026-09-25

- `public.orders.payment_method` is part of the canonical order contract and must exist on every fresh database. Migration `20260925000000_restore_order_payment_method.sql` restores the live schema contract with default `credit` and allowed values `credit|cash|transfer`.
- Any future `create_order(..., p_payment_method)` change must update schema, fresh-DB tests and runtime/browser evidence together; live-schema presence alone is insufficient.


## 18. DURABLE RBAC/GOVERNANCE DECISION — 2026-09-25

- Staff/user role management uses the pre-existing canonical RPC surface list_organization_users() + set_organization_user_role(uuid,user_role); duplicate list_staff_members / set_staff_role RPCs were introduced during exploration and then retired immediately to preserve one active authority.
- set_organization_user_role is hardened with owner-only mutation, self-role-change rejection, tenant-scoped row locking, customer-to-staff promotion rejection, last-owner protection, empty search_path, authenticated-only EXECUTE and success audit emission.
- Admin Access Control UI uses the canonical organization-user RPCs and exposes explicit read-only behavior for non-owners; the final database/RPC boundary remains authoritative.
- Governance UI now exposes real notifications, audit records and outbox state with search/filter/reload/error/empty handling. Audit metadata is redacted for token/secret/password/authorization/cookie fields before display.
- The Supabase security advisory remains a classification queue: 62 authenticated-executable SECURITY DEFINER warnings plus the external leaked-password-protection warning. No blanket revoke was applied because these RPCs are part of the transactional application boundary.



## 19. DURABLE EXECUTION CHECKPOINT — 2026-09-25

- Functional baseline for this execution wave: 0bf3322f007227eed4eeec54c8943f33caee5e9f.
- Governance surfaces are real and server-backed: Customer/Staff notifications, Staff audit/outbox, and Admin organization user/role management.
- Role management authority is canonical: list_organization_users() + set_organization_user_role(uuid,user_role). Exploratory duplicate RPCs were retired.
- Canonical role hardening includes owner-only mutation, self-role rejection, customer-to-staff promotion rejection, last-owner protection, tenant row lock, SECURITY DEFINER, empty search_path, authenticated-only execution, and audit emission.
- Notification read state uses the canonical mark_notification_read(uuid) RPC. Direct table mutation from the UI was removed.
- Audit metadata is redacted before display.
- RLS helper EXECUTE was tested and intentionally restored for authenticated users because policies invoke these SECURITY DEFINER helpers directly; anon/public remain denied.
- Current Supabase security posture: 62 authenticated-executable SECURITY DEFINER findings plus one external leaked-password-protection warning. This is an intentional application-RPC review queue; do not blanket revoke transactional RPCs.
- Promotions remains a contract gap: canonical docs mention the bounded context, but the live schema has no promotions/discount/campaign table and no detailed business contract. Do not fabricate the feature.


## 9. UI/Core closure checkpoint — 2026-09-25

- Latest functional implementation SHA: `ce79c609ae1507060711fbe0d2fb9e78e522ba06` on `main`.
- Admin UI now has a real Catalog & Products workspace with search, category/status filters, sort, pagination, edit and controlled activation changes.
- Staff customer directory now has search, active/inactive and tier filters, pagination, invitations, tier management and activation controls.
- Staff order queue now has status filtering, search and pagination while preserving server-side workflow transitions.
- Customer order history now has its own responsive workspace with search, status filtering, pagination, detail/tracking and reorder actions.
- Checkout payment selection is now passed to the canonical `create_order` RPC through `createOrder(...,{paymentMethod})`; the UI normalizes to the first enabled payment method when configuration changes.
- Do not claim exact-SHA PASS until gates for `ce79c609ae1507060711fbe0d2fb9e78e522ba06` finish. Hosted Browser E2E remains subject to the existing Vercel Deployment Protection artifact-identity gate.


## 10. UI closure continuation — 2026-09-25

- Latest functional code SHA: `1482a7eaa29162d96a4bf5d32e113f14226daa2b` on `main`.
- Purchasing queue now has search/status filtering and pagination, with React hook ordering corrected before acceptance.
- Finance now has a real invoice history workspace with search/status filtering/pagination, and React hook ordering corrected before acceptance.
- Category management now has a real hierarchical read workspace with search, retry/error/empty states and responsive presentation.
- No exact-SHA PASS is transferred from older checkpoints; current proof status must be read from CI for the exact current SHA.


## 11. Full UI surface expansion — 2026-09-25

- Latest functional UI SHA: `37cc8687bb89e47357c96e04d0921662be2fa4e4` on `main`.
- Admin surface now exposes dedicated workspaces for catalog products, category hierarchy, pricing matrix, customers, purchase orders, purchase receipts, suppliers/supplier ledger, warehouses/branches, inventory movement ledger, finance operations history, notifications, governance and access control.
- Customer surface now includes catalog pagination, dedicated order history with filters/pagination/detail/reorder, richer account dashboard, finance center, templates, notifications, Excel quick order and controlled checkout/payment flow.
- All new UI read workspaces use current tenant-scoped backend tables/RPCs already present; no new schema contract was invented for presentation-only work.
- Vercel currently reports a deployment rate-limit failure on current pushes; this is a hosting/quota gate, not accepted as UI proof. Exact browser/CI evidence remains required before certification.


## 12. UI closure expansion — latest functional checkpoint

- Latest functional UI SHA: 2bea11707d9a5ba4241fcc59ae05e761fb12fe10 on main.
- Customer Portal: catalog pagination and richer account dashboard are active.
- Admin: dedicated Catalog, Category, Pricing, Customer, Purchasing, Receiving, Supplier, Warehouse, Inventory Ledger/Activity, Finance history, Notifications, Governance and Access workspaces are wired.
- Deep read workspaces use current tenant-scoped operational contracts already present in Commerce; no Promotions surface was fabricated.
- Vercel currently reports a deployment-rate-limit failure with a 24-hour retry window; this is not UI certification evidence.


## 20. DURABLE UI CLOSURE DECISION — 2026-09-25

- Shared component `src/RecordDetailDrawer.tsx` is the standard progressive-disclosure surface for dense operational records. It is accessible, responsive, Escape-dismissible and read-only by default.
- Purchasing, receiving, inventory activity, finance history, pricing matrix, supplier ledger and warehouse directory now expose record-level detail where existing fields are already available.
- Governance audit/outbox, notifications and organization access directories now use bounded pagination and reset page state when the active filter/search/tab changes.
- Inventory activity pagination applies uniformly to transfers, stock-count sessions and reconciliations; no tab may bypass the active page window.
- These UI improvements reuse existing tenant-scoped service/table/RPC contracts. No reporting, promotions or parallel transactional source of truth was introduced.


## 21. UI CLOSURE CHECKPOINT — 2026-09-25

- Customer Directory now exposes record-level details through the shared `RecordDetailDrawer`, including tier, contact/state and the invitation link generated during the active session.
- Customer finance ledger is bounded to ten movements per page so the portal remains usable on large statements; authoritative export still reads the full loaded ledger set.
- Staff/Admin nested records consistently use the shared detail workspace where the existing data contract exposes useful fields; the list remains the primary scan surface.


## Durable checkpoint — 2026-09-25 03:13
- Functional main checkpoint: `2fae69ec7e274b92a895ade22561752ab495709b`.
- Added visible Customer offline Recovery Center with bounded failure metadata.
- Added Admin permission-aware Command Palette (Ctrl+K/⌘K).
- Added inventory Barcode-first lookup and product barcode persistence through canonical 8-argument upsert RPC.
- Added safe redaction for outbox error display.
- Prior exact proof bundle `5ea7e162…` remains valid only for that exact SHA. New code checkpoint `2fae69ec7e274b92a895ade22561752ab495709b` requires fresh exact-SHA verification.
- Vercel deployment is subject to current build-rate-limit; hosted deployment proof is not claimed. Netlify free project exists but connector requires local source command and the execution container has no GitHub DNS.

## 22. DURABLE CUSTOMER QUICK-ORDER / CATALOG DECISION — 2026-09-25

- Customer quick-order and Excel identifier resolution now use the canonical `public.get_catalog_with_barcode(text,uuid,integer,integer,uuid)` RPC through `src/services/catalog.ts`.
- The catalog client contract includes `barcode` so customer-facing identifier resolution can distinguish an exact SKU from an exact barcode without heuristic acceptance of an arbitrary single search result.
- Customer portal section navigation is URL-hash resumable (`#catalog`, `#orders`, `#finance`, `#templates`, `#account`, `#notifications`) and browser Back/Forward state is synchronized.
- Customer modal/drawer interactions support Escape dismissal and explicit dialog/accessibility labels.
- `src/services/quickOrder.ts` now enforces UUID, idempotency-key, quantity, line-count and duplicate-product boundaries before calling `apply_quick_order`; boundary tests live in `src/services/quickOrder.test.ts`.
- The live Supabase barcode-aware RPC is present, `SECURITY DEFINER`, `search_path=""`, callable by `authenticated`, and denied to `anon`. These facts are live-environment evidence and are not substitutes for exact-SHA application/security certification.

## 23. DURABLE BARCODE CATALOG MIGRATION DECISION — 2026-09-25

- The barcode-aware customer catalog RPC is now part of the repository's migration lineage through `supabase/migrations/20260925103000_canonical_barcode_catalog_rpc.sql`.
- The migration recreates the exact live contract: warehouse/customer/tenant checks, bounded pagination, customer-tier pricing, barcode-aware search, `SECURITY DEFINER`, empty `search_path`, authenticated EXECUTE and anon denial.
- The live Supabase project was updated from this migration content and re-queried successfully; the database function signature and privilege boundary match the migration contract.
- Customer frontend barcode resolution must use this canonical RPC rather than a live-only or manually-created function.


## 24. CONTROL PLANE UI REBUILD — 2026-09-25
- Rebuilt `src/AdminExecutiveDashboard.tsx` into the Aghbari Control Plane visual system based on the supplied reference level: RTL-first operations dashboard, premium teal/white cards, compact KPI rail, quick actions, recent orders, status distribution, data-management tiles, and right-side section rail.
- The new dashboard links only to existing Aghbari operational surfaces already present in `AdminPanel.tsx`: orders, customers, catalog, pricing, inventory, purchasing, receipts, suppliers, finance, import/export, notifications, governance, access and customer settings.
- No reporting/BI surface or Promotions feature was fabricated. Reporting remains outside the Commerce transaction source of truth.
- Viewer-role routing was corrected so authenticated `viewer` users remain in the staff/admin control plane with their server-enforced read-only permissions rather than falling through to the customer portal.
- Staff top chrome now uses the Aghbari brand and responsive RTL presentation.
- UI implementation commits for this wave: `cf0798a02a593a4917be60c77e1ce59da4b04d87`, `e56945578ccf8a487e7a36d52e171e6a8f479fff`, `56b43e1e11d056f7c58f5f947cd72fe9c6b05abd`, `1f88db47c4b0267e4b837f5c33e38fdcd92b8a2f`, `ee960bb33b3c2b21f0892477bb07c8248a2072c0`.
- This is implementation progress, not exact-SHA certification; fresh CI/browser/deployment evidence is still required.

## 25. LEGACY V2 STRUCTURE RECONCILIATION — 2026-09-25
- The supplied legacy v2.0 Admin information architecture has been encoded into `src/structure/admin-structure.ts` without restoring the old brand as active product identity.
- Structure entries carry `path`, `permission`, `actions`, and status: `live`, `boundary`, or `contract-gap`.
- Current live Commerce workspaces are linked to their existing AdminPanel anchors; unsupported legacy items are explicitly bounded instead of rendered as fake features.
- Customer Portal capabilities are encoded in `src/structure/customer-structure.ts`.
- Current staff-role visibility is centralized in `src/structure/role-matrix.ts` and remains only a presentation contract; Supabase/RLS/server authorization remains authoritative.
- Admin deep-link resolution is encoded through `adminTargetForPath()` and Vercel SPA fallback routing.
- The supplied AI/advanced-reporting/Developer AI/Onyx analytical list is treated as legacy structural input and boundary documentation, not permission to move BI or external analytical snapshots into Commerce transactional truth.

## 26. STRUCTURE-DRIVEN ADMIN NAVIGATION — 2026-09-25
- Admin dashboard structure, deep links, and Command Palette now derive from the same code-level structure manifest rather than independent hardcoded navigation lists.
- Role visibility for the structure navigator uses `src/structure/role-matrix.ts`; this is UI visibility only and never replaces server-side authorization.


## 25. UI CLOSURE RUN — 2026-09-25
- Implementation line advanced through the customer and operational UI closure wave; exact implementation commits: `f5b5e98e1a3e880ca7b1928543261a73397b408b`, `460c4c81d6d5ef286d9f3a777b7c9476df2e5721`, `c29b2b9bcfd39d502743e04b9db1735e88f48326`, `26d828e35ace7fd8f968cd08eb103f881d383403`, `63d29c38539ab000780388e3bc18f7a035b17175`, `cabf7f16b7a614f886933680e59c860495e0a5f2`, `6f0a489e7b2e90eccb1bd83fd1075514c1b07e92`.
- Customer portal now has explicit product-detail inspection, quantity-aware add-to-cart, cart clearing, checkout readiness summary and corrected saved-orders label.
- Catalog now has a real new-product creation form using the existing canonical `upsert_product` RPC contract.
- Finance invoices now expose record-level detail through the shared drawer.
- Low-stock inventory rows now link directly into the real transfer workspace; approved/partially-received purchase orders link directly into receiving.
- No new transactional backend authority, Promotions surface, or BI/reporting source was introduced.
- Current verification status remains implementation-only until fresh exact-SHA CI/browser/runtime evidence is available.


## 26. UI CLOSURE RUN — 2026-09-25 — CUSTOMER / OPERATIONS DEEPENING
- Customer Portal now exposes first-class Account, Notifications and Offline Recovery surfaces from the authenticated app, wired to the existing session/user and notification/offline contracts.
- Customer Order history now uses the dedicated `CustomerOrdersPanel` plus `getCustomerOrderDetail` contract for verified order detail, line items and status timeline; detail presentation uses the shared RecordDetailDrawer.
- Customer section navigation now persists via URL hash with `hashchange` + `popstate` handling and pushState, preserving browser back/forward semantics.
- Customer overlays now have explicit dialog semantics; Escape closes the top active customer overlay. Successful order submission is now visibly acknowledged and dismissible.
- Purchasing UI now matches its existing service contract by supporting a bounded multi-line purchase-order builder (up to 200 unique products) with client-side boundary validation before the canonical RPC call.
- Governance audit now has bounded pagination and progressive detail drawers; Staff Access now exposes record details for organization users.
- Catalog has a real new-product creation surface; Finance invoice rows expose detail; low-stock inventory links directly into transfer; approved/partial purchase orders link directly into receiving.
- Current Vercel status remains an external deployment-rate-limit failure; exact GitHub workflow runs for the newest head are queued. No build/browser/certification PASS is claimed.


## 27. UI CLOSURE RUN — 2026-09-25 — FINAL SESSION WAVE
- Customer Portal: Account, Notifications and Recovery are first-class sections; section navigation uses URL hash + popstate/hashchange; order history uses the dedicated verified detail service; Quick Order resolves exact SKU/Barcode against the canonical barcode-aware catalog RPC when the identifier is not already loaded locally.
- Customer overlays now carry explicit dialog semantics and Escape dismissal; successful order submission remains visible until explicitly dismissed.
- Catalog: new-product creation and progressive product detail inspection are available using the existing canonical product RPC and shared detail drawer.
- Purchasing: order entry supports multiple unique lines within the existing 200-line service boundary; Receiving now supports multiple remaining PO lines in one bounded operation.
- Operations: Governance audit pagination/detail, Outbox detail, Staff Access detail, low-stock-to-transfer and approved-PO-to-receiving links are all wired to existing operational surfaces.
- Catalog image URL cache is bounded to 250 entries; no second transaction source of truth was introduced.
- Current Vercel status remains deployment-rate-limited; the newest GitHub Actions for the current source line are queued. No certification/build/browser PASS is claimed.


## 28. CORE CLOSURE RUN — 2026-09-25 — FINANCE / PURCHASING / CUSTOMER TRUTH
- Fixed a real finance contract drift: the live canonical record_payment RPC requires a six-argument idempotency-aware call, while the client previously sent five arguments.
- src/services/finance.ts now validates a 16–128 character payment idempotency key and sends p_idempotency_key; FinancePanel.tsx keeps the same key across ambiguous/retry outcomes and rotates it only after a successful command.
- Added supabase/migrations/20260925110000_harden_finance_payment_idempotency.sql: payment command now has bounded numeric validation (including NaN/Infinity rejection), tenant/role checks, invoice/cash-account locking, payload-hash conflict detection, atomic cash movement, audit emission and payment.received outbox emission; anonymous/public execution remains revoked.
- Added supabase/migrations/20260925113000_core_mutation_audit_outbox_contract.sql: invoice creation and purchase-order create/submit/approve commands now persist audit/outbox effects; cash-account/customer/supplier creation has durable audit records; unsafe cash/customer/supplier input ranges are rejected server-side.
- Added supabase/migrations/20260925115000_customer_mutation_audit_contract.sql: customer tier/status mutations now emit audit events.
- Aligned purchasing and inventory-transfer client line/idempotency boundaries with the current server contracts: purchasing/receiving/transfer client builders cap at 100 lines, inventory/purchasing idempotency keys are bounded to 128 characters.
- Added supabase/tests/029-core-command-audit-contract.test.sql; the live database contract check passed 18/18 assertions.
- Added supabase/tests/030-payment-runtime-idempotency.test.sql; the live transaction test passed its 13 planned assertions, covering first payment, partial invoice state, cash movement, audit/outbox, idempotent replay, payload conflict and rejection of NaN.
- Exact core implementation head at the start of documentation write-back: c5eba4a42af2543b4d1cf06180caa1ecb7316c59.
- Current exact-head GitHub workflows for this code line were observed queued: Test-the-Test, security-audit, G1 Domain Proof, application-quality, Concurrency Proof, bootstrap-release-lockfile, Browser E2E / Exact Deployment and Order Workflow Proof.
- Production remains HOLD / NO TOUCH. Certification is NOT CLAIMED until fresh exact-SHA CI/browser/deployment evidence is complete.


## 2026-09-25 — DURABLE UI INTEGRITY / RESOURCE DECISIONS
- Admin deep-link manifest entries are treated as executable navigation contracts: each live target must have a matching DOM anchor in the current workspace. This prevents apparently valid menu links from silently landing at the dashboard.
- Customer voice search is a real browser capability with explicit fallback/error handling; image search is not an executable feature until a canonical visual-search contract exists.
- Customer portal settings validation is performed before persistence: numeric limits are normalized/bounded, payment configuration cannot produce a zero-method enabled state, and the saved-template ceiling is bounded.
- Finance, Purchasing and Inventory reload hooks use stable dependencies so selection defaults do not cause unnecessary network reload loops.
- Dynamic operational labels must derive from actual context (for example the active warehouse name) rather than hardcoded business state.

## 2026-09-25 — DURABLE MIGRATION LINEAGE DECISION
- Supabase live verification found the barcode-aware get_catalog_with_barcode RPC existed with the correct signature and privileges but was absent from migration history. The canonical SQL was applied through Supabase apply_migration under canonicalize_barcode_catalog_rpc_lineage, then re-verified in migration history and pg_proc.
- Migration lineage is part of Commerce correctness: live object existence without repository/live migration provenance is treated as drift.
- Live database snapshot now reports 60/60 public tables with RLS enabled; 0 public SECURITY DEFINER functions executable by anon; 62 executable by authenticated; all inspected public SECURITY DEFINER routines have an explicit empty search_path.
- client_ui_settings UPDATE remains staff-gated; notifications read/update remain tenant/customer/recipient scoped.

## 2026-09-25 — DURABLE CONTROL-PLANE AUTHORIZATION DECISION
- client_ui_settings is an owner/admin control-plane resource, not a generic staff resource. Database RLS now enforces owner/admin for insert/update/delete while authenticated organization members retain scoped read access.
- The Admin panel loading path now keeps default warehouse selection from becoming a reload dependency, avoiding repeated network fetches when the selection is initialized.
- Live barcode catalog migration provenance is now recorded in supabase migration history; live object existence without migration provenance is a correctness defect.


## 2026-09-25 — UI/core closure wave
- Current main source HEAD before documentation write-back: `8c1d817ff67165f4844571f2e9cbb55c5cc3e38a`.
- Customer Portal closure: canonical SKU/barcode resolution for Quick Order and Excel import, bounded bulk input (100 rows / 100000 qty), catalog pagination, warehouse-aware template labels, product detail, order/finance retry states, finance ledger pagination, visible import feedback.
- Admin/governance closure: restored JSX/TypeScript integrity in Admin/Catalog/Staff panels; Audit and Outbox now expose real paginated detail drawers with redaction.
- Core validator closure: Finance/Inventory/Purchasing client idempotency validators standardized at 16..128; boundary tests explicitly cover 128 accepted / 129 rejected.
- Exact verification on `8c1d817ff67165f4844571f2e9cbb55c5cc3e38a`: application-quality PASS (typecheck, 218/218 tests, lint, production build, release audit); Browser E2E / Exact Deployment PASS; Order Workflow PASS; G1 PASS; Security Audit PASS; Bootstrap PASS. Remaining concurrent Test-the-Test, Concurrency, Migration Proof were still running at last observation and must remain unclaimed until completed on an exact SHA.
- Live Supabase: 60/60 public tables have RLS; 0 public SECURITY DEFINER routines executable by anon; 0 public SECURITY DEFINER routines with unpinned search_path. Current live purchase/receipt RPCs still accept idempotency keys up to 200 while client validators use 128; no live records exceed 128. Do not alter production under HOLD; treat server/client bound normalization as an open environment-drift item until a canonical migration is safely applied.
- Vercel hosted exact-source proof remains blocked by current deployment/rate/protection state; production stays HOLD / NO TOUCH.


## 20. FINAL CLOSURE EXECUTION CONTRACT — 2026-09-27

- Execution phase is now final closure/hardening, not open-ended discovery.
- Every session must start from Actual Exact HEAD and current state, then execute only open gaps, regressions, invalidated evidence, environment drift, security defects, missing contracts, or missing reference-backed UI.
- Independent fronts must continue in parallel: UI/visual fidelity, domain/transactions, database/security, QA/browser/test-the-test, deployment/runtime, performance/resource preservation, and semantic documentation consolidation.
- Do not stop an executable front because another front is blocked; record the exact blocker and continue other fronts.

## 21. REFERENCE-BACKED UI CONTRACT — 2026-09-27

- `docs/ui-reference/` is the canonical visual-reference source for Aghbari UI work.
- The current reference pack contains 84 PNG images uploaded to this directory on the main line.
- Reference images are P0 visual requirements by default unless explicitly classified otherwise.
- Reference intent covers composition, hierarchy, RTL alignment, spacing, typography, cards, navigation, tables, status badges, responsive behavior, progressive disclosure and interaction presentation.
- Reference screenshots do not create backend/business contracts. Unsupported legacy/AI/Onyx/Promotions visuals may guide visual language, but must not cause fake transactional functionality to be introduced.
- Aghbari branding remains authoritative; legacy brand names from screenshots must not be copied into the product.

## 22. MAXIMUM SPACE / RESOURCE PRESERVATION CONTRACT — 2026-09-27

- Reuse > refactor > deduplicate > bound > intelligently cache > build only when needed > deploy only when needed.
- Reference images must remain in one source location and must never be copied into `src/`, `public/`, `dist/`, test artifacts or duplicate documentation.
- Generated outputs, coverage, browser reports, build directories, node_modules, temporary dumps and local credentials remain outside version control.
- Prefer existing dependencies, existing components and existing CSS tokens before adding new packages/files.
- Caches, offline queues and retries must remain bounded and observable; no unbounded local growth.
- Do not delete business, financial, audit or security evidence to save space.
- Do not create duplicate CI workflows, redundant builds, repeated deployments or oversized execution logs without a specific proof value.
- Keep write-back records compact; store durable facts, not raw dumps.

## 23. CURRENT REFERENCE / CLOSURE RULE

- Before declaring UI complete, every applicable P0 reference must have a corresponding implemented surface or an explicit scope-boundary classification.
- Visual evidence must bind the reference, route, viewport, state and exact source SHA.
- Closed UI/core work is not reopened unless the no-regression exceptions in the execution protocol are met.


## 24. CANONICAL REQUIREMENT INTAKE — 2026-09-27

- Any new requirement/specification discovered from references, code, tests, runtime, security review or operational evidence must be classified into the canonical specialist document that owns it.
- Product/business requirements belong in `docs/canonical/01-PRODUCT-REQUIREMENTS.md`; UX/UI in `02-UX-UI-CUSTOMER-EXPERIENCE.md`; architecture/data/domain in `03-ARCHITECTURE-DATA-DOMAIN.md`; security/reliability/offline/integrations in `04-SECURITY-RELIABILITY-INTEGRATIONS.md`; quality/certification/release in `05-QUALITY-CERTIFICATION-RELEASE.md`; market/differentiation in `06-MARKET-DIFFERENTIATION-PORTFOLIO.md`.
- Cross-cutting requirements must have one authoritative owner with linked references rather than duplicated full text.
- Adding a requirement to documentation does not close it: it must become implemented/verified/proven or be explicitly classified as boundary/blocked with the exact reason and next executable action.

## 25. DURABLE EXECUTION RULE — PARALLEL CLOSURE + CONTEXT ECONOMY — 2026-09-27

- Final closure is a parallel execution mode, not a 50/50 time split and not a serial queue: open UI and core/security/QA fronts must progress together whenever they are independently executable.
- The 84-image pack under docs/ui-reference/ is a P0 visual input. Every reference must be classified through the canonical asset index into a route/screen/state/viewport pack or an explicit boundary.
- New requirements discovered during reference review, implementation or legacy consolidation must be inserted into the correct canonical specialist document, with source and scope classification, rather than stored in chat or a parallel backlog.
- Communication and repository records must use compact evidence pointers instead of repeated dumps; preserve knowledge, not repetition.
- Resource preservation includes context/message space as well as Git/storage/build/deployment resources.

## 26. DURABLE SESSION CONTINUITY + REFERENCE DEDUP RULE — 2026-09-27

- The 84 UI-reference files are inputs, not 84 separate implementation targets. Exact duplicates and visually equivalent references must be grouped into compact screen packs and implemented once, while preserving aliases/provenance.
- Every execution session must leave a compact resumable checkpoint in `ops/AGHBARI-LATEST-EXECUTION-STATE.md` and a progress record in `ops/AGHBARI-DEVELOPMENT-PROGRESS.md`. A new session must be able to resume from Git + canonical memory + live state without depending on chat history.
- The resume pointer must contain an exact next executable action, relevant files/domain, proof required, blockers, and do-not-repeat boundary.
- Chat history is convenience only; repository state is the durable execution memory.

## 27. DURABLE EXECUTION EFFICIENCY RULES — 2026-09-27

- Execution is read-to-act: start from the live resume pointer, read only the minimum files/ranges needed for the current gap, then implement.
- Closed/proven work is locked unless Regression, Dependency Change, Environment Change, Evidence Invalidation, Security Finding or Requirement Change is documented.
- Two unchanged failures trigger a stop-retry rule: change the root cause or switch fronts.
- Every meaningful closure batch must write a compact exact checkpoint before proceeding.
- A session interruption must never require chat-history reconstruction; Git + canonical memory + live state are the durable resume source.
- The 84 reference files are deduplicated into the smallest correct implementation set while preserving provenance.
- Success is measured by fewer open gaps and more verified closure, not by files read, searches run, commits made or reports generated.


## 28. EXECUTION RUN — a1a001f7ceafb72ebeacb0b1c942dfebe2345a90
- Active implementation HEAD: `a1a001f7ceafb72ebeacb0b1c942dfebe2345a90` on `main`.
- Fixed active customer portal pricing flow so server-returned `authorized_price` is preserved and used when no eligible quantity tier matches.
- Added a domain-level effective catalog price contract and regression tests for tier selection, authorized-price fallback, and invalid-input safety.
- Hardened customer order reordering so detail items are resolved from the current authorized catalog even when they are outside the currently displayed catalog page.
- Exact-SHA proof remains mandatory; no browser/production PASS is inferred from code inspection.


## 29. EXECUTION RUN — 39efd8a7e98d982a643bed43af977b38d5ac679d
- Quick-order idempotency client bound is now canonicalized from 200 to 128 characters.
- Added explicit regression tests: exactly 128 is accepted and 129 is rejected.
- Customer portal price/reorder closure from the preceding implementation remains in effect.
- Exact-SHA evidence rule remains active; no PASS is claimed from source edits alone.


## 30. EXECUTION RUN — cf150ea29f201ca06d7ec6320d59e70b8cb725c9
- Customer catalog display now honors the server-returned authorized price currency for base catalog pricing and product detail.
- Previous customer pricing/reorder hardening and quick-order 128-character idempotency normalization remain active.
- Exact-SHA evidence remains mandatory; this execution state is not certified from source inspection alone.


## 31. EXECUTION RUN — fc20773575e330b03ff83e5cb13ca0b2cb505ef9
- Customer reorder from both order-detail and order-list entry points now resolves current authorized products and submits a single atomic quick-order cart merge.
- Quick-order lookup is explicitly bound to the authenticated account's active warehouse.
- Supabase source migration `20260927003000_normalize_quick_order_idempotency_bound.sql` and test `032-quick-order-idempotency-bound.test.sql` align the server source contract with the client 16..128 bound without mutating production under HOLD.


## 32. EXECUTION RUN — 82cb790c82c0125251008ac2dd915be025613232
- Quick-order quantity validation in the active customer UI now uses `MAX_ORDER_QUANTITY_PER_LINE=10000` and exposes the same bound in the input control.
- Unsupported boundary actions remain excluded from executable UI.
- Production Supabase remains unchanged under HOLD; live `apply_quick_order` still reports the legacy 16..200 server bound until the new migration is deliberately applied during a release window.


## 33. EXECUTION RUN — 9204ed2a5b72c77802bd7e35aa14a6cf0a89be64
- Reorder preflight now accounts for quantities already present in the active cart, skipping only conflicting lines before the single atomic quick-order merge.
- This prevents an existing cart quantity from causing the entire reorder operation to fail while preserving server-authoritative stock enforcement.


## 34. EXECUTION RUN — 3e662eaff0fbb29394160fec20f1dac1a5daed83
- Customer reorder now has an immediate duplicate-click mutex with a safe early warehouse guard and guaranteed unlock in finally.
- This closes a double-submit integrity risk without changing server authority.


## 36. EXECUTION RUN — 44fa5a2b73d7965702cf7d70add5cc515ca3e5e6
- Saved-cart fallback now preserves authorized base price and currency for off-page products.
- Quick-order, Excel, cart and offline quantity ceilings are unified at 10,000 via the central order-domain constant.
- Quick-order server source migration/test remains prepared for 16–128 idempotency keys; live production DB remains 16–200 until approved release migration.


## 37. EXECUTION RUN — pending exact commit
- Fixed authenticated surface routing: a profile with `customer_id` and role `viewer` is now routed to the B2B customer portal, while unbound `viewer` remains an admin/staff viewer.
- Added `src/domain/sessionRoute.ts` plus unit tests to lock the routing contract.


## 38. EXECUTION RUN — pending exact commit
- Closed order-template quantity drift: new writes are capped at 10,000 and legacy oversized templates fail before cart mutation.
- Client validation now uses the central MAX_ORDER_QUANTITY_PER_LINE ceiling.


## 40. EXECUTION RUN — 62fc9c88acb73ac435ff0a18605f402304959b64
- Active main HEAD is now `62fc9c88acb73ac435ff0a18605f402304959b64`.
- Customer offline remote-load guard from the parallel UI/runtime lane is merged into main: remote reads require signed-in + identified customer + online + Supabase availability.
- Added `src/domain/portalRuntime.test.ts` with 5 guard assertions.
- Application security contract suite 034 is present on main.
- Live read-only security contract verification currently passes all 15 conditions corresponding to test 034.
- No production mutation was made; pending DB migrations remain source-only.
