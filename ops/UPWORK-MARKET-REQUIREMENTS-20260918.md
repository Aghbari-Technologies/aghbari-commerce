# الأغبري | Upwork Market Requirements Baseline — 2026-09-18

> **Purpose:** تحويل إشارات الطلب الفعلية في Upwork إلى متطلبات قبول/جاهزية قابلة للتنفيذ لمشروع الأغبري Commerce.
>
> **Scope rule:** هذا المستند لا يضيف ميزات خارج منتج الأغبري تلقائيًا. فقط المتطلبات التي تتطابق مع نطاق المنتج أو ترفع جاهزية التشغيل/البيع تدخل كمتطلبات تنفيذية. الميزات الخاصة بمجالات غير منتج الأغبري تبقى كإشارات سوقية لا كالتزام منتجي.

## 1. Executive finding

العينة الحالية من وظائف Upwork تُظهر طلبًا متكررًا على مجموعة مترابطة من القدرات التي نبنيها أصلًا في الأغبري:

- React / Next.js / TypeScript
- Supabase / PostgreSQL / Auth / RLS
- Multi-tenant isolation + RBAC
- Admin / operations portals
- Customers / suppliers / orders / inventory / catalog
- Integrations / APIs / webhooks / background jobs
- Production hardening / testing / CI/CD / observability
- Arabic / RTL
- Excel / PDF / import / export
- PWA / offline / recovery
- Payments and subscription boundaries
- AI/LLM and WhatsApp integrations
- Safe maintenance of existing/AI-generated code

هذه ليست قائمة رغبات؛ هي **market-derived acceptance signals** يجب مواءمتها مع النطاق المعتمد ومصفوفة الإغلاق.

## 2. Verified Upwork sample

| # | الوظيفة | تاريخ الظهور | نموذج التسعير الظاهر | إشارات النشاط الظاهرة | المتطلبات التي تتقاطع مع الأغبري |
|---|---|---|---|---|---|
| 1 | Backend developer for multi-tenant SaaS dashboard | 2026-09-16 تقريبًا | بالساعة، <30h/week، 1–3 أشهر | — | Multi-tenant، Supabase/Postgres/RLS، OAuth، scheduled sync، integrations |
| 2 | Full-Stack Developer to Build MVP for B2B SaaS | 2026-08-18 | $1,000 ثابت | 50+ proposals، 2 interviews، 1 hire | React/Vite/Tailwind، Supabase/Postgres، RLS، العملاء/الموردون، payments، templates |
| 3 | Full-Stack Developer — Multi-Tenant SaaS MVP | 2026-07 تقريبًا | غير ظاهر في صفحة البحث | — | Next.js، Vercel، Supabase Auth، Google OAuth، multi-tenant RLS/RBAC، ETL boundary |
| 4 | Need Senior SaaS MVP developer for long term | 2026-09-12 تقريبًا | $35–$47/ساعة | 50+ proposals، 5 interviews | Next.js/React، Node، Supabase/Postgres، APIs، billing، internal tools، CI/CD، production ownership |
| 5 | CRM Development | 2026-09-18 تقريبًا | $30–$55/ساعة | 50+ proposals | CRM/business management، React/Next/TS، Supabase/Postgres/RLS، integrations، multi-company isolation |
| 6 | Independent Code Review — HIPAA-track SaaS | 2026-08-16 | $400 ثابت | 20–50 proposals، 4 interviews | RLS audit، tenant isolation، auth، secrets، dependency hygiene، code review |
| 7 | Automated Reports & Alerts Engine for Arabic E-commerce SaaS | 2026-08 تقريبًا | $200 ثابت | 20–50 proposals، 1 hire | Arabic/RTL، report outbox، retries، audit history، inventory alerts، production verification |
| 8 | Build Custom CRM with Lovable, Supabase & API Integrations | 2026-09-11 تقريبًا | غير ظاهر | — | Multi-tenant CRM، client portal، RLS، APIs، webhooks، production deployment |
| 9 | Full-Stack Engineer — FinTech/GovTech Intake Workflow | 2026-09-08 | $10,000 ثابت | — | Next.js/Vercel، Supabase/Postgres/RLS، dynamic white-labeling، document processing، deterministic rules، testing |
| 10 | Next.js eCommerce Developer Needed | 2026-09-08 | $10 ثابت | 20–50 proposals، 1 hire | Next.js/TS/Tailwind، Supabase، Stripe، products、cart、checkout، auth |
| 11 | Need a Claude Code developer to build software | 2026-08/09 | $15–$40/ساعة | 50+ proposals، 10 interviews | Production multi-tenant SaaS، Next.js/Supabase/Vercel، RLS، PDF، REST، PWA/offline، migrations at scale |
| 12 | Full-Stack Developer for Arabic SaaS Platform | 2026-09-17 تقريبًا | $15–$35/ساعة | 20–50 proposals | Arabic/RTL، Next.js/React، Supabase/Postgres، OpenAI، security، performance، ongoing support |
| 13 | Senior Supabase & RLS Specialist — SaaS Security Audit | 2026-08/09 | بالساعة | 20–50 proposals، 6 interviews | Multi-tenant RLS، RBAC، financial-data isolation، performance/security audit |
| 14 | Full-Stack Developer for Health Platform | 2026-07 تقريبًا | بالساعة | 50+ proposals | Role-based dashboards، catalog/inventory، Supabase/RLS، WhatsApp API، webhooks، Vercel، monitoring |
| 15 | DataBase Administrator | 2026-09-15 | $3,000 ثابت | — | PostgreSQL، tenant isolation، RLS، constraints/indexes، migrations، audit، idempotency/outbox، backup/restore |
| 16 | PostgreSQL Database Designer / Architect | 2026-09 تقريبًا | بالساعة، 3–6 أشهر | 5–10 proposals، 2 interviews | normalization، constraints، indexes، transactions/concurrency، RLS، privileges، partitioning، performance |
| 17 | Shopify public app developer — Next.js/Supabase | 2026-09-16 تقريبًا | بالساعة، 1–3 أشهر | — | Next.js/React، Supabase/Postgres/RLS، Vercel، work queue، webhooks، OAuth، concurrency-safe code |
| 18 | Build a Lightweight Order Management System | 2026-08/09 | غير ظاهر | — | Order state machine، quotes/invoices/payments، suppliers، files، activity history، email automation، Xero |
| 19 | Next.js + Supabase Developer — Wire Existing Frontend Forms | 2026-08-24 | $200 ثابت | 15–20 proposals، 12 interviews، 1 hire | B2B portal، Admin + Client sync، Supabase/RLS، payments/email، live verification |
| 20 | Next.js + Supabase Developer — Admin Panel Bug Fixes | 2026-09-04 تقريبًا | غير ظاهر | — | Product variants، cart، Supabase data ops، admin dashboard، debugging existing code |
| 21 | Full-Stack Engineer — Operations Portal | 2026-09-04 تقريبًا | غير ظاهر | — | secure multi-tenant، RBAC، financial ledger، workflow automation، webhooks، idempotency |
| 22 | Build an AI-Powered Café Operations System | 2026-09-15 | $8,000 ثابت | 50+ proposals | Sales، inventory، purchasing، supplier management، automation، PostgreSQL/Supabase، AI assistant، multi-location |
| 23 | Full-Stack Developer — AI WhatsApp SaaS MVP audit/productionize | 2026-09-03 تقريبًا | $30–$55/ساعة | 50+ proposals، 2 interviews | Next.js، Supabase، WhatsApp/Meta webhooks، OpenAI، production audit، reliability/security |
| 24 | Senior Full-Stack Developer — Insurance CRM SaaS | 2026-09-01 | $20,000 ثابت | — | React/TS، Supabase/Postgres، multi-tenant orgs، RBAC، Stripe subscriptions، Gmail/Outlook OAuth، production SaaS |

