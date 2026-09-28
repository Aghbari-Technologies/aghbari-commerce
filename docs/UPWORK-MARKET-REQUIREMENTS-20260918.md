# الأغبري | Upwork Market Requirements Baseline — 2026-09-18

> تحويل إشارات الطلب الفعلية في Upwork إلى متطلبات قبول/جاهزية قابلة للتنفيذ لمشروع الأغبري Commerce.
>
> **النطاق:** هذه الوثيقة لا تُدخل ميزات خارج المنتج تلقائيًا. المتطلبات المتطابقة مع نطاق الأغبري تصبح أساسًا للجاهزية؛ المتطلبات الأخرى تُحفظ كإشارات سوقية فقط.

## 1. Executive finding

العينة الحالية تُظهر طلبًا متكررًا على:
- React / Next.js / TypeScript
- Supabase / PostgreSQL / Auth / RLS
- Multi-tenant isolation + RBAC
- Admin / operations portals
- Customers / suppliers / orders / inventory / catalog
- APIs / webhooks / integrations / background jobs
- Production hardening / testing / CI/CD / observability
- Arabic / RTL
- Excel / PDF / import / export
- PWA / offline / recovery
- Payments and subscription boundaries
- AI/LLM and WhatsApp integrations
- Safe maintenance of existing/AI-generated code

## 2. Verified Upwork sample

| # | الوظيفة | الظهور | التسعير الظاهر | النشاط الظاهر | إشارات التقاطع مع الأغبري |
|---|---|---|---|---|---|
| 1 | Backend developer for multi-tenant SaaS dashboard | 2026-09 | بالساعة، <30h/week، 1–3 أشهر | — | Multi-tenant، Supabase/Postgres/RLS، OAuth، scheduled sync |
| 2 | Full-Stack Developer to Build MVP for B2B SaaS | 2026-08-18 | $1,000 ثابت | 50+ proposals، 2 interviews، 1 hire | React/Vite/Tailwind، Supabase/Postgres، RLS، customers/vendors، payments، templates |
| 3 | Full-Stack Developer — Multi-Tenant SaaS MVP | 2026-07 | غير ظاهر | — | Next.js، Vercel، Supabase Auth، OAuth، tenant RLS/RBAC، ETL boundary |
| 4 | Need Senior SaaS MVP developer for long term | 2026-09 | $35–$47/ساعة | 50+ proposals، 5 interviews | Next.js/React، Supabase/Postgres، APIs، billing، admin، CI/CD، production ownership |
| 5 | CRM Development | 2026-09-18 | $30–$55/ساعة | 50+ proposals | CRM/business management، React/Next/TS، Supabase/Postgres/RLS، integrations، multi-company |
| 6 | Independent Code Review — HIPAA-track SaaS | 2026-08 | $400 ثابت | 20–50 proposals، 4 interviews | RLS audit، tenant isolation، auth، secrets، dependency hygiene |
| 7 | Automated Reports & Alerts Engine for Arabic E-commerce SaaS | 2026-08 | $200 ثابت | 20–50 proposals، 1 hire | Arabic/RTL، outbox/retry، audit، inventory alerts، production proof |
| 8 | Build Custom CRM with Lovable, Supabase & API Integrations | 2026-09 | غير ظاهر | — | Multi-tenant CRM، portal، RLS، APIs، webhooks، production deployment |
| 9 | Full-Stack Engineer — FinTech/GovTech Intake Workflow | 2026-09-08 | $10,000 ثابت | — | Next.js/Vercel، Supabase/RLS، white-labeling، document processing، deterministic tests |
| 10 | Next.js eCommerce Developer Needed | 2026-09-08 | $10 ثابت | 20–50 proposals، 1 hire | Next.js/TS، Supabase، Stripe، products، cart، checkout، auth |
| 11 | Need a Claude Code developer to build software | 2026-09 | $15–$40/ساعة | 50+ proposals، 10 interviews | production multi-tenant SaaS، Supabase/Vercel، RLS، PDF، REST، PWA/offline |
| 12 | Full-Stack Developer for Arabic SaaS Platform | 2026-09 | $15–$35/ساعة | 20–50 proposals | Arabic/RTL، Next.js/React، Supabase/Postgres، OpenAI، security، performance |
| 13 | Senior Supabase & RLS Specialist — SaaS Security Audit | 2026-08/09 | بالساعة | 20–50 proposals، 6 interviews | tenant RLS، RBAC، financial-data isolation، security/performance audit |
| 14 | Full-Stack Developer for Health Platform | 2026-07 | بالساعة | 50+ proposals | role-based dashboards، catalog/inventory، Supabase/RLS، WhatsApp، webhooks، Vercel |
| 15 | DataBase Administrator | 2026-09-15 | $3,000 ثابت | — | PostgreSQL، tenant isolation، RLS، constraints/indexes، migrations، audit، outbox |
| 16 | PostgreSQL Database Designer / Architect | 2026-09 | بالساعة | 5–10 proposals، 2 interviews | normalization، constraints، indexes، transactions/concurrency، RLS، privileges |
| 17 | Shopify public app developer — Next.js/Supabase | 2026-09 | غير ظاهر | — | Next.js/React، Supabase/Postgres/RLS، Vercel، queue، OAuth، webhooks، concurrency |
| 18 | Build a Lightweight Order Management System | 2026-08/09 | غير ظاهر | — | order state machine، quotes/invoices/payments، suppliers، files، activity history |
| 19 | Next.js + Supabase Developer — Wire Existing Frontend Forms | 2026-08-24 | $200 ثابت | 15–20 proposals، 12 interviews، 1 hire | B2B portal، Admin/Client sync، RLS، payments/email، live verification |
| 20 | Next.js + Supabase Developer — Admin Panel Bug Fixes | 2026-09 | غير ظاهر | — | product variants، cart، Supabase data ops، admin، debugging |
| 21 | Full-Stack Engineer — Operations Portal | 2026-09 | غير ظاهر | — | secure multi-tenant، RBAC، financial ledger، workflow automation، webhooks |
| 22 | Build an AI-Powered Café Operations System | 2026-09-15 | $8,000 ثابت | 50+ proposals | sales، inventory، purchasing، suppliers، automation، PostgreSQL/Supabase، AI assistant |
| 23 | Senior Full-Stack Developer — AI WhatsApp SaaS audit/productionize | 2026-09 | $30–$55/ساعة | 50+ proposals، 2 interviews | Next.js، Supabase، WhatsApp/Meta webhooks، OpenAI، production audit |
| 24 | Senior Full-Stack Developer — Insurance CRM SaaS | 2026-09 | $20,000 ثابت | — | React/TS، Supabase/Postgres، multi-tenant، RBAC، Stripe subscriptions، OAuth |

