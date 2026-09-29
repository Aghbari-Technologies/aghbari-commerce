# 🔴 2026-09-30 — FULL PRODUCT COMMERCE MODE

## Product mandate
Aghbari Commerce is a sellable B2B ecommerce product with two first-class surfaces:

### Customer Storefront / Portal
Home/merchandising, catalog, search, filters, categories, product detail, quantity, cart, checkout, orders/tracking/detail, reorder, templates, pricing, finance, invoices, payments, notifications, profile, company, addresses, account settings, offline/weak-network recovery.

### Admin / Staff Control Center
Command Center, orders/detail/bulk actions, customers/detail, catalog/products/categories, pricing/tiers, inventory/warehouses/transfers/stock count/history/reconciliation, suppliers/purchasing/receiving, statements/invoices/payments/expenses, import/export, roles/permissions/invitations, notifications/audit/outbox/governance, settings/appearance/branding, and explicit boundaries for unsupported external capabilities.

## Surface rule
The customer storefront is the primary commercial presentation at / and /store. Admin/Staff remains a separate operational surface. Never present the operational dashboard as the storefront.

## World-class UI gate
Every in-scope surface must use the applicable patterns of mature ecommerce/commerce software: strong information hierarchy, discovery/search, clear pricing/availability semantics, persistent cart access, obvious next action, contextual detail drawers/modals, dense readable tables, filters/sorting/pagination, bulk operations, responsive mobile/tablet behavior, keyboard accessibility and explicit loading/empty/error/success/disabled/permission/offline/retry states.

## Reality gate
No fake products, prices, stock, orders, payments, inventory, purchases, receipts or success states. Reuse existing Commerce contracts; implement an in-scope backend contract when genuinely required; otherwise document an explicit boundary.

## 120-minute execution objective
Treat each execution window as a concentrated closure window. Spend the available execution budget on real UI/core/security/QA work, close one material gap at a time, run focused proof immediately, write the exact SHA/state back, then continue to the next uncovered high-value Customer/Admin surface. Do not stop after cosmetic polish.

---

# 🔴 AGHBARI COMMERCE — MASTER EXECUTION PROTOCOL

## FINAL CLOSURE MODE — FULL UI + CORE + SECURITY + PROOF + MAXIMUM SPACE PRESERVATION

**Project:** Aghbari Commerce | الأغبري  
**Repository:** `Aghbari-Technologies/aghbari-commerce`  
**Execution phase:** Final closure and product hardening. Do not restart discovery or rebuild closed work.

# 0. EXECUTE NOW

# 🔴 0-A. MANDATORY BOOT + SESSION CONTINUITY CONTRACT

هذه الملفات جزء من أمر التشغيل نفسه وليست مراجع اختيارية.
**لا يجوز بدء التنفيذ قبل ربطها وقراءتها بالترتيب التالي:**

```text
1. AGHBARI-EXECUTION-START.md
   ↓
2. PROJECT_MEMORY.md
   ↓
3. ops/AGHBARI-LATEST-EXECUTION-STATE.md
   ↓
4. ops/AGHBARI-DEVELOPMENT-PROGRESS.md
   ↓
5. docs/CANONICAL-DOCUMENT-SYSTEM.md
   ↓
6. docs/ui-reference/UI-REFERENCE-ASSET-INDEX.md
   ↓
7. docs/canonical/02-UX-UI-CUSTOMER-EXPERIENCE.md
   ↓
8. RELEVANT SPECIALIST CANONICAL DOCUMENT(S) FOR THE CLAIMED GAP
```

### قاعدة الربط

- **AGHBARI-EXECUTION-START.md** = بروتوكول الإقلاع وقواعد التنفيذ.
- **PROJECT_MEMORY.md** = القرارات والمتطلبات والحدود الدائمة فقط.
- **AGHBARI-LATEST-EXECUTION-STATE.md** = الحالة الحية + Resume Pointer + Open Gaps + Blockers + Do-Not-Repeat.
- **AGHBARI-DEVELOPMENT-PROGRESS.md** = سجل التنفيذ المضغوط لكل Run.
- **docs/CANONICAL-DOCUMENT-SYSTEM.md** = مالك كل نوع من المتطلبات ومسار الربط canonical.
- **UI-REFERENCE-ASSET-INDEX.md** = provenance/coverage للمراجع الـ84 وقاعدة screen packs.
- **02-UX-UI-CUSTOMER-EXPERIENCE.md** = العقد الحاكم للـUX/UI.
- **specialist canonical docs** = العقد المتخصص الخاص بالفجوة التي ستُنفذ.

