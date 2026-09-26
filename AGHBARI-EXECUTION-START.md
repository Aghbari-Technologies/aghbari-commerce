# 🔴 AGHBARI COMMERCE — MASTER EXECUTION PROTOCOL

## FINAL CLOSURE MODE — FULL UI + CORE + SECURITY + PROOF + MAXIMUM SPACE PRESERVATION

**Project:** Aghbari Commerce | الأغبري  
**Repository:** `Aghbari-Technologies/aghbari-commerce`  
**Execution phase:** Final closure and product hardening. Do not restart discovery or rebuild closed work.

# 0. EXECUTE NOW

هذه الرسالة ليست طلب تحليل أو خطة أو تقرير.

**الأمر هو: EXECUTE NOW.**

نفّذ العمل الحقيقي مباشرة من آخر حالة مثبتة، وبأقصى قدر ممكن من الإنجاز في الجلسة نفسها.

لا تنتظر مني:
- اختيار المهمة التالية؛
- اختيار التقنية؛
- تقسيم العمل؛
- إعادة شرح المشروع؛
- الموافقة على إصلاحات تقنية لازمة.

**أنت مسؤول التنفيذ.**

لا تعد إلى الصفر.  
لا تبدأ من مرحلة تاريخية.  
لا تعيد اكتشاف ما هو مثبت.  
لا تحوّل الجلسة إلى تقرير تقدم بينما توجد جبهة قابلة للتنفيذ.

الهدف في كل جلسة:

```text
CLOSE OPEN GAP
→ VERIFY
→ PROVE
→ WRITE-BACK
→ OPEN NEXT GAP
→ CONTINUE
```

# 1. قاعدة الحقيقة الأولى — ACTUAL EXACT HEAD

ابدأ دائمًا بـ:

```text
VERIFY ACTUAL GIT HEAD
→ VERIFY BRANCH
→ VERIFY CURRENT REPOSITORY/WORKTREE STATE
→ VERIFY LATEST EXACT EXECUTION CHECKPOINT
```

لا تعتمد على SHA قديم مكتوب في الذاكرة باعتباره HEAD.

إذا تقدم `main`:

**اعمل على HEAD الحقيقي فورًا.**

لا تنقل evidence من SHA آخر.

الحقيقة الحالية هي:

```text
ACTUAL GIT STATE
+
CURRENT LIVE STATE
+
VERIFIED EXACT-SHA EVIDENCE
```

# 2. BOOT SEQUENCE — CANONICAL ONLY

بعد التحقق من HEAD اقرأ:

1. `PROJECT_MEMORY.md`
2. `docs/CANONICAL-DOCUMENT-SYSTEM.md`
3. `docs/canonical/01-PRODUCT-REQUIREMENTS.md`
4. `docs/canonical/02-UX-UI-CUSTOMER-EXPERIENCE.md`
5. `docs/canonical/03-ARCHITECTURE-DATA-DOMAIN.md`
6. `docs/canonical/04-SECURITY-RELIABILITY-INTEGRATIONS.md`
7. `docs/canonical/05-QUALITY-CERTIFICATION-RELEASE.md`
8. `docs/canonical/06-MARKET-DIFFERENTIATION-PORTFOLIO.md`
9. `ops/AGHBARI-DEVELOPMENT-PROGRESS.md`
10. `ops/AGHBARI-LATEST-EXECUTION-STATE.md`

ثم اقرأ فقط الوثيقة/الملف التاريخي الضروري لإغلاق gap حقيقي.

**ممنوع إنشاء Memory System جديد أو Backlog موازٍ للمحادثة.**

# 3. CLOSURE MODE — لا تعِد الاستكشاف

المشروع قطع مرحلة البناء الأولية. لذلك:

**DISCOVERY TIME ≈ صفر.**

لا تبحث عن "ما الذي يمكن بناؤه" بشكل عام.

ابحث فقط عن:

```OPEN GAP
+
REGRESSION
+
INVALIDATED EVIDENCE
+
ENVIRONMENT DRIFT
+
SECURITY DEFECT
+
MISSING CONTRACT
+
MISSING REFERENCE-BACKED UI
```

كل شيء مغلق ومثبت يبقى مغلقًا.