## 3. Consolidated market requirement matrix

| ID | Market-derived requirement | علاقة الأغبري | معيار القبول المطلوب في الأغبري | الحالة المرجعية |
|---|---|---|---|---|
| MKT-01 | Multi-tenant architecture | أساسي | عزل tenant على مستوى التطبيق + DB/RLS + negative tests | **Required / Core** |
| MKT-02 | RBAC + least privilege | أساسي | الأدوار والصلاحيات موثقة، enforcement server/DB، negative-path proof | **Required / Core** |
| MKT-03 | Supabase/Postgres/Auth/RLS | أساسي | schema/migrations/RLS/auth مثبتة على exact HEAD | **Required / Core** |
| MKT-04 | Catalog + products + pricing | أساسي | product/SKU/barcode/unit/category + server-authoritative price | **Required / Core** |
| MKT-05 | Customers + suppliers | أساسي | lifecycle + authorization + tenant scope + audit | **Required / Core** |
| MKT-06 | Orders + state machine | أساسي | transactional workflow + idempotency + audit + conflict handling | **Required / Core** |
| MKT-07 | Inventory + warehouse/branch | أساسي | stock truth server-side + no oversell + concurrency proof | **Required / Core** |
| MKT-08 | Admin / operations command center | أساسي | action-oriented admin workflows، filters، bulk actions، exception states | **Required / Core** |
| MKT-09 | Customer portal | أساسي | fast catalog → cart → order → tracking → ledger journeys | **Required / Core** |
| MKT-10 | Search / filters / bulk actions | أساسي | name/SKU/barcode + category/brand + scoped bulk operations | **Required / Core** |
| MKT-11 | Excel import / quick orders | أساسي | quarantine → parse → validate → preview → explicit commit → evidence | **Required / Core** |
| MKT-12 | PDF / document generation | أساسي جزئي | customer statement/documents with authorization and provenance | **Required / Core** |
| MKT-13 | API / webhook integrations | أساسي | typed contracts، auth، idempotency، retry، failure visibility | **Required / Core** |
| MKT-14 | Background jobs / queue / outbox | أساسي للبنى المتقدمة | durable outbox + retry/backoff + terminal failure + duplicate-send prevention | **Required / Core Reliability** |
| MKT-15 | Production hardening | أساسي | build، deployment، smoke، runtime logs، recovery، exact artifact proof | **Required / Release** |
| MKT-16 | Automated testing / E2E | أساسي | unit/integration + adversarial + browser + exact-SHA evidence | **Required / Release** |
| MKT-17 | Observability | أساسي | error visibility، structured logs، key operational telemetry، incident evidence | **Required / Release** |
| MKT-18 | Arabic / RTL | ميزة سوقية مباشرة | RTL-first، typography، tables/forms/dialogs/mobile states | **Required / Core UX** |
| MKT-19 | PWA / bounded offline | ملائم للأعمال الميدانية | cache/draft/queue/reconnect with server revalidation | **Required where applicable** |
| MKT-20 | Payments boundary | ملائم تجاريًا | provider adapter + webhook verification + idempotency؛ لا يثبت provider unavailable | **Required Boundary** |
| MKT-21 | SaaS plan/subscription management | ملائم لتسويق المنتج كـSaaS | plans/limits/tenant plan state، دون خلطها مع operational commerce data | **Commercial Gap / P1** |
| MKT-22 | White-label / theme controls | ملائم للأغبري | tenant/client theme controls مع server-persisted configuration | **Product Fit / P1** |
| MKT-23 | WhatsApp / messaging integrations | ملائم | provider adapter + template policy + delivery state + retry | **Integration / P1** |
| MKT-24 | AI-ready integration boundary | إشارة سوقية متكررة | capability boundary فقط؛ لا نقل BI/decision logic من Report-Advisor | **Optional / P2** |
| MKT-25 | Safe takeover of existing / AI-generated code | ملائم لطريقة السوق | preserve-first، small PRs، no unnecessary rewrites، regression proof | **Engineering Standard** |
| MKT-26 | Database architecture/performance | أساسي | indexes/constraints/query plans/RLS performance، evidence-based tuning | **Required / Core** |
| MKT-27 | Import/export provenance | أساسي | source, version, actor, tenant, correlation, audit, reconciliation | **Required / Core** |
| MKT-28 | Security review as a sellable capability | تجاري + هندسي | reproducible audit package for auth/RLS/tenant/secret/dependency checks | **Commercial Capability / P2** |