**لا يجوز استبدال هذه السلسلة بذاكرة المحادثة أو تقرير سابق أو SHA محفوظ.**

### قاعدة الاستئناف الإلزامي

بعد الإقلاع:

```text
ACTUAL MAIN HEAD
→ CURRENT LIVE STATE
→ LAST WRITTEN RESUME POINTER
→ EXACT OPEN GAP
→ TARGET FILES
→ IMPLEMENT
```

إذا اختلف HEAD الحقيقي عن SHA المذكور في أي تقرير سابق:
**الحقيقة هي HEAD الحقيقي، والتقرير القديم يصبح تاريخيًا.**

إذا لم يوجد Resume Pointer صالح:
استخرج أقرب نقطة استئناف من **LATEST-EXECUTION-STATE + DEVELOPMENT-PROGRESS + actual Git diff/history** بشكل موجّه، ثم ابدأ التنفيذ فورًا.

**ممنوع العودة إلى Gap أقدم** لمجرد أنه موجود في تقرير تاريخي إذا كان قد أُغلق أو تجاوزه HEAD الحالي.

### END-OF-SESSION WRITE-BACK — إلزامي قبل إنهاء أي جلسة

لا تنتهِ الجلسة بمجرد قول "تم".

قبل نهاية كل جلسة تنفيذية، يجب تنفيذ:

```text
IMPLEMENTED BATCHES
→ FOCUSED TEST / VERIFY
→ ACTUAL NEW HEAD
→ UPDATE ops/AGHBARI-LATEST-EXECUTION-STATE.md
→ UPDATE ops/AGHBARI-DEVELOPMENT-PROGRESS.md
→ UPDATE PROJECT_MEMORY.md ONLY IF DURABLE CHANGE EXISTS
→ UPDATE UI-REFERENCE-ASSET-INDEX.md IF REFERENCE COVERAGE CHANGED
→ UPDATE CANONICAL OWNER IF A NEW REQUIREMENT / CONTRACT WAS DISCOVERED
→ SET EXACT NEXT EXECUTABLE ACTION
→ SET DO-NOT-REPEAT
→ FINAL COMPACT SESSION RECORD
```

### منع الإغلاق بدون تقرير حالة

إذا لم يتم تحديث **LATEST-EXECUTION-STATE** و **DEVELOPMENT-PROGRESS** بالحالة الفعلية للجلسة و**NEXT EXECUTABLE ACTION** المحدد، فالجلسة **غير مغلقة**.

لا تكتب تقريرًا منفصلًا ضخمًا إذا كان يمكن تسجيل الخلاصة في الملفات canonical الحالية.

### NEXT EXECUTABLE ACTION يجب أن يكون قابلًا للتنفيذ مباشرة

ممنوع:

```text
Continue UI
Continue development
Continue testing
```

مسموح فقط بصيغة قابلة للتنفيذ، مثل:

```text
Implement [specific surface/subview] in [specific file],
connect [specific service/contract],
run [specific focused test],
verify [specific browser/state],
then continue to [specific next gap].
```

### SESSION HANDOFF INVARIANT

أي مبرمج جديد يستطيع استئناف الجلسة التالية دون قراءة Chat History إذا قرأ:

```text
ACTUAL GIT HEAD
+
PROJECT_MEMORY.md
+
AGHBARI-LATEST-EXECUTION-STATE.md
+
AGHBARI-DEVELOPMENT-PROGRESS.md
+
RELEVANT CANONICAL DOCS
```

**لا تعتمد على أن "المبرمج سيتذكر". اجعل المستودع نفسه يحمل نقطة الاستئناف.**

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

# 2. BOOT SEQUENCE — CANONICAL + LAZY READING

القراءة الإلزامية عند كل انطلاقة هي فقط:

1. `PROJECT_MEMORY.md`
2. `ops/AGHBARI-LATEST-EXECUTION-STATE.md`
3. `docs/ui-reference/UI-REFERENCE-ASSET-INDEX.md` إذا كانت جبهة UI/visual مفتوحة.
4. **الـcanonical specialist document المرتبط مباشرةً بالـCURRENT RESUME POINTER.**

اقرأ `docs/CANONICAL-DOCUMENT-SYSTEM.md` عند الحاجة إلى source mapping/legacy consolidation أو عندما يطلب الـgap أكثر من canonical authority.