لا تعيد feature إلا عند وجود سبب موثق من:

```text
Regression
Dependency Change
Environment Change
Evidence Invalidation
Security Finding
Requirement Change
```

# 4. EXECUTION FRONTIER — العمل بالتوازي

أنشئ Execution Frontier من الفجوات المفتوحة الفعلية، ثم نفّذ بالتوازي على الجبهات المستقلة:

```text
FRONT A — FULL UI / VISUAL FIDELITY
FRONT B — PRODUCT / DOMAIN / TRANSACTIONS
FRONT C — DATABASE / RLS / RPC / SECURITY
FRONT D — QA / TEST-THE-TEST / BROWSER
FRONT E — DEPLOYMENT / RUNTIME / RELEASE
FRONT F — PERFORMANCE / RESOURCE PRESERVATION
FRONT G — DOCUMENT CONSOLIDATION
```

**جبهة متوقفة لا توقف الجبهات الأخرى.**

إذا تعطل deployment، أكمل UI/core/security/docs.  
إذا تعطل test runner، أكمل إصلاحات الكود والاختبارات القابلة للتنفيذ.  
إذا تطلبت جبهة تدخلًا بشريًا حقيقيًا، سجل blocker بدقة وانتقل فورًا إلى الجبهة التالية.

# 5. قاعدة الإنجاز الفعلي — لا وقت ضائع

في بداية كل عملية:

```ROOT CAUSE
→ MINIMUM SAFE CHANGE
→ IMPLEMENT
→ VERIFY
→ PROVE
→ WRITE BACK
```

ممنوع:

- التخطيط الطويل بدل التنفيذ؛
- إعادة قراءة كل التاريخ دون حاجة؛
- إعادة بناء نظام موجود؛
- إنشاء abstraction جديد عندما يكفي refactor للقديم؛
- إنشاء ملفات متكررة لأجل نفس الغرض؛
- انتظار جبهة واحدة رغم وجود جبهة أخرى قابلة للتنفيذ.

**اتخذ القرار التقني المناسب ونفّذه مباشرة.**

# 6. REFERENCE-FIRST UI — المرجع البصري أصبح جزءًا من العقد

المصدر البصري الرسمي الحالي موجود تحت:

`docs/ui-reference/`

يوجد حاليًا **84 صورة PNG مرجعية** مرفوعة في هذا المسار.

قاعدة التنفيذ:

**كل صورة مرجعية في `docs/ui-reference/` تعتبر P0 بصريًا افتراضيًا ما لم تُصنف صراحةً كغير ذلك.**

المراجع تحدد:

- تركيب الشاشة؛
- hierarchy؛
- كثافة المعلومات؛
- RTL alignment؛
- المسافات؛
- البطاقات؛
- الحواف والـradius؛
- الأزرار والحالات؛
- الجداول؛
- الشرائح/الـpills؛
- التنقل الجانبي؛
- الشريط العلوي؛
- progressive disclosure؛
- responsive composition؛
- loading/empty/error/success presentation؛
- interaction intent.

**المرجع البصري لا يخلق عقدًا backend غير موجود.**

إذا عرضت الصورة وظيفة غير موجودة في Commerce مثل AI/BI/Onyx/Promotions بلا عقد canonical:
- طبّق أسلوبها البصري على المساحات الحقيقية عند انطباقه؛
- أظهر حدود النطاق بوضوح؛
- لا تصنع fake data أو fake mutation أو زرًا ميتًا ليبدو التطبيق مكتملًا.

# 7. FULL UI CLOSURE — القسم مكتمل من أول route إلى آخر state

لكل surface قابل للانطباق افحص:

```text
Route
→ Subroute
→ View/Sub-view
→ Component
→ Form
→ Dialog
→ Drawer
→ Table/Card
→ Search
→ Filter
→ Sort
→ Pagination
→ Bulk Action
→ Validation
→ Permission
→ Loading
→ Empty
→ Error
→ Success
→ Disabled
→ Offline
→ Responsive
→ Accessibility
→ Persistence
→ Real Action
```

لا تعتبر الصفحة مكتملة لأن route يفتح.

## Admin / Staff

أغلق فعليًا:

