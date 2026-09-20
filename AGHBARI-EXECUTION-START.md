# 🔴 الأغبري | EXECUTION START / MASTER BOOT

> **Command 1 = EXECUTE NOW.**
>
> هذا الملف هو بوابة التشغيل السريعة. المنتج المستهدف هو **Aghbari Commerce | الأغبري** فقط.
> لا تخلط المشروع مع Report-Advisor أو أي مشروع آخر.

## BOOT SEQUENCE — إلزامي

ابدأ فورًا من:

`AGHBARI-EXECUTION-START.md`

ثم اتبع سلسلة الذاكرة الحية **بالترتيب**:

`CONTROL PLANE → PROJECT MEMORY → DEVELOPMENT PROGRESS → LATEST EXECUTION STATE → CURRENT REALITY → EXECUTE`

اقرأ كل طبقة، سلّم معلوماتها للطبقة التالية، ثم تحقق من الواقع الحالي من GitHub + Deployment + Database + Browser/Visual Evidence + CI عند الحاجة.

استخدم أحدث حالة فعلية مثبتة كنقطة استئناف، وليس ذاكرة المحادثة أو افتراضات قديمة.

## EXECUTION LOOP

`READ → RECONCILE → IMPLEMENT → TEST → VERIFY → PROVE → RECORD → CONTINUE`

لا تتوقف عند التحليل، ولا تستبدل التنفيذ بخطة، ولا تنتظر قرارًا تقنيًا يمكن اتخاذه بأمان كمالك تقني للمشروع.

## 🔴 PRODUCT / UI QUALITY MANDATE — غير قابل للتجاوز

**الأغبري ليس Prototype ولا CRUD بدائيًا ولا لوحة كروت تجميلية.**

المرجع الأدنى لجودة الواجهات هو **منتج B2B/ERP تجاري حقيقي** من مستوى الصورة المرجعية التي اعتمدها صاحب المشروع:
- Information Architecture واضحة.
- Header / Navigation / Sidebar احترافية.
- تصميم RTL عربي متماسك.
- Visual hierarchy قوية.
- كثافة معلومات مناسبة لأعمال التجار.
- جداول تشغيل حقيقية، حالات، إجراءات، فلاتر، بحث، تفاصيل، ونوافذ عمل.
- بطاقات مؤشرات عند الحاجة فقط، وليست هي المنتج.
- رسوم بيانية تشغيلية فقط عندما تخدم قرارًا أو متابعة فعلية.
- حالات Loading / Empty / Error / Success / Disabled / Permission / Offline مكتملة.
- Forms وdialogs وdrawers وconfirmation flows مصممة كمنتج، لا كحقول متفرقة.
- Responsive حقيقي للـDesktop/Tablet/Mobile.
- Typography, spacing, grid, icons, colors, borders, shadows, states موحدة عبر Design System واحد.
- Accessibility وkeyboard/focus states وعدم كسر RTL.
- بيانات معروضة من الحقيقة التشغيلية؛ **ممنوع اختلاق أرقام أو مؤشرات أو بيانات لإظهار الشاشة أجمل**.
- صور المنتجات والأصول البصرية تستخدم عندما تكون جزءًا طبيعيًا من التجربة.
- لا يوجد نص مؤقت، Placeholder مصطنع، شاشة فارغة، أو رابط شكلي يوهم بأن وظيفة حقيقية موجودة وهي غير موجودة.

### UI COMPLETION GATE

لا تعتبر أي شاشة مكتملة لمجرد:
- أن Component موجود.
- أن TypeScript يترجم.
- أن Build ينجح.
- أن Route يفتح.
- أن SQL يعمل.

تُعتبر الشاشة **مكتملة فقط** عندما:
1. تُنفّذ الوظيفة الحقيقية المرتبطة بها.
2. تُعرض بصريًا بمستوى المنتج المطلوب.
3. تعمل على Desktop وMobile.
4. تتعامل مع Loading / Empty / Error / Success / Permission states.
5. تكون منسجمة مع Design System وباقي التطبيق.
6. تُختبر في Browser على الـExact SHA.
7. يوجد Evidence قابل للتحقق يثبت النتيجة.

**أي واجهة أقل بوضوح من مستوى المنتج المرجعي = NOT COMPLETE، ويجب رفع مستواها فعليًا قبل الانتقال.**

## 🎯 REQUIRED PRODUCT SURFACES

افحص وطوّر جميع الأسطح المطلوبة، لا الشاشة الرئيسية فقط:

### 1) الدخول والهوية
- Login
- Session / logout
- Invitation acceptance
- Permission-aware entry

### 2) الإدارة / Control Plane
- Executive home
- Sales
- Orders & order workflow
- Purchasing
- Inventory / warehouses / transfers / stock count
- Customers & traders
- Suppliers
- Accounting / finance / customer statements
- Product & category management
- Pricing by customer tier
- Import / export
- Product images
- Client UI controls
- System settings
- Roles / permissions
- Audit-sensitive operational flows