اقرأ بقية canonical documents **عند الحاجة فقط**، وليس كلها تلقائيًا.

اقرأ legacy source فقط إذا كان مرتبطًا بفجوة تنفيذية محددة.

### قاعدة منع إعادة القراءة

إذا كانت الوثيقة:
- قرئت وأُغلقت لصالح gap حالي؛
- لم يتغير محتواها؛
- ولم تتغير dependency/environment/evidence؛

فلا تعاود قراءتها في الجلسة التالية.

**لا تقرأ التاريخ لتعرف ما تعرفه الحالة الحية مسبقًا.**

### ملفات التشغيل التاريخية غير الموجودة

الأسماء التاريخية مثل:
- `ops/AGHBARI-EXECUTION-CONTROL-PLANE.md`
- `ONE-PROGRAMMER-SESSION-MEMORY.md`
- `docs/MASTER_PRODUCT_REFERENCE.md`
- `docs/MASTER_EXECUTION_INDEX.md`

ليست ملفات تشغيل حالية على `main`.

**ممنوع إعادة إنشائها فقط لأن اسمًا قديمًا ظهر في ذاكرة أو محادثة.**

مصدر الحقيقة الحالي هو:

`PROJECT_MEMORY.md`
+
`docs/CANONICAL-DOCUMENT-SYSTEM.md`
+
`ops/AGHBARI-LATEST-EXECUTION-STATE.md`
+
`ops/AGHBARI-DEVELOPMENT-PROGRESS.md`
+
الـcanonical specialist docs.

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

## 3-A. EXECUTION FAST-PATH — اقرأ فقط ما سيغيّر القرار

هذه القاعدة تمنع تحويل التنفيذ إلى جلسة بحث.

### قاعدة القراءة
ابدأ دائمًا من CURRENT RESUME POINTER.
اقرأ الملفات المذكورة فيه أولًا، وبالنطاق الذي يكفي لاتخاذ قرار التنفيذ.
لا تقرأ repository أو legacy corpus كاملًا لمجرد الفهم العام.

لكل قراءة يجب أن تجيب على سؤال تنفيذي واحد على الأقل:
WHAT MUST CHANGE? / WHAT CONTRACT GOVERNS IT? / WHAT DEPENDENCY MUST STAY IN SYNC? / WHAT PROOF IS REQUIRED? / WHAT REQUIREMENT IS MISSING?

إذا لم تُجب القراءة عن سؤال تنفيذي جديد: توقف عن القراءة وابدأ العمل.

### بحث موجّه فقط
- استخدم البحث باسم الملف/المسار/الدالة/الـRPC/النص المستهدف، وليس بحثًا عامًا مفتوحًا.
- وسّع البحث فقط عندما تظهر معلومة جديدة تغيّر النتيجة.
- إذا أصبح مسار التعديل واضحًا، لا تعاود البحث عنه من زاوية أخرى.
- لا تعيد فتح ملف مغلق أو فحصًا سبق إثباته إلا بسبب إعادة فتح معتمد.

### Read-to-Act / Stop Rule
```text
POINTER → TARGET FILES → MINIMUM REQUIRED RANGE → IMPLEMENT

وليس:
POINTER → READ EVERYTHING → COMPARE EVERYTHING → PLAN AGAIN → IMPLEMENT
```

الهدف: أصغر قدر من القراءة ينتج أكبر قدر من التنفيذ.

# 4. MANDATORY PARALLEL EXECUTION FRONTIER — لا انتظار ولا تسلسل زائف

أنشئ Execution Frontier من الفجوات المفتوحة الفعلية، ثم نفّذ بالتوازي على الجبهات المستقلة.

~~~text
A — FULL UI / VISUAL FIDELITY
B — CORE / DOMAIN / TRANSACTIONS
C — DATABASE / RLS / RPC / SECURITY
D — QA / TEST-THE-TEST / BROWSER / VISUAL PROOF
E — DEPLOYMENT / RUNTIME / RELEASE
F — PERFORMANCE / RESOURCE PRESERVATION
G — DOCUMENT / REQUIREMENT CONSOLIDATION
~~~

