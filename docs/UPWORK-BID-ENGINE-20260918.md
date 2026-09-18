# الأغبري | Upwork Bid Engine — 2026-09-18

> **الهدف:** تحويل الأغبري من مشروع تقني إلى أصل Portfolio وخبرة قابلة للبيع، ثم إدارة فرص Upwork كعملية هندسية/تجارية قائمة على الأدلة.

هذه الوثيقة طبقة فوق:
- `UPWORK-MARKET-REQUIREMENTS-20260918.md` = ماذا يطلب السوق.
- `COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md` = كيف نتميز فعليًا.
- هذه الوثيقة = كيف نستهدف الوظيفة ونقدم الدليل المناسب.

## 1. Core operating model

لا نتقدم لكل وظيفة تشبه الـstack.

العملية:
`DISCOVER → SCREEN → FIT-MAP → PROOF-MAP → DIFFERENTIATOR-MAP → COMMERCIAL CHECK → PROPOSAL → FOLLOW-UP → INTERVIEW PREP → CONTRACT REVIEW → DELIVERY → REVIEW/PORTFOLIO UPDATE`

القاعدة:
**High technical similarity without relevant proof = weak application.**
**Strong proof without job-specific relevance = weak application.**
**Feature-count competition is not the strategy.**
**Best application = exact client problem + relevant Aghbari proof + meaningful differentiator + bounded implementation path + measurable first milestone.**

## 2. Job intake record

لكل وظيفة مستهدفة نسجل:
- Job URL
- Job ID / title
- Posted age
- Budget / hourly range
- Proposals / interviews / hires when visible
- Client history/spend/reviews when visible
- Mandatory skills
- Exact pain point
- Deliverables
- Required integrations
- Production/runtime expectations
- Security/RLS/tenant requirements
- Arabic/RTL requirements
- Relevant Aghbari modules
- Evidence artifacts available
- Missing proof
- Strongest differentiator for this specific job
- Scope estimate
- Risks/red flags
- Connects required
- Boost eligibility/cost if shown
- Proposal angle
- Portfolio item to attach
- Decision: `PURSUE | WATCH | SKIP`
- Reason and timestamp

No application is sent from a vague job summary.

## 3. Fit gates

A job moves to `PURSUE` only when:
### Gate A — Problem fit
The client problem overlaps a proven Aghbari capability or a tightly bounded extension.
### Gate B — Proof fit
We can point to concrete evidence, not generic claims.
### Gate C — Stack fit
The requested stack is already supported or can be handled without destabilizing Aghbari.
### Gate D — Scope fit
The work can be decomposed into milestones with explicit acceptance criteria.
### Gate E — Client/activity fit
Client history, current activity, interview state, proposal volume, and hiring history are checked when available.
### Gate F — Economics
Opportunity is consistent with effort, Connects, and commercial objective.
### Gate G — Differentiation
We can explain in one sentence what we do better/differently for this particular problem.
### Gate H — Honest claimability
Every claim in the proposal can be backed by a real Aghbari artifact, evidence, or clearly stated bounded capability.

A job failing a critical gate is not pursued merely because the budget is attractive.

## 4. Competitive positioning engine

Before drafting a proposal, classify the opportunity into:
- **Proof-led:** client is worried about correctness/security.
- **Speed-led:** client needs a fast production milestone.
- **Takeover-led:** existing/AI-generated code is broken or inconsistent.
- **Domain-led:** B2B commerce/CRM/inventory/order operations.
- **Localization-led:** Arabic/RTL and regional workflows.
- **Integration-led:** webhooks/outbox/retry/idempotency.
- **Migration-led:** Excel/legacy/Onyx/system transition.
- **Reliability-led:** concurrency/recovery/observability.

Then select **one primary differentiator** and at most two supporting ones.

Do not dump every feature into the proposal.

## 5. Application archetypes

### A. Supabase/RLS Security
Lead with tenant isolation, RLS, RBAC, negative-path testing, exact proof, root-cause analysis.

Evidence chain:
`schema → RLS → auth → forbidden request → observed denial → regression`

### B. B2B SaaS Build
Lead with operational domain model, tenant-aware data, customer/admin flows, transactional workflows, milestone delivery, production hardening.

Evidence chain:
`catalog/customers/orders/inventory → persistence → E2E → deployment proof`

### C. E-commerce Operations
Lead with catalog, pricing, cart, order lifecycle, inventory, Excel quick order, customer portal.

Avoid presenting Aghbari as a generic storefront.

### D. Production Hardening / Takeover
Lead with reproduce → root cause → minimal repair → test-the-test → adversarial regression → exact deployment/runtime proof.

### E. Arabic/RTL SaaS
Lead with Arabic-first UX, RTL layout, responsive admin/customer workflows, localized business rules, production verification.

### F. Integration / Automation
Lead with typed contracts, webhook validation, outbox, retry/backoff, idempotency, delivery state, audit.

### G. Migration / Legacy Recovery
Lead with safe import, quarantine, validation, preview, mapping, reconciliation, and rollback-safe commit.

## 6. Proposal construction

Default structure:
1. Problem recognition.
2. One relevant Aghbari proof asset.
3. One differentiator specific to the client problem.
4. Short execution/verification path.
5. Risk control.
6. Bounded first milestone.
7. One high-information question only when necessary.

Avoid:
- generic autobiography;
- giant technology lists;
- unsupported years-of-experience claims;
- copied cover letters;
- promising completion before inspection;
- claiming production experience without evidence;
- unrelated Aghbari features.

## 7. Portfolio proof architecture

