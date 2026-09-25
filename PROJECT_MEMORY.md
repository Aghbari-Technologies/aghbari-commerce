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

Approximately 50% of execution capacity:
**FULL UI/UX CLOSURE**

Approximately 50%:
**CORE / DATABASE / SECURITY / QA / INTEGRATION / PERFORMANCE / RELEASE CLOSURE**

The split is a control rule. Production-critical defects may temporarily override it, but UI cannot be postponed indefinitely while UI gaps remain.

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


## 2026-09-25 — EXECUTE NOW closure wave

- Actual execution branch HEAD after this wave: `598216bcb5afe29c8be4354622eae2a97538370e`.
- Fixed exact-SHA typecheck defects introduced in the nested operational UI wave: customer cart drawer JSX closure, inventory activity conditional output, purchasing queue fragment closure and governance conditional output.
- Fixed Fresh Supabase migration drift: `is_staff_reader()` is now explicitly defined before the privilege-hardening migration, matching live RLS policy usage; later authenticated EXECUTE restoration remains the intended boundary.
- Added movement-level detail disclosure to the inventory movement ledger using the shared `RecordDetailDrawer` and existing tenant-scoped data only.
- Strengthened the RPC privilege regression test with explicit anon/authenticated/PUBLIC assertions for `is_staff_reader()`; test plan raised from 57 to 60.
- Current exact-SHA CI evidence for `598216bcb5afe29c8be4354622eae2a97538370e` remains pending/queued; no PASS is transferred from an older SHA.
- Supabase live security posture observed during this wave: 62 authenticated-executable SECURITY DEFINER advisory findings plus the external leaked-password-protection warning. No blanket revoke was applied because required transactional/RLS helper functions are part of the application boundary and individual classification remains necessary.
- Vercel hosted proof remains blocked by the existing deployment/rate-limit/protection path; production remains NO TOUCH.