## قاعدة التوازي الإلزامية
- لا تعمل الجبهات كطابور انتظار.
- طالما توجد فجوة UI قابلة للتنفيذ، يجب تنفيذ UI وفي الوقت نفسه تنفيذ CORE/SECURITY/QA القابل للتنفيذ.
- لا يوجد تقسيم 50/50 جامد؛ وزّع القدرة حسب المخاطر والاعتماديات، لكن ممنوع ترك UI أو القلب متوقفًا بلا سبب تقني.
- نفّذ بالتوازي على ملفات/نطاقات مستقلة، ولا تنشئ تعديلات متعارضة لمجرد ادعاء parallelism.
- إغلاق جبهة يفتح الجبهة التالية فورًا في نفس الدورة؛ لا تنتظر نهاية المشروع لتبدأ البقية.
- إذا كانت جبهة محجوزة بسبب blocker خارجي، احفظها كـBLOCKED وانتقل فورًا إلى جبهة مستقلة.

## الحلقة التنفيذية لكل gap
~~~text
EXACT GAP
→ ROOT CAUSE
→ REUSE EXISTING CODE/CONTRACT
→ MINIMUM SAFE CHANGE
→ IMPLEMENT
→ IMMEDIATE TEST
→ FIX REGRESSION
→ EXACT-SHA PROOF
→ COMPACT WRITE-BACK
→ NEXT GAP
~~~

الهدف ليس كثرة النشاط؛ الهدف خفض عدد OPEN GAPS فعليًا في كل دورة.

## 4-A. CLOSED-WORK LOCK + WORK CLAIM — لا تعيد العمل المنجز

قبل تعديل أي gap:
```text
CLAIM GAP
→ NAME EXACT FILES / DOMAIN
→ CHECK DO-NOT-REPEAT
→ CHECK EXISTING PROOF
→ IMPLEMENT ONLY THE MISSING DELTA
```

إذا كان الشيء PROVEN/CLOSED ولا يوجد استثناء موثق: ممنوع لمسه.

كل gap في الدورة يجب أن ينتهي بحالة واضحة:
```text
CLOSED / PROVEN
VERIFIED — MORE PROOF REQUIRED
BLOCKED — EXACT ROOT CAUSE
OPEN — PRECISE NEXT ACTION
```

### Same-failure brake
إذا فشل نفس المسار مرتين دون تغير في السبب:
STOP RETRY → CHANGE ROOT CAUSE OR SWITCH TO ANOTHER EXECUTABLE FRONT.

### Change-set discipline
اجمع تغييرات gap الواحد في closure batch متماسك، اختبره مباشرة، ولا تكرر إصلاحات صغيرة لنفس السبب.

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


# 🔴 5-A. UI-FIRST EXECUTION LOCK — الواجهة الآن هي الجبهة الرئيسية

هذه هي القاعدة التشغيلية الحاكمة للجلسة الحالية:

**الهدف الأول: تحويل Aghbari Commerce من واجهات جزئية/شكلية إلى منتج UI مكتمل فعليًا.**

طالما يوجد سطح UI من Commerce غير مكتمل، لا يجوز استهلاك وقت الجلسة الاختياري في:
- تحسينات هندسية تجميلية غير مرتبطة بالفجوة؛
- إعادة فحص شيء مغلق؛
- كتابة تقارير طويلة؛
- إعادة اكتشاف المشروع؛
- توسيع documentation دون requirement جديد؛
- إعادة محاولة blocker خارجي بلا تغير في سببه.

## قاعدة المسار الرئيسي

```text
UI OPEN GAP
→ UI IMPLEMENTATION
→ REAL INTERACTION
→ REAL STATE
→ RESPONSIVE / ACCESSIBILITY
→ IMMEDIATE PROOF
→ NEXT UI GAP
```

ولا تنتقل من شاشة إلى التالية لمجرد أن الـroute يفتح.

## شرط اكتمال الشاشة

أي شاشة/سطح Commerce لا يعتبر مكتملًا إلا إذا كان له، بحسب انطباقه:

```text
REAL LAYOUT
+ REAL CONTENT CONTRACT
+ REAL CONTROLS
+ REAL FORMS
+ REAL SEARCH / FILTER / SORT / PAGINATION
+ REAL DRAWER / MODAL / CONFIRMATION
+ REAL LOADING / EMPTY / ERROR / SUCCESS / DISABLED
+ REAL PERMISSION BEHAVIOR
+ REAL ACTION / PERSISTENCE
+ RTL
+ DESKTOP / TABLET / MOBILE
+ ACCESSIBILITY
+ BROWSER / RUNTIME PROOF
```

Route exists أو looks good أو build passes ليست Definition of Done.

## ممنوع الشاشة الهيكلية