The portfolio is organized around evidence-backed case studies:
| Case study | Proof asset |
|---|---|
| Multi-tenant B2B Commerce | tenant isolation + RLS + RBAC + customer/admin flow |
| Inventory & Orders | transaction + concurrency + no-oversell + state machine |
| Excel Quick Order | parse → quarantine → validate → preview → commit |
| Supabase Security | auth/RLS/RBAC negative-path evidence |
| Arabic RTL Commerce | responsive customer/admin experience |
| Production Hardening | exact-SHA tests + artifact + deployment/runtime evidence |
| Integrations | outbox/retry/idempotency/audit |
| Data Operations | import/export provenance + reconciliation |
| Trust Layer | explainable operational state + audit trail |
| Offline/Low Bandwidth | bounded offline + reconnect/revalidation evidence |

Every case study distinguishes:
`IMPLEMENTED / TESTED / VERIFIED / PROVEN / PRODUCTION CERTIFIED`

## 8. Demo strategy

The Aghbari demo must be a **sales instrument**, not a random deployment:
- sanitized realistic data;
- preconfigured demo tenant;
- clear customer journey;
- clear admin journey;
- resettable state;
- no secrets or PII;
- visible proof cards for the capabilities being demonstrated;
- mobile + desktop;
- degraded-network behavior where relevant.

A demo claim must never exceed the exact environment it demonstrates.

## 9. Connects discipline

Upwork states that Connects are used to submit proposals and that required Connects can change with project size, scope, and market demand. Upwork also advises reviewing client/job activity before spending Connects.

Operational rule:
- Spend Connects after fit/proof/differentiation gates.
- Do not use volume bidding as the default.
- Record Connects consumed and funnel result.
- Treat boosting as visibility only.
- Never spend on a post whose requirements cannot be supported honestly.

## 10. Dynamic profile strategy

As of May 28, 2026, Upwork says Specialized Profiles are no longer available and the main profile dynamically highlights relevant work and skills.

Therefore:
- one evidence-rich primary profile;
- market vocabulary in portfolio metadata;
- proposal-specific proof selection;
- no obsolete specialized-profile copies.

## 11. Funnel metrics

Track:
`DISCOVERED → SCREENED → PURSUE → PROPOSED → VIEWED → INTERVIEW → OFFER → CONTRACT → MILESTONE → REVIEW`

For each stage capture:
- category;
- budget band;
- differentiator used;
- proof asset used;
- result;
- reason for rejection/loss when known;
- Connects consumed.

Do not fabricate conversion claims.

## 12. Continuous learning loop

After every 10–20 serious applications review:
- categories generating views;
- categories generating interviews;
- proof assets referenced;
- differentiators used;
- budgets converting;
- client patterns producing waste;
- Aghbari capabilities repeatedly requested.

Then update:
`market → proof gaps → portfolio → backlog (only when product-fit) → proposals`

## 13. Portfolio gap rule

A missing proof artifact is a **proof gap**, not automatically a product feature.

Example:
A client requests Stripe webhook experience. If Stripe is not required by Aghbari:
- create isolated/reusable proof only when commercially justified;
- do not inject a provider into a frozen certification candidate merely to mirror one job.

## 14. Owner-level commercial execution

Within actual tool/account permissions, the delegated operator may:
- discover jobs;
- screen and cluster jobs;
- map requirements to evidence;
- select differentiators;
- identify proof gaps;
- prepare tailored proposals;
- prepare interview technical answers;
- prepare milestone scopes;
- track funnel performance;
- update market/portfolio strategy.

External account commitments remain bounded by actual authorized Upwork capabilities.

Never fabricate identity, work history, client results, production claims, or guarantees.

## 15. Competitive moat usage

Use the moat library from `COMPETITIVE-MOAT-AND-PORTFOLIO-20260918.md` as the source for job-specific differentiators.

Priority differentiators:
1. **Evidence-First / Trust Layer** for security and correctness jobs.
2. **Fast B2B Order OS** for commerce/order-management jobs.
3. **Arabic/RTL First** for Arabic SaaS jobs.
4. **Migration Bridge** for legacy/Excel/Onyx/data jobs.
5. **Integration Reliability** for webhook/automation jobs.
6. **Takeover-Ready Codebase** for broken/AI-generated SaaS jobs.
7. **Low-Bandwidth/Offline discipline** for field/distributed environments.
8. **Operations Command Center** for admin/operations systems.

One job → one primary moat → one proof → one measurable milestone.

## 16. Strategic rule: beat specialists with evidence, not with claims

When a job attracts deep specialists:
- narrow the proposal to the client's failure mode;
- expose the relevant evidence;
- show the smallest safe first milestone;
- make the verification method explicit;
- avoid claiming superiority without measurable evidence.

The objective is not to look bigger than the specialist. It is to make the client's risk smaller.

## 17. Current commercial positioning

Primary capability family:
**Production-grade Arabic B2B SaaS / Commerce Systems**

Core proof vocabulary:
`React/TypeScript + Supabase/PostgreSQL + Auth/RLS + Multi-Tenant + RBAC + Catalog + Pricing + Inventory + Orders + Excel + API/Webhooks + Outbox/Retry + E2E + Production Hardening + Arabic/RTL`

Secondary sellable capabilities:
- Supabase/RLS security review
- Multi-tenant architecture repair
- SaaS production hardening
- B2B order/inventory systems
- Arabic RTL business applications
- Excel/data import pipelines
- Integration/webhook reliability
- Legacy/AI-generated code takeover

## 18. Non-negotiable truth rule

The commercial system must never make the profile stronger than the evidence.

**No proof → no claim.**
**No relevant artifact → no specific experience claim.**
**No contract → no promise of outcome.**
**No hiring guarantee.**