```text
Command Center
Orders
Order Detail
Customers
Catalog
Products
Categories
Pricing
Purchasing
Suppliers
Receiving
Inventory
Warehouses
Transfers
Stock Count
Finance
Invoices
Payments
Expenses
Import
Export
Invitations
Roles
Permissions
Notifications
Audit
Outbox/Governance
Settings
Integrations
```

وكل nested state المناسب لكل شاشة.

## Customer Portal

أغلق فعليًا:

```text
Store
Catalog
Categories
Search
Filters
Product Detail
Cart
Checkout
Orders
Order Detail
History
Tracking
Templates
Quick Order
Account
Profile
Notifications
Invitations
Offline/Weak Network
Finance
```

# 8. UI VISUAL FIDELITY — لا تستخدم generic replacement

عند وجود P0 reference:

**لا تستبدل التصميم المرجعي بقالب عام لمجرد أنه أسرع.**

نفّذ أولًا طبقة design primitives مشتركة، ثم طبّقها على جميع الشاشات:

```text
Reference
→ Shared Tokens
→ Shared Components
→ Screen Layout
→ Screen States
→ Real Data/Actions
```

استخرج من المراجع، بحسب انطباقها:

- top navigation / header hierarchy؛
- right-side contextual navigation؛
- teal primary surfaces؛
- pale cyan grouped cards؛
- rounded operational containers؛
- compact pill controls؛
- dense but readable tables؛
- status badges؛
- KPI cards؛
- breadcrumbs؛
- quick-action strips؛
- responsive horizontal overflow حيث يلزم؛
- RTL-first typography and alignment.

**لا تنسخ اسم العامري أو أي هوية خارجية.**

الهوية التشغيلية الوحيدة:

**الأغبري | Aghbari Commerce**

# 9. IMAGE / REFERENCE ASSET RULE

المجلد:

`docs/ui-reference/`

هو **reference-only**.

ممنوع:

```text
copy references → src/
copy references → public/
copy references → dist/
duplicate references → another folder
bundle references into production assets
```

استخدم الصور كمصدر مطابقة واختبار بصري فقط.

لا تحفظ نسخة ثانية من الصورة نفسها إلا إذا كانت مطلوبة لسبب تقني واضح ومثبت.

# 10. MISSING REQUIREMENTS / SPEC INTAKE — لا تسمح بفقد أي متطلب جديد

أي متطلب أو مواصفة تظهر من:
- الصور والمراجع البصرية؛
- الوثائق التاريخية؛
- الكود الحالي؛
- اكتشاف فجوة أثناء التنفيذ؛
- نتيجة اختبار أو Browser/Runtime؛
- Security review؛
- ملاحظة تشغيلية حقيقية؛

يجب تصنيفها فورًا ووضعها **تحت القسم canonical المتخصص الذي يملكها**، وليس في ملف ملاحظات عشوائي.

قاعدة التصنيف:

```text
PRODUCT / BUSINESS
→ docs/canonical/01-PRODUCT-REQUIREMENTS.md

UX / UI / EXPERIENCE
→ docs/canonical/02-UX-UI-CUSTOMER-EXPERIENCE.md

ARCHITECTURE / DATA / DOMAIN
→ docs/canonical/03-ARCHITECTURE-DATA-DOMAIN.md

SECURITY / RELIABILITY / OFFLINE / INTEGRATIONS
→ docs/canonical/04-SECURITY-RELIABILITY-INTEGRATIONS.md

QUALITY / TEST / CERTIFICATION / RELEASE
→ docs/canonical/05-QUALITY-CERTIFICATION-RELEASE.md

MARKET / VALUE / DIFFERENTIATION
→ docs/canonical/06-MARKET-DIFFERENTIATION-PORTFOLIO.md
```

إذا كان المتطلب يمس أكثر من قسم:
- ضع الـauthoritative rule في القسم المالك؛
- اربط الأقسام الأخرى به بدل تكرار النص كاملًا؛
- حدّث `PROJECT_MEMORY.md` فقط إذا أصبح القرار durable/global؛
- حدّث `docs/CANONICAL-DOCUMENT-SYSTEM.md` إذا أضيف مصدر أو authority جديدة.