ممنوع إنهاء سطح من خلال:
- عنوان + بطاقات تجميلية فقط؛
- أزرار بلا تنفيذ؛
- جدول وهمي أو بيانات ثابتة متنكرة كبيانات حقيقية؛
- صفحة فارغة تنتظر استكمال لاحق؛
- Coming soon لميزة موثقة ومطلوبة داخل Commerce؛
- إخفاء subviews أو states لأن تنفيذها أصعب.

إذا كان العقد الخلفي غير متوفر لميزة in-scope:

```text
IDENTIFY CONTRACT GAP
→ IMPLEMENT CONTRACT IF IN SCOPE
OR
→ EXPLICIT BOUNDARY WITH REASON
```

ولا تستخدم fake behavior.

## Customer Portal = سطح منتج كامل

لا تعامل Customer Portal كنسخة ثانوية أو شاشة متجر بسيطة.

أغلقه كاملًا، بما في ذلك:

```text
Catalog
Categories
Search
Filters
Product Detail
Cart
Checkout
Orders
Order Detail / Tracking
Reorder
Templates / Saved Orders
Finance
Invoices
Payments
Notifications
Profile
Company
Addresses
Account Settings
Invitations
Offline / Weak Network
```

وكل nested view/state/action المرتبط بها.

## Admin / Staff = مساحات تشغيل حقيقية

أغلق فعليًا جميع الأسطح الموثقة والمصرح بها، وليس مجرد روابط تنقل:

```text
Dashboard / Command Center
Orders / Order Detail
Customers / Customer Detail
Catalog / Products / Categories
Pricing
Purchasing / Suppliers / Receiving
Inventory / Warehouses / Transfers / Stock Count / History / Reconciliation
Statements / Invoices / Payments / Expenses
Import / Export
Invitations
Roles / Permissions
Notifications
Audit / Outbox / Governance
Settings / Appearance
Approved Integrations
```

العناصر غير المدعومة بعقد Commerce لا تُختلق؛ تُصنّف كـBoundary واضح.

## قاعدة الفرع الصحيح

كل requirement أو capability موثق يجب أن يُبنى تحت القسم/المساحة التي تنتمي إليها وظيفيًا.

```text
EXISTING CORRECT PARENT
→ ADD UNDER THAT PARENT

NO CORRECT PARENT
→ CREATE A NEW LOGICAL SECTION / ROUTE

UNSUPPORTED / OUT-OF-SCOPE
→ EXPLICIT BOUNDARY
```

ممنوع دفن capability صحيحة داخل قسم غير منطقي فقط لتقليل عدد الـroutes.

## المراجع الـ84 — حصر كامل بلا تضخيم

لا تُنفذ 84 صورة كـ84 شاشة، لكن لا يجوز فقد أي مرجع.

```text
84 ASSETS
→ ALL ACCOUNTED FOR
→ DUPLICATES/EQUIVALENTS GROUPED
→ EACH UNIQUE VISUAL FAMILY MAPPED
→ EACH IN-SCOPE FAMILY IMPLEMENTED
→ EACH OUT-OF-SCOPE FAMILY EXPLICITLY BOUNDED
```

وكل visual family in-scope يجب أن يصل إلى implementation حقيقي، لا مجرد registry entry.

## لا تعتبر الصورة المرجعية مجرد إلهام عند وجود capability مطابقة

إذا كشفت الصورة pattern أو state أو workflow أو responsive behavior أو navigation pattern أو field/action/interaction أو requirement تشغيليًا، فاستخرج ما ينطبق إلى العقد الصحيح ثم:

```text
REFERENCE
→ REQUIREMENT / UX CONTRACT
→ IMPLEMENTATION
→ TEST
→ PROOF
```

## وضع التنفيذ لمدة 120 دقيقة

عند تشغيل هذه الرسالة، تعامل مع أول 120 دقيقة كـexecution window مكثف:

```text
0–5 min:
VERIFY HEAD + POINTER + TARGET FILES

5–90 min:
PRIMARY UI CLOSURE
Admin/Staff + Customer + nested states + reference-backed gaps

90–110 min:
REAL ACTIONS + RESPONSIVE + ACCESSIBILITY + AFFECTED CORE CONTRACTS

110–120 min:
FOCUSED TEST + BROWSER/BUILD PROOF + WRITE-BACK + NEXT POINTER
```

لا تستخدم الـ120 دقيقة لتوسيع الاستكشاف.