## 3. Consolidated market requirement matrix

| ID | Market-derived requirement | علاقة الأغبري | معيار القبول | تصنيف |
|---|---|---|---|---|
| MKT-01 | Multi-tenant architecture | أساسي | tenant isolation على التطبيق + DB/RLS + negative tests | CORE |
| MKT-02 | RBAC + least privilege | أساسي | enforcement server/DB + forbidden-path proof | CORE |
| MKT-03 | Supabase/Postgres/Auth/RLS | أساسي | schema/migrations/auth/RLS على exact HEAD | CORE |
| MKT-04 | Catalog + products + pricing | أساسي | SKU/barcode/unit/category + server-authoritative price | CORE |
| MKT-05 | Customers + suppliers | أساسي | lifecycle + tenant scope + audit | CORE |
| MKT-06 | Orders + state machine | أساسي | transaction + idempotency + audit + conflict handling | CORE |
| MKT-07 | Inventory + warehouse/branch | أساسي | server truth + no oversell + concurrency proof | CORE |
| MKT-08 | Admin / operations command center | أساسي | workflows + filters + bulk actions + exception states | CORE |
| MKT-09 | Customer portal | أساسي | catalog → cart → order → tracking → ledger | CORE |
| MKT-10 | Search / filters / bulk actions | أساسي | name/SKU/barcode/category/brand + scoped bulk ops | CORE |
| MKT-11 | Excel import / quick orders | أساسي | quarantine → parse → validate → preview → commit → evidence | CORE |
| MKT-12 | PDF / document generation | أساسي جزئي | statements/documents authorized + provenance | CORE |
| MKT-13 | API / webhook integrations | أساسي | contracts + auth + idempotency + retry + failure visibility | CORE |
| MKT-14 | Background jobs / outbox | أساسي للموثوقية | durable outbox + retry/backoff + terminal failure + duplicate prevention | CORE-RELIABILITY |
| MKT-15 | Production hardening | أساسي | deployment + artifact + smoke + runtime logs + recovery | RELEASE |
| MKT-16 | Automated testing / E2E | أساسي | unit/integration + adversarial + browser + exact-SHA evidence | RELEASE |
| MKT-17 | Observability | أساسي | actionable errors/logs/telemetry and evidence | RELEASE |
| MKT-18 | Arabic / RTL | مباشر للسوق المستهدف | RTL-first responsive UX | CORE-UX |
| MKT-19 | PWA / bounded offline | ملائم | cache/draft/queue/reconnect with revalidation | CORE-OPTIONAL-BY-FLOW |
| MKT-20 | Payments boundary | ملائم تجاريًا | provider adapter + verified webhooks + idempotency | PRODUCT-BOUNDARY |
| MKT-21 | SaaS plans/subscriptions | ملائم لتسويق المنتج كـSaaS | tenant plan state + limits, isolated from operational truth | P1-COMMERCIAL |
| MKT-22 | White-label/theme controls | ملائم | persisted tenant/client branding controls | P1-PRODUCT |
| MKT-23 | WhatsApp/messaging | ملائم | adapter + template policy + delivery state + retry | P1-INTEGRATION |
| MKT-24 | AI-ready boundary | إشارة سوقية | integration boundary only; BI/Decision stays in Report-Advisor | P2-OPTIONAL |
| MKT-25 | Safe takeover of existing/AI-generated code | ملائم للسوق | preserve-first + small PRs + regression | ENGINEERING |
| MKT-26 | Database architecture/performance | أساسي | indexes/constraints/query/RLS evidence | CORE |
| MKT-27 | Import/export provenance | أساسي | source/version/actor/tenant/correlation/audit/reconciliation | CORE |
| MKT-28 | Security review package | قابل للبيع | reproducible auth/RLS/tenant/secret/dependency audit evidence | P2-COMMERCIAL |