لا تفقد أي requirement فريد بسبب اختصار أو ضغط السجلات.

**REFERENCE → REQUIREMENT EXTRACTION → CLASSIFICATION → CANONICAL INSERTION → IMPLEMENTATION → TEST → PROOF**

لا تعتبر المرجع "معلومة بصرية فقط" إذا استخرج منه متطلب تشغيل أو قبول أو أمان أو responsive behavior.

ولا تعتبر إضافة المتطلب إلى الوثائق إنجازًا بحد ذاته؛ يجب أن يتحول إلى **implemented/verified/proven** أو إلى **explicit boundary/blocked** بسبب عقد مفقود.

# 10. CORE PRODUCT CLOSURE

بالتوازي مع UI، أغلق:

```text
Catalog Truth
Pricing Truth
Customer Truth
Supplier Truth
Cart
Checkout
Orders
Order State Machine
Purchasing
Receiving
Inventory
Warehouses
Transfers
Stock Count
Finance
Invoices
Payments
Expenses
Import/Export
Invitations
Roles
Permissions
Notifications
Audit
Outbox
Idempotency
Concurrency
Offline
Storage
Integrations
Reporting Gateway Boundary
```

كل capability يجب أن تسير:

```UI
→ Interaction
→ State
→ Service/Domain
→ API/RPC
→ Auth/RBAC
→ RLS/Database
→ Persistence
→ Audit
→ Verification
```

إذا توقفت عند UI فهي ليست مكتملة.

# 11. CURRENT KNOWN CORE GAP

العنصر المعروف المفتوح حاليًا:

**Purchase / Receipt idempotency server upper bound**

```client/repository = 128
live RPC bound      = 200
```

المطلوب:

- توحيد server bound إلى canonical 128 عبر migration مراجعة؛
- عدم تنفيذ تعديل مباشر على production تحت HOLD؛
- فحص live records قبل التغيير؛
- اختبار 128 accepted / 129 rejected على exact SHA؛
- إثبات migration lineage + runtime behavior؛
- عدم نقل evidence من SHA آخر.

# 12. SECURITY CLOSURE

تحقق فعليًا من:

```text
Authentication
Authorization
RBAC
RLS
Tenant Isolation
Branch/Warehouse/Customer Scope
RPC Privileges
SECURITY DEFINER
search_path
Storage Boundaries
Invitation Security
Input Validation
Numeric Limits
Rate Limits
Sensitive Data Exposure
Audit Integrity
Privilege Escalation
Cross-Tenant Access
Negative Paths
```

لا تعمل blanket revoke لوظائف transactional مطلوبة.

كل SECURITY DEFINER يجب تصنيفه حسب:

```caller
+
role
+
tenant boundary
+
data sensitivity
+
privilege necessity
+
search_path
```

# 13. RELIABILITY / OFFLINE / INTEGRATION

التأثيرات الخارجية تستخدم:

```Domain Command
→ Transaction
→ Outbox
→ Worker
→ Adapter
→ Delivery Record
→ Retry
→ Terminal Failure / Recovery
```

الخصائص:

```Idempotent
Bounded
Observable
Auditable
Recoverable
```

الـoffline ليس مصدر حقيقة ثانيًا.

السيرفر يبقى المرجع النهائي للسعر والمخزون والصلاحيات وقبول الطلب.

# 14. TEST-THE-TEST

لا يكفي وجود test.

اسأل:

> هل سيفشل الاختبار فعلاً إذا عاد العطل؟

اختبر الاختبار نفسه.

أي test لا يلتقط failure الذي يدّعي تغطيته هو **TEST DEFECT** ويجب إصلاحه.

# 15. EXACT-SHA EVIDENCE

لا تقل PASS إلا مع:

```Exact SHA
+
Environment
+
Command/Workflow
+
Result
+
Evidence
```

ممنوع نقل evidence بين:

```HEAD
PR
CI
Artifact
Candidate
Deployment
Runtime
Production
```

وممنوع خلط:

```IMPLEMENTED
≠ VERIFIED
≠ PROVEN
≠ CERTIFIED
```

# 16. BROWSER / VISUAL PROOF

عندما تكون البيئة متاحة:

```Real Browser
→ Exact Route
→ Exact State
→ Exact Interaction
→ Real Persistence
→ Refresh
→ Re-open
→ Verify
```

للمراجع البصرية:

```REFERENCE IMAGE
+
IMPLEMENTATION SCREENSHOT
+
ROUTE
+
VIEWPORT
+
STATE
+
EXACT SHA
```

افحص:

```Desktop
Tablet
Mobile
RTL
Console
Network
Permission
Loading
Empty
Error
Success
Responsive overflow
Keyboard focus
Reduced motion
```

# 17. PERFORMANCE / MAXIMUM SPACE PRESERVATION

هذه قاعدة تشغيلية إلزامية.

الأولوية:

```REUSE
→ REFACTOR
→ DEDUPLICATE
→ BOUND
→ CACHE INTELLIGENTLY
→ BUILD ONLY WHEN NEEDED
→ DEPLOY ONLY WHEN NEEDED
```

## Repository storage

احفظ في Git فقط ما يلزم للتشغيل أو التتبع أو المصدر.

ممنوع إضافة:

```dist
coverage
playwright-report
test-results
node_modules
temporary archives
debug dumps
generated logs
local credentials
duplicate screenshots
duplicate exports
```

ملفات التوليد المحلية يجب أن تبقى خارج Git أو ضمن `.gitignore`.

## Dependencies

قبل إضافة dependency:

```EXISTING PACKAGE?
→ CAN REFRACTOR?
→ CAN USE BROWSER/PLATFORM API?
→ CAN REUSE EXISTING COMPONENT?
```

لا تضف package جديدًا لمهمة يمكن إنجازها بالموجود.

## UI assets

المصدر المرجعي الواحد هو:

`docs/ui-reference/`

لا تنسخ الصور إلى `src` أو `public` أو `dist`.

## CSS / Components

لا تنشئ ملف CSS أو component جديدًا إذا كان الموجود قابلًا لإعادة الاستخدام بأمان.

```shared token
→ shared primitive
→ existing screen
```

أفضل من:

```duplicate token
→ duplicate component
→ duplicate CSS
```

## Cache / Queue / Offline

كل cache / queue يجب أن يكون bounded.

ممنوع:

- cache بلا حد؛
- queue بلا حد؛
- retries بلا حد؛
- local records تتضخم بلا lifecycle.

ولا تحذف بيانات الأعمال أو المالية أو التدقيق لتوفير المساحة.

## Builds / Deployments

لا تشغّل build/deploy متكررًا دون قيمة إثباتية.

خصوصًا عند وجود known deployment blocker.

```failed attempt
→ identify root cause
→ change only when it can change the outcome
```

# 18. NO-WASTE EXECUTION LOOP

لكل gap:

```1. Identify exact gap
2. Reuse existing code
3. Implement smallest safe closure
4. Test immediately
5. Fix root-cause regression
6. Verify exact SHA
7. Record compact evidence
8. Continue
```

**لا تجعل التحقيق أكبر من الإصلاح.**

# 19. BLOCKER RULE

إذا ظهر blocker:

```ROOT CAUSE
→ FIX IF POSSIBLE
→ VERIFY
→ RECORD
→ CONTINUE OTHER FRONTS
```

إذا لم يمكن حله:

```EXACT BLOCKER
+
AFFECTED SHA
+
WHAT WAS TRIED
+
FREE/LOCAL ALTERNATIVES
+
WHAT REMAINS EXECUTABLE
+
PRECISE NEXT ACTION
```

لا تطلب تدخل المستخدم إلا عندما تصبح هناك **خطوة بشرية حقيقية لا يمكن تنفيذها بالأدوات المتاحة** وبعد استنفاد البدائل المجانية العملية.

# 20. DOCUMENT CONSOLIDATION

`docs/CANONICAL-DOCUMENT-SYSTEM.md` هو manifest.

لكل legacy source:

```READ FULL
→ EXTRACT UNIQUE KNOWLEDGE
→ RECONCILE
→ MERGE
→ UPDATE REFERENCES
→ VERIFY COVERAGE
→ RETIRE
```

لا تعلن:

`100% CONSOLIDATED`

حتى يثبت الدمج الدلالي الكامل.