إذا ظهرت فجوة UI كبيرة أثناء التنفيذ: ابنها الآن، لا تسجلها فقط.

إذا كانت جبهة أخرى blocked خارجيًا: لا تدعها توقف UI.

إذا كانت Security defect حرجة أو core dependency تمنع UI حقيقيًا: نفذ dependency اللازمة، ثم ارجع فورًا إلى UI.

## مقياس الجلسة

في كل closure batch سجّل أرقامًا قابلة للقياس، وليس وصفًا إنشائيًا:

```text
UI OPEN BEFORE
UI CLOSED THIS BATCH
UI OPEN AFTER
CUSTOMER SURFACES CLOSED
ADMIN/STAFF SURFACES CLOSED
REFERENCE PACKS CLOSED
NESTED STATES CLOSED
REAL ACTIONS CLOSED
BLOCKED + ROOT CAUSE
```

إذا لم ينخفض عدد فجوات UI أو لم يزد نطاق الواجهات المكتملة دون سبب موثق، فالجلسة لم تحقق تقدم UI كافيًا.

## ممنوع إنهاء الجلسة بنتيجة شكلية

لا تنهِ الجلسة بعبارات مثل تحسين الواجهة أو تجهيز التصميم أو إضافة components بينما لا تزال أسطح Commerce الرئيسية ناقصة.

النتيجة المطلوبة:

```text
MORE REAL SCREENS
+ MORE REAL STATES
+ MORE REAL ACTIONS
+ MORE CUSTOMER COVERAGE
+ MORE ADMIN COVERAGE
+ LESS OPEN UI GAPS
```

# 6. REFERENCE-FIRST UI — تنفيذ كامل للمراجع وليس معاينة شكلية

المصدر البصري الإلزامي:
docs/ui-reference/

يوجد حاليًا 84 PNG. هذه ليست مادة إلهام اختيارية؛ هي P0 visual input لكل سطح ينتمي إلى Commerce ما لم تُصنّف الصورة صراحةً كـboundary/out-of-scope.

## قاعدة التغطية الكاملة
يجب حساب الـ84 مرجعًا كلها دون استثناء عبر UI-REFERENCE-ASSET-INDEX.md باستخدام screen packs مضغوطة، وليس 84 ملف توثيق منفصل.

لكل مرجع/pack يجب أن يمكن معرفة:
~~~text
REFERENCE(S) → AREA → ROUTE / SURFACE → VIEW / NESTED VIEW → STATE → VIEWPORT
→ CONTRACT STATUS → IMPLEMENTATION STATUS → EXACT-SHA PROOF
~~~

ولا يجوز إغلاق UI reference batch طالما يوجد مرجع غير مصنّف أو غير مفسّر.

## عند بناء الواجهة
~~~text
REFERENCE
→ EXTRACT SHARED VISUAL LANGUAGE
→ SHARED TOKENS / PRIMITIVES
→ SHARED COMPONENTS
→ REAL SCREEN
→ NESTED VIEWS
→ REAL STATES
→ REAL ACTIONS
→ RESPONSIVE / ACCESSIBILITY
→ VISUAL COMPARISON
→ EXACT-SHA PROOF
~~~

## المرجع لا يبرر اختلاق Backend
إذا عرض المرجع AI/BI/Onyx/Promotions/Developer tooling أو وظيفة غير موجودة في عقد Commerce:
- خذ اللغة البصرية فقط حيث تنطبق؛
- أظهر boundary واضحة؛
- لا تنشئ fake data أو dead button أو mutation وهمية أو مصدر حقيقة ثانٍ.

الهوية الوحيدة:
الأغبري | Aghbari Commerce

ولا تنقل العامري أو أي هوية خارجية إلى المنتج.

## 6-A. REFERENCE DEDUPLICATION — لا تنفذ المرجع المكرر مرتين

الـ84 ملفًا هو عدد الملفات المرفوعة، وليس عدد الشاشات/التجارب الفريدة.

قد تحتوي الحزمة على:
- byte-identical duplicates؛
- visually equivalent screenshots؛
- نفس الشاشة/الحالة من لقطات مختلفة؛
- صورًا تعرض نفس component/pattern ضمن أكثر من شاشة.

قاعدة التنفيذ:
```text
DISCOVER
→ HASH / EXACT-DUP CHECK
→ VISUAL-EQUIVALENCE CHECK WHEN NEEDED
→ GROUP INTO REFERENCE PACKS
→ CHOOSE ONE IMPLEMENTATION TARGET
→ KEEP SOURCE REFERENCES FOR PROVENANCE
→ IMPLEMENT ONCE
→ VERIFY ALL ALIASED REFERENCES AGAINST THE SAME RESULT
```

