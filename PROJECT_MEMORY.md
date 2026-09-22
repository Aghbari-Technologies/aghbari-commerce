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
## 15. DURABLE IMPLEMENTATION CONTRACTS — 2026-09-23

- `public.notifications` is a server-created, tenant-scoped notification surface. Authenticated customers may read only their own organization/customer or explicitly addressed recipient rows; direct customer writes are denied.
- Customer order-detail UI must read persisted `order_items` directly and resolve product display fields from the already authorized customer catalog rather than depending on fragile PostgREST relation embedding.
- Repeated Arabic navigation labels are valid UI by design; browser automation must scope selectors to a stable landmark/component rather than assuming the accessible name is globally unique.
- Fresh-database migration proof is a release gate: every transactional dependency used by runtime RPCs must exist in the migration chain, not only in the live database.