# 21. WRITE-BACK — إلزامي بعد كل جلسة

### `PROJECT_MEMORY.md`

أضف فقط:

- durable decisions؛
- new permanent execution rules؛
- new reference/architecture/security contracts.

### `ops/AGHBARI-DEVELOPMENT-PROGRESS.md`

سجل مضغوط:

```Start
Change
Root Cause
Fix
Proof
Remaining
```

### `ops/AGHBARI-LATEST-EXECUTION-STATE.md`

يجب أن يحتوي:

```Actual Verified HEAD
Functional HEAD
Branch
Implemented
Proven
Open Gaps
Blockers
Candidate
Deployment
Production
CURRENT RESUME POINTER
```

لا تضف سجلات ضخمة أو dumps.

# 22. CURRENT RESUME POINTER — أمر تنفيذي وليس وصفًا عامًا

يجب أن يستطيع مبرمج جديد تنفيذها دون إعادة تحقيق.

صيغة إلزامية:

```CURRENT RESUME POINTER

START FROM CURRENT ACTUAL VERIFIED HEAD.

UI FRONT:
docs/ui-reference/
→ implement remaining P0 visual references across live Admin/Staff surfaces
→ then apply same shared design system to Customer Portal
→ close nested states only where backend contracts exist

CORE FRONT:
normalize purchase/receipt idempotency 200 → 128 safely
→ re-run migration + concurrency + Test-the-Test

SECURITY FRONT:
classify/close remaining authenticated SECURITY DEFINER advisory findings

QA FRONT:
exact-SHA quality/security/migration/concurrency/browser proof

DEPLOY FRONT:
exact-current-source hosted runtime proof
→ free fallback first
→ no paid spend

DOC FRONT:
complete semantic legacy source consolidation

DO NOT REPEAT:
anything already proven unless evidence is invalidated.
```

# 23. SCOPE LOCK

Commerce فقط.

Report-Advisor / Report-Engainall خارج النطاق التشغيلي.

BI/AI/advanced analytics/Onyx/Developer AI لا تصبح جزءًا من transactional truth لمجرد ظهورها في reference screenshots.

المراجع البصرية تحدد **الواجهة**؛ canonical contracts تحدد **الوظيفة**.

# 24. FINAL CLOSURE CRITERIA

ميزة:

```Implemented
+
Integrated
+
Persisted
+
Secured
+
Tested
+
Browser/Runtime Verified
+
Exact-SHA Evidence
+
Documented
```

المنتج:

```FULL UI
+
FULL CORE
+
SECURE
+
RELIABLE
+
TESTED
+
RUNTIME PROVEN
+
DEPLOYABLE
+
RESUMABLE
```

Certification لا تُعلن قبل اجتياز جميع البوابات المطلوبة.

Production يبقى:

**HOLD / NO TOUCH**

حتى يصبح exact-source evidence مكتملًا.

# 25. FINAL ORDER

**EXECUTE NOW.**

ابدأ من:

```ACTUAL CURRENT HEAD
→ CANONICAL MEMORY
→ CURRENT STATE
→ OPEN-GAP FRONTIER
→ PARALLEL UI + CORE + SECURITY + QA + RELEASE
→ TEST
→ TEST-THE-TEST
→ BROWSER/RUNTIME
→ PROVE
→ WRITE-BACK
→ CONTINUE
```

ولا تتوقف عند نجاح workflow واحد.

لا تعد إلى الصفر.  
لا تعيد المكتمل.  
لا تترك UI نصف مكتملة.  
لا تترك زرًا بلا وظيفة.  
لا تترك وظيفة بلا persistence.  
لا تترك persistence بلا authorization.  
لا تترك authorization بلا evidence.  
لا تعلن PASS بلا إثبات.  
لا تستهلك مساحة أو موارد بلا قيمة تنفيذية.

**كل جلسة يجب أن تقلّل عدد الـopen gaps فعليًا، وتزيد مساحة الواجهة المكتملة والقلب التشغيلي المثبت، وتترك المشروع في Exact State قابل للاستئناف دون إعادة تحقيق.**

# الأغبري ليس Demo.

# الأغبري منتج B2B جاد يجب إغلاقه بالكامل.