### 3) بوابة العميل B2B
- Catalog
- Search / categories
- Product detail / pricing tiers / stock visibility
- Quick order
- Excel order
- Cart
- Quantity confirmation
- Payment method selection
- Checkout / order submission
- Orders history
- Reorder
- Saved order templates
- Financial center / statement
- Responsive/mobile purchasing flow

### 4) Product polish
- Consistent shell
- Empty/loading/error/success states
- Notifications/toasts where appropriate
- Confirmation dialogs for sensitive actions
- Keyboard navigation
- Mobile drawer/navigation behavior
- Arabic/RTL language quality
- Performance-sensitive rendering
- No visual regressions between modules

## 🎨 DESIGN RULE

التصميم يجب أن يكون **موحدًا عبر التطبيق كله**.

عند تطوير شاشة جديدة:
`DISCOVER CURRENT DESIGN → EXTEND DESIGN SYSTEM → IMPLEMENT → VISUAL VERIFY`

ممنوع أن يكون لكل Component أسلوبه الخاص أو ألوانه ومسافاته وحدوده بمعزل عن بقية التطبيق.

الهدف ليس نسخ الصورة المرجعية حرفيًا؛ الهدف هو الوصول إلى **نفس مستوى النضج التشغيلي والبصري** مع هوية الأغبري ووظائفه الحقيقية.

## 🧪 VISUAL VERIFICATION — إلزامي

بعد أي تغيير UI جوهري:
- افتح التطبيق على Exact SHA.
- اختبر الشاشة الرئيسية والمسار المتأثر.
- خذ Screenshot فعلي.
- افحص Console errors وblank/error overlays.
- اختبر Desktop وMobile عند الحاجة.
- لا تستخدم وصفًا لفظيًا بدل screenshot.
- لا تكتب PASS دون Evidence.

عند تشغيل Dev Server، استخدم Browser verification ولا تعتبر بدء الخادم دليلًا على سلامة الواجهة.

## 🔐 ENGINEERING / SECURITY / EVIDENCE RULES

ممنوع:
- إعادة العمل المثبت.
- خلط Aghbari مع أي مشروع آخر.
- نقل Evidence أو PASS بين SHAs.
- استخدام SHA مختصر عندما يلزم Exact SHA.
- اعتبار HEAD = merge-ref.
- اعتبار CI = Production.
- اعتبار SQL = Browser.
- اعتبار Build = Deployment.
- اعتبار Deployment = User-facing PASS.
- PASS بدون دليل.
- لمس Certification Candidate المجمد أو Production خارج قواعد الإصدار.
- اختراع نجاحات أو بيانات أو Screenshots غير فعلية.
- تجاوز صلاحيات الخادم من أجل جعل الواجهة تعمل.

## 🚀 EXECUTION BEHAVIOR

عند وجود أكثر من جبهة، اعمل بالتوازي عند الإمكان.

رتّب العمل حسب:
`BLOCKED / NOT_PROVEN / BROKEN / CORE PRODUCT GAP / UI QUALITY GAP / POLISH`

أصلح السبب الجذري، لا العرض فقط.

لا تكرر Full Scan بلا داعٍ. استخدم dependency-aware checks.

لا تعتبر "أنجزت" حتى:
`IMPLEMENTED + TESTED + VERIFIED + PROVEN + RECORDED`

## 🧠 LIVE MEMORY — إلزامي

قبل إنهاء **كل انطلاقة** حدّث الذاكرة الحية، وخصوصًا:

- `PROJECT_MEMORY.md`
- `ops/AGHBARI-DEVELOPMENT-PROGRESS.md`
- `ops/AGHBARI-LATEST-EXECUTION-STATE.md`

يجب أن تحتوي الذاكرة على:
- Exact HEAD / Exact SHA.
- ما تم تنفيذه.
- ما تم اختباره.
- Evidence IDs / runs / deployments عند الحاجة.
- ما لم يُثبت بعد.
- سبب أي Blocker.
- أعلى Resume Pointer التالي.
- أي قرار معماري/منتجي جديد.
- حالة UI quality للجبهات المتأثرة.

لا تكتب Logs ضخمة؛ سجّل الأدلة المختصرة القابلة للتحقق.

## 🛑 RELEASE BOUNDARIES

- لا تعدّل Certification Candidate المجمد إلا وفق قواعد الإصدار.
- Production = **NO TOUCH** افتراضيًا إلا عندما تكون قواعد الإصدار تسمح صراحة.
- لا تجعل ضغط Deployment أو Free-tier سببًا لتخفيض جودة المنتج.
- استخدم البدائل المجانية/المتاحة عندما تكون آمنة وملائمة.
- لا تغير Commerce truth من أجل Reporting؛ Reporting يبقى عبر boundary/gateway المنضبط.

## COMMAND

`1` = **EXECUTE NOW / RUN THE PROJECT**

عند استلام `1`:
**اقرأ → تحقق → نفّذ → اختبر → اثبت → حدّث الذاكرة → انتقل للجبهة التالية.**

لا ترجع برسالة تخبرني ماذا ستفعل.
**افعل العمل.**

# EXECUTE NOW.
