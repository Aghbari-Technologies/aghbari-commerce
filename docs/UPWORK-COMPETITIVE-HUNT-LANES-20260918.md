# الأغبري | Upwork Competitive Hunt Lanes — 2026-09-18

> هذا المستند يحدد نطاق القنص التجاري. لا نبحث عن كل وظائف Upwork؛ نركز على ستة مسارات ضيقة نستطيع فيها تقديم دليل حقيقي من الأغبري.

## 0. Operating decision
**Default market coverage = six lanes only.**
A job outside these lanes is WATCH/SKIP by default unless it creates a clearly stronger evidence-to-problem fit and passes an explicit exception check.

The unit of competition is:
**CLIENT PAIN → RELEVANT AGHBARI WORKFLOW → PROOF → DIFFERENTIATOR → BOUNDED MILESTONE**

## 1. Lane 1 — Supabase Multi-Tenant Security / RLS
**Target:** Supabase/Postgres RLS audits, multi-tenant leakage, RBAC/privilege review, SECURITY DEFINER hardening, authentication/authorization failures, security/performance architecture.
**Why Aghbari:** tenant isolation, RLS, RBAC, exact-SHA security evidence, adversarial testing.
**Proof:** RLS architecture; anonymous/authenticated denial; cross-tenant isolation; direct RPC denial; security gates; Test-the-Test.
**Win message:** Trace request → authorization → RLS → database result and prove the forbidden path remains forbidden.
**Entry:** security proof + tenant-isolation proof + sanitized case study.
**Skip:** unsupported compliance claims or no relevant evidence.

## 2. Lane 2 — B2B Commerce / Order & Inventory Operations
**Target:** B2B commerce, wholesale portals, order management, customer/supplier operations, catalog/pricing, inventory, warehouse/branch, reorder.
**Why Aghbari:** the product already models catalog, pricing, customers, suppliers, inventory, orders, templates and Excel ordering.
**Proof:** first order, reorder/template, catalog→price→cart→order, inventory invariants, branch/warehouse boundaries, Excel quick order.
**Win message:** Optimize the repeat wholesale workflow, not just the storefront.
**Entry:** one complete B2B workflow + data/security proof + browser evidence.
**Skip:** consumer storefront-only work with no operational depth.

## 3. Lane 3 — Arabic/RTL B2B SaaS
**Target:** Arabic SaaS, Arabic CRM/ERP-lite, merchant/customer portals, RTL/LTR dual-language products, MENA operational SaaS.
**Why Aghbari:** Arabic/RTL is treated as first-class UX and workflow design.
**Proof:** Arabic customer portal, Arabic admin workflows, RTL forms/tables/dialogs, responsive behavior, localized business terminology.
**Win message:** Arabic is the primary operating surface, not a translation patch.
**Entry:** sanitized Arabic demo + complete RTL workflow evidence.
**Skip:** design-only work where our backend/operations proof cannot help.

## 4. Lane 4 — Next.js/Supabase Production Rescue / Takeover
**Target:** existing-app hardening, production bug fixing, security/permission repair, regression prevention, AI-generated codebase takeover, testing and deployment debugging.
**Why Aghbari:** the engineering method is root-cause first, preserve-before-rewrite, exact-head proof, Test-the-Test and adversarial verification.
**Proof:** root-cause→minimal fix→regression; exact-SHA evidence; browser/E2E; security hardening; deployment investigation.
**Win message:** Prove the failure, repair the smallest correct boundary, and regression-test it.
**Entry:** one takeover/hardening case study with before/after and adversarial evidence.
**Skip:** rewrite-first jobs or jobs that cannot provide a safe test path.

## 5. Lane 5 — Data Migration / Excel / Legacy-to-SaaS Onboarding
**Target:** Excel automation/import, legacy migration, onboarding cleanup, validation/quarantine, mapping/reconciliation, Onyx/legacy boundaries.
**Why Aghbari:** upload → quarantine → parse → normalize/match → validate → preview → explicit commit → audit/reconciliation.
**Proof:** unmatched-row handling, server-side validation, atomic commit, provenance, audit/reconciliation.
**Win message:** Migration is a controlled transaction, not a spreadsheet upload.
**Entry:** one sanitized migration workflow with failure/recovery evidence.
**Skip:** destructive migration without reconciliation/rollback or direct production writes bypassing validation.

## 6. Lane 6 — Integration Reliability / Webhooks / Outbox / Recovery
**Target:** webhook reliability, API integrations, background jobs, retry systems, idempotency, outbox, delivery failures, synchronization and reconciliation.
**Why Aghbari:** integration lifecycle is modeled as transaction → durable outbox → worker → adapter → provider → delivery record → retry/backoff → terminal failure.
**Proof:** replay prevention, outbox durability, retry/backoff, terminal failure, audit/correlation, failure-injection tests.
**Win message:** An API call is not a delivered integration; prove the whole lifecycle.
**Entry:** one integration case study with failure injection and idempotency evidence.
**Skip:** connector-only jobs with no meaningful reliability scope or no safe sandbox.

## 7. Hard gates
| Dimension | Requirement |
|---|---|
| Problem Fit | direct overlap with lane |
| Proof Fit | real relevant artifact |
| Differentiator | one specific reason Aghbari is relevant |
| Scope | bounded first milestone |
| Client Signal | activity/history checked when visible |
| Economics | effort and Connects acceptable |
| Claim Safety | every claim supportable honestly |

Classification:
- PURSUE = critical gates pass.
- WATCH = promising but a proof gap remains.
- SKIP = critical fit/proof/claim gate fails.

## 8. Proposal proof hierarchy
Use strongest available evidence first: production runtime → deployed browser → exact-SHA E2E → security/adversarial → architecture/schema/migration → visual evidence.

Never describe lower-level evidence as production proof.

## 9. Lane portfolio map
| Lane | Primary case study |
|---|---|
| 1 Security/RLS | Multi-tenant/RLS security |
| 2 B2B Commerce | Order + inventory OS |
| 3 Arabic/RTL | Arabic B2B portal |
| 4 Production Rescue | Existing-app hardening |
| 5 Migration | Excel/data onboarding |
| 6 Reliability | Outbox/retry/idempotency |

## 10. Search families
- Supabase + RLS + multi-tenant + security
- Supabase + tenant isolation
- B2B SaaS + Supabase + orders/inventory
- Arabic SaaS + RTL + Supabase
- Next.js + Supabase + production + fix
- Next.js + Supabase + test + harden
- Excel + Supabase + migration
- legacy migration + PostgreSQL + SaaS
- webhook + idempotency + SaaS
- outbox + retry + Supabase

## 11. Leadership rule
Default commercial coverage is these six lanes. A job outside them requires stronger problem/proof fit than the active lanes.

Market demand can create a backlog item only through:
**market signal → product-fit gap → controlled backlog → implementation → exact evidence → portfolio artifact → targeted proposal**

These lanes are strategy, not evidence of implementation, demand volume, hiring probability, or income.