- لا تنشئ شاشة أو component أو CSS أو route مرتين بسبب صورتين متطابقتين.
- لا تحذف الصورة المكررة لمجرد التوفير؛ احتفظ بالمصدر ما لم توجد بوابة retirement/duplicate موثقة.
- سجّل التكرار في `UI-REFERENCE-ASSET-INDEX.md` كسطر/pack مضغوط: `primary reference + aliases + route/state/viewport + implementation/proof`.
- إذا اختلفت الصور في viewport أو state أو content meaningful، فهي ليست duplicate حتى لو كان التخطيط متشابهًا.
- عند الشك، لا تحذف؛ صنّفها كـsame-family وراجع الفرق قبل الدمج.
- المطلوب النهائي ليس `84 implementations` بل **100% reference coverage مع أقل عدد صحيح من implementations الفريدة**.

ولا يجوز استخدام الـ84 كسبب لتضخيم backlog أو الذاكرة أو مساحة المستودع.

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

# 10-A. MISSING REQUIREMENTS / SPEC INTAKE — لا تسمح بفقد أي متطلب جديد

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

## 17-A. MAXIMUM CONTEXT / MESSAGE / STORAGE ECONOMY — بدون فقد المعرفة

هذه القاعدة مستقلة عن Resource Preservation وهي إلزامية للحفاظ على مساحة التنفيذ والإرسال.

### في المحادثة
- لا تُعد نشر النصوص أو الملفات أو القوائم الموجودة بالفعل.
- لا تُلصق dumps ضخمة أو logs كاملة؛ احتفظ فقط بالنتيجة، السبب، SHA، المرجع والدليل.
- لا تعِد شرح التاريخ أو closed work؛ استخدم canonical pointer.
- التحديثات أثناء التنفيذ = معلومة تنفيذية جديدة فقط.
- التقرير النهائي = compact: HEAD / changed / proven / open / blocker / resume.
- عند الحاجة إلى تفاصيل، استخدم reference للملف/السطر بدل إعادة المحتوى.

### داخل Git
~~~text
ONE CANONICAL MEMORY
ONE SPECIALIST DOC PER CONCERN
ONE UI REFERENCE INDEX
ONE COMPACT PROGRESS LEDGER
ONE LIVE STATE FILE
~~~
- لا تنشئ backlog أو memory system موازيًا.
- لا تنشئ Markdown لكل screenshot أو لكل gap.
- لا تكرر requirement نفسها في ملفات متعددة؛ اذكر المصدر واجعل authority في قسم واحد.
- لا تحفظ artifacts مؤقتة أو generated reports في Git.
- الصور المرجعية تُحفظ مرة واحدة فقط في docs/ui-reference/.

### قاعدة أصغر كتابة تثبت أكبر قدر
كل write-back يجب أن يضيف معلومة جديدة أو يصحح الواقع؛ غير ذلك = ضوضاء ومساحة مهدرة.

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

# 20-A. REQUIREMENT GAP INGESTION — لا تضيع المتطلبات الجديدة

إذا كشف التنفيذ أو المراجع أو legacy source عن Requirement/Constraint/Acceptance Criterion غير موجودة في الـcanonical system:

~~~text
DETECT → CLASSIFY → PLACE IN CORRECT CANONICAL SECTION
→ RECORD SOURCE → DECIDE IN-SCOPE / BOUNDARY
→ CREATE EXECUTABLE GAP ONLY IF IN-SCOPE
→ IMPLEMENT IN SAME EXECUTION WAVE WHEN PRACTICAL
→ VERIFY
~~~

التصنيف الإلزامي:
~~~text
PRODUCT / REQUIREMENTS → 01
UX / UI / EXPERIENCE   → 02
ARCHITECTURE / DATA    → 03
SECURITY / RELIABILITY → 04
QUALITY / RELEASE      → 05
MARKET / PORTFOLIO     → 06
EXECUTION HISTORY      → DEVELOPMENT-PROGRESS
CURRENT REALITY        → LATEST-EXECUTION-STATE
~~~

لا تُسجل المتطلبات الجديدة كقائمة منفصلة في المحادثة، ولا تُخفيها داخل comments أو logs فقط.

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

# 22. CURRENT RESUME POINTER — أمر تنفيذي قابل للتنفيذ فورًا

