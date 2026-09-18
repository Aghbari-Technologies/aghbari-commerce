# الأغبري | Upwork Bid Engine — 2026-09-18

> **الهدف:** تحويل الأغبري من مشروع تقني إلى أصل Portfolio وخبرة قابلة للبيع، ثم إدارة فرص Upwork كعملية هندسية/تجارية قائمة على الأدلة.
>
> هذه الوثيقة طبقة فوق `UPWORK-MARKET-REQUIREMENTS-20260918.md`. الأولى تصف ما يطلبه السوق؛ هذه الوثيقة تحدد **كيف نستهدف الوظيفة ونقدّم الأغبري لها**.

## 1. Core operating model

لا نتقدم لكل وظيفة تشبه الـstack.

العملية:

`DISCOVER → SCREEN → FIT-MAP → PROOF-MAP → COMMERCIAL CHECK → PROPOSAL → FOLLOW-UP → INTERVIEW PREP → CONTRACT REVIEW → DELIVERY → REVIEW/PORTFOLIO UPDATE`

القاعدة:

**High technical similarity without relevant proof = weak application.**

**Strong proof without job-specific relevance = weak application.**

**Best application = exact client problem + one relevant proof artifact + one credible implementation path + bounded scope.**

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
The client problem overlaps a proven Aghbari capability or a tightly bounded extension of it.

### Gate B — Proof fit
We can point to concrete evidence, not generic claims:
- exact implementation area;
- architecture decision;
- migration/RLS proof;
- E2E proof;
- runtime/deployment evidence when available;
- screenshot/video or sanitized demo when safe.

### Gate C — Stack fit
The requested stack is already supported or can be handled without destabilizing Aghbari.

### Gate D — Scope fit
The work can be decomposed into milestones with explicit acceptance criteria.

### Gate E — Client/activity fit
Client history, current activity, interview state, proposal volume, and hiring history are checked when available.

### Gate F — Economics
The opportunity is consistent with available time, expected effort, Connects cost, and commercial objective.

A job failing a critical gate is not pursued merely because the budget is attractive.

## 4. Application archetypes

### A. Supabase/RLS Security
Lead with:
- tenant isolation;
- RLS;
- RBAC;
- negative-path testing;
- exact proof;
- root-cause analysis.

Evidence chain:
`schema → RLS → auth → forbidden request → observed denial → regression`

### B. B2B SaaS Build
Lead with:
- operational domain model;
- tenant-aware data;
- customer/admin flows;
- transactional workflows;
- milestone delivery;
- production hardening.

Evidence chain:
`catalog/customers/orders/inventory → persistence → E2E → deployment proof`

### C. E-commerce Operations
Lead with:
- catalog;
- pricing;
- cart;
- order lifecycle;
- inventory;
- Excel quick order;
- customer portal.

Avoid presenting Aghbari as a generic storefront.

### D. Production Hardening / Takeover
Lead with:
- reproduce;
- identify root cause;
- repair minimally;
- test the test;
- adversarial regression;
- exact deployment/runtime proof.

### E. Arabic/RTL SaaS
Lead with:
- Arabic-first UX;
- RTL layout;
- responsive admin/customer workflows;
- localized business rules;
- production verification.

### F. Integration / Automation
Lead with:
- typed contracts;
- webhook validation;
- outbox;
- retry/backoff;
- idempotency;
- delivery state;
- audit.

## 5. Proposal construction

Default structure:

1. **Problem recognition:** one or two sentences showing the exact failure/outcome requested.
2. **Relevant proof:** one or two concrete Aghbari capabilities that solve it.
3. **Execution path:** short sequence of how the work would be verified.
4. **Risk control:** mention the relevant security/data/reliability concern.
5. **Deliverable:** bounded first milestone with explicit acceptance.
6. **Question:** one high-information question only when necessary.

Avoid:
- generic autobiography;
- giant technology lists;
- unsupported years-of-experience claims;
- copied cover letters;
- promising completion before inspecting the code;
- claiming production experience without evidence;
- mentioning unrelated Aghbari features.

## 6. Portfolio proof architecture

The Aghbari portfolio should be decomposed into proof-oriented case studies:

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

Every case study must distinguish:
`IMPLEMENTED / TESTED / VERIFIED / PROVEN / PRODUCTION CERTIFIED`

Never call a case study production-ready when its required production proof is missing.

## 7. Connects discipline

Upwork states that Connects are used to submit proposals and that required Connects can vary with project size, scope, and market demand. Upwork also recommends checking client history, whether a client has hired, and current proposal/interview activity before spending Connects.

Operational rule:

- Spend Connects on jobs that clear the fit/proof gates.
- Do not use volume bidding as the default strategy.
- Record Connects consumed and the resulting funnel stage.
- Treat boosting as an optional visibility mechanism, not as evidence of fit.
- Do not spend Connects on a post whose requirements cannot be supported honestly.

## 8. Dynamic profile strategy

Upwork deprecated Specialized Profiles on May 28, 2026. The main profile now dynamically highlights relevant work, skills, history, and portfolio items for a job.

Therefore:

- The primary profile must contain the full Aghbari capability surface.
- Portfolio titles and descriptions must contain exact market vocabulary.
- Proposals must point to the most relevant proof asset.
- We do not maintain obsolete specialized-profile copies.

## 9. Funnel metrics

Track:

`DISCOVERED → SCREENED → PURSUE → PROPOSED → VIEWED → INTERVIEW → OFFER → CONTRACT → MILESTONE → REVIEW`

For each stage capture:
- count;
- date window;
- job type;
- technical category;
- budget band;
- proposal angle;
- result;
- reason for rejection/loss when known.

The goal is not to fabricate a success rate. The goal is to learn which evidence, offer shape, niche, and client type produce actual interviews/contracts over time.

## 10. Continuous learning loop

After every 10–20 serious applications, review:

- which job categories generated views;
- which generated interviews;
- which proof assets were referenced;
- which opening sentences were used;
- which budgets converted to interviews/contracts;
- which client patterns produced waste;
- which Aghbari capabilities repeatedly appeared in requests.

Then update:
`market requirements → portfolio assets → proof gaps → product backlog (only when product-fit) → proposal patterns`

## 11. Portfolio gap rule

A missing proof artifact is a **proof gap**, not automatically a product feature.

Example:
- A client asks for Stripe webhook experience.
- Aghbari does not yet require Stripe for its operational scope.
- We should first create a reusable integration case study or isolated reference implementation if commercially justified.
- We must not inject a payment provider into the certification candidate simply to satisfy one job post.

## 12. Owner-level execution model

When the owner delegates Upwork leadership to the programmer/agent, the agent may autonomously:

- search and collect jobs;
- filter by fit;
- map requirements to Aghbari evidence;
- identify missing proof;
- prepare tailored proposal drafts;
- prepare interview technical answers;
- prepare milestone scopes;
- track outcomes;
- update the market baseline and portfolio backlog.

Account-level actions that create external commitments or spend Connects must remain bounded by the actual connected Upwork capability and account permissions.

An application should never be sent using fabricated identity, fabricated work history, fabricated client results, or fabricated production claims.

## 13. Current Aghbari commercial positioning

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

## 14. Non-negotiable truth rule

The Upwork system must never make the commercial profile stronger than the actual product evidence.

**No proof → no claim.**

**No relevant artifact → no specific experience claim.**

**No contract → no promise of outcome.**

**No hiring guarantee.**