## 4. Explicit exclusions from market-driven adoption

لا تُضاف تلقائيًا إلى الأغبري لمجرد ظهورها في Upwork:

1. مجال صحي/تنظيمي محدد، مثل HIPAA أو التوقيعات الطبية.
2. خصائص Shopify الخاصة بالتطبيقات العامة.
3. تحليلات BI/Forecasting/Decision Intelligence التي تخص Report-Advisor.
4. أي provider أو خدمة مدفوعة لا يملك المشروع قرار اعتمادها.
5. أي إعادة بناء واسعة لمجرد أن وظيفة ما تستخدم stack مختلفًا.

## 5. Acceptance gates derived from the market

قبل اعتبار الأغبري **قابلًا للبيع كخبرة/Portfolio production SaaS** يجب أن يكون لدينا دليل قابل لإعادة الاستخدام على:

- tenant isolation + RLS + RBAC
- auth + customer/admin workflows
- catalog + pricing + inventory + orders
- import/Excel + validation/quarantine
- audit + idempotency + concurrency
- integrations/webhooks/outbox/retry
- Arabic/RTL responsive UX
- E2E + adversarial/negative-path testing
- deployment + runtime observability + recovery
- exact-head evidence package

## 6. Commercial packaging signal

الخبرة التي يبنيها الأغبري يمكن تحويلها إلى عروض Upwork مستقلة:

| Package | ما نبيعه | دليل الأغبري المطلوب |
|---|---|---|
| SaaS Build | Multi-tenant business SaaS | MKT-01..09 + MKT-15..17 |
| E-commerce Ops | Catalog → pricing → cart → orders → inventory | MKT-04..12 |
| Supabase Security Audit | RLS/RBAC/tenant isolation audit | MKT-01..03 + MKT-17 + MKT-28 |
| Production Hardening | audit → fix → test → deploy → runtime proof | MKT-15..17 + MKT-25 |
| Integration Engineering | APIs/webhooks/outbox/retry | MKT-13..14 + MKT-23 |
| Arabic RTL SaaS | Arabic/RTL production UI + business workflows | MKT-09 + MKT-18 |
| Import/Excel Automation | parse/validate/quarantine/commit | MKT-11 + MKT-27 |

## 7. Decision rule

هذه المصفوفة تصبح **مرجع السوق** وليس بديلًا عن المتطلبات الأساسية أو Release Gates.

أي feature جديدة تُصنّف:

- **Core Required:** تدخل في متطلبات الجاهزية الحالية.
- **Release/Quality Required:** تدخل في أدلة الإغلاق والاختبارات.
- **P1 Product/Commercial:** تدخل Backlog ولا توسع مرشح الإغلاق الحالي بلا قرار نطاق.
- **P2 Optional:** لا تُنفذ تلقائيًا.

**لا تُستخدم هذه الوثيقة لإعادة فتح واجهة أو ميزة سبق إغلاقها دون دليل جديد.**