## 4. What becomes part of the Aghbari baseline

The following are now the **market-aligned acceptance dimensions** for the product, subject to exact-SHA evidence:

1. Operational B2B commerce: catalog, pricing, customers, suppliers, orders, inventory, branches/warehouses.
2. Secure SaaS foundation: auth, tenant isolation, RLS, RBAC, least privilege.
3. Customer + admin portals with responsive Arabic RTL UX.
4. Excel/import/export/document flows with quarantine, validation and provenance.
5. Transactional reliability: idempotency, concurrency, outbox/retry, auditability.
6. API/webhook integration architecture and production observability.
7. Production-grade tests, browser E2E and exact-head evidence.
8. SaaS commercial controls and selected integrations remain P1 unless already required by the current product scope.

## 5. Explicit exclusions

Do not add the following automatically:
- domain-specific healthcare/regulatory features;
- Shopify public-app-specific extensions;
- BI, forecasting or Decision Intelligence inside Aghbari;
- any paid provider without an explicit adoption decision;
- broad rewrites merely to match another client's technology stack.

## 6. Commercial packaging signal

| Package | Sellable capability | Evidence required |
|---|---|---|
| B2B SaaS Build | secure multi-tenant business SaaS | MKT-01..09 + MKT-15..17 |
| E-commerce Operations | catalog/pricing/cart/orders/inventory | MKT-04..12 |
| Supabase Security Audit | RLS/RBAC/tenant isolation review | MKT-01..03 + MKT-17 + MKT-28 |
| Production Hardening | audit → repair → test → deploy → proof | MKT-15..17 + MKT-25 |
| Integration Engineering | APIs/webhooks/outbox/retry | MKT-13..14 + MKT-23 |
| Arabic RTL SaaS | Arabic/RTL production business UI | MKT-09 + MKT-18 |
| Import/Excel Automation | parsing/validation/quarantine/commit | MKT-11 + MKT-27 |

## 7. Decision rule

Market research is a **requirements input**, not an authorization to expand scope blindly.

- CORE → enters release/readiness criteria where it matches the product.
- RELEASE → enters evidence gates.
- P1 → enters the product/commercial backlog; it must not mutate a frozen certification candidate without scope approval.
- P2 → optional capability.

**No market-derived item may override the Evidence-First, exact-SHA, security, tenant-isolation, or Production-NO-TOUCH rules.**