يجب أن تكون pointer التالية دائمًا أكثر تقدمًا من السابقة، وأن تحتوي فقط ما يحتاجه المبرمج للانطلاق دون إعادة تحقيق:

~~~text
START FROM ACTUAL CURRENT VERIFIED HEAD.

UI:
reference pack / exact route / exact missing state / relevant files

CORE:
exact contract gap / affected service-RPC-migration

SECURITY:
exact boundary / role / tenant / RPC / policy issue

QA:
exact test/proof still required

DEPLOY:
exact current blocker or free next executable path

DOCS:
exact canonical source still unmerged, if any

DO NOT REPEAT:
closed work unless evidence is invalidated.
~~~

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

# 25. FINAL ORDER — UI-FIRST + FULL PRODUCT CLOSURE

EXECUTE NOW.

~~~text
ACTUAL CURRENT HEAD
→ CURRENT RESUME POINTER
→ UI-FIRST OPEN GAP
→ REFERENCE + CANONICAL CAPABILITY MAP
→ REAL SCREEN / SUBVIEW
→ REAL STATES / ACTIONS
→ CUSTOMER + ADMIN COVERAGE
→ AFFECTED CORE / SECURITY DEPENDENCY
→ FOCUSED TEST + BROWSER / RUNTIME PROOF
→ EXACT-SHA PROOF
→ REQUIREMENT WRITE-BACK
→ COMPACT STATE WRITE-BACK
→ NEXT UI GAP
→ NEXT CORE/SECURITY GAP
→ CONTINUE
→ REAL ACTIONS / PERSISTENCE
→ TEST + TEST-THE-TEST
→ SECURITY / BROWSER / RUNTIME
→ EXACT-SHA PROOF
→ REQUIREMENT WRITE-BACK
→ COMPACT STATE WRITE-BACK
→ OPEN NEXT GAP
→ CONTINUE
~~~

## ممنوعات الإغلاق المبكر
- لا تعتبر route مكتملًا لمجرد أنه يفتح.
- لا تعتبر navigation أو component أو card إنجاز شاشة.
- لا تعتبر screenshot مطابقًا إذا كانت الوظيفة وهمية أو الحالات الأساسية ناقصة.
- لا تعتبر build أو CI بديلًا عن runtime/browser proof.
- لا تنقل evidence من SHA سابق.
- لا تعيد العمل المغلق دون سبب موثق.
- لا توقف UI بسبب backend غير متعلق بالسطح الحالي.
- لا تستخدم blocker خارجي مبررًا لترك باقي الـUI معلقًا.
- لا تنتظر المستخدم إلا في خطوة بشرية حقيقية بعد استنفاد البدائل المجانية العملية.
- لا تنفق موارد مدفوعة لمجرد إعادة محاولة blocker لم يتغير سببه.
- لا تنهِ الجلسة مع وجود UI gap واضح قابل للتنفيذ بينما توجد نتائج توثيقية فقط.

## Definition of Done
~~~text
FULL REFERENCE COVERAGE
+ FULL UNIQUE SCREEN / SUBVIEW COVERAGE
+ FULL ADMIN/STAFF UI
+ FULL CUSTOMER PORTAL
+ FULL NESTED STATES / ACTIONS
+ REAL DATA / PERSISTENCE
+ RESPONSIVE / ACCESSIBILITY
+ FULL CORE CLOSURE
+ SECURITY / RLS / RBAC
+ TEST-THE-TEST
+ BROWSER / RUNTIME
+ EXACT-SHA EVIDENCE
+ CANONICAL DOCUMENTATION
+ COMPACT RESUMABLE STATE
~~~

### Production
 HOLD / NO TOUCH حتى يكتمل exact-source evidence وجميع بوابات الإصدار المطلوبة.

# الأغبري ليس Demo.
# الأغبري منتج B2B جاد يجب أن يُغلق فعليًا، لا أن يبدو مغلقًا.

## 2026-09-30 — 84-reference full-product execution lock
- `docs/ui-reference/` is treated as a visual contract. First reconcile the registered 84 assets into canonical screen families/packs, then implement once per unique family and cover meaningful variants/states without duplicate screens.
- Closure target is not a page count: it is full Customer Storefront/Portal + full Admin/Staff Control Center + all applicable nested states/actions + exact-SHA proof.
- The storefront must be the commercial presentation surface; the admin dashboard must remain an operational control center. Never substitute one for the other.
