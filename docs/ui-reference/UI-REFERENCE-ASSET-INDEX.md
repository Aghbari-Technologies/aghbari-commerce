# Aghbari Commerce — UI Reference Asset Index

> **Canonical visual reference source for Aghbari Commerce / الأغبري.**
> Current reference pack: **84 PNG screenshots** under this directory.

## 1. Role of this directory

هذا المجلد هو **مصدر المطابقة البصرية** للواجهات، وليس مصدرًا وظيفيًا أو Backend contract.

استخدم المراجع لبناء ومراجعة:
- Admin / Staff Command Center
- Orders / Customers / Catalog / Pricing
- Inventory / Warehouses / Purchasing / Receiving
- Finance / Import / Export / Governance / Settings
- Customer Portal / Storefront
- shared navigation, tables, cards, dialogs, drawers and responsive states

**كل صورة مرجعية = P0 بصريًا افتراضيًا** إلى أن تُصنّف صراحةً كغير ذلك.

## 2. Current reference pack

تمت إضافة 84 صورة إلى هذه الشجرة في commit:
`93b6fd2987ca670a07ebc0bc4449c5cbc550dfa7`

الأسماء الحالية محفوظة كما رُفعت. لا تعِد تسمية الملفات لمجرد التجميل، ولا تنشئ نسخة ثانية منها.

أمثلة ممثلة تمت مراجعتها بصريًا:
- `1.png`, `2.png`, `3.png` — لوحة التحكم وشجرة النظام والـrail.
- `لقطة شاشة 2026-08-06 150354.png` — قائمة الطلبات وسير الحالات.
- `لقطة شاشة 2026-08-06 150421.png` — تفاصيل الطلب والتقدم المرحلي.
- `لقطة شاشة 2026-08-06 151523.png` — سجل عمليات الاستيراد.
- `لقطة شاشة 2026-08-06 153435.png` — تقرير المبيعات.
- `لقطة شاشة 2026-08-06 153758.png` — حالة خدمات النظام.
- `لقطة شاشة 2026-08-06 154115.png` — واجهة الأصناف/العروض.
- `لقطة شاشة 2026-08-06 154245.png` — إعدادات الملكية والإشعارات.
- `لقطة شاشة 2026-08-06 154358.png` — واجهة تكامل Onyx.
- `لقطة شاشة 2026-08-06 154438.png` — سجل عمليات المزامنة.
- `لقطة شاشة 2026-08-06 154521.png` — أدوات المطور/الإعدادات.

هذه الأمثلة لا تلغي بقية الـ84 صورة؛ **كل pack كامل يدخل في visual audit**.

## 3. Visual contract

عند مطابقة أي P0 reference، يجب الحفاظ على ما ينطبق من:

```text
Page composition
Information hierarchy
RTL reading order
Header/topbar hierarchy
Contextual right-side navigation
Grouped panels
Rounded operational cards
Compact pill actions
KPI/summary cards
Dense but readable tables
Status badges
Breadcrumbs
Quick actions
Progressive disclosure
Dialogs / drawers
Loading / empty / error / success / disabled states
Desktop / tablet / mobile behavior
Keyboard focus / accessibility
```

المرجع يحدد **شكل التجربة**.  
العقد canonical يحدد **وظيفة التجربة**.

## 4. Brand boundary

المراجع قد تحتوي على تسميات تاريخية أو هوية مختلفة. لا تنقلها حرفيًا إلى المنتج.

الهوية الوحيدة للتطبيق:
**الأغبري | Aghbari Commerce**

ولا يجوز أن يؤدي أي screenshot إلى إعادة إدخال:
- العامري كاسم منتج؛
- Report-Advisor / Report-Engainall logic؛
- AI/BI/Onyx/Developer AI transactional logic؛
- Promotions أو أي feature بلا canonical Commerce contract.

يمكن إعادة استخدام **الأسلوب البصري** لهذه الأجزاء، لكن لا تُختلق وظائف أو بيانات أو mutations غير مدعومة.

## 5. Asset storage law

المجلد نفسه هو **النسخة المرجعية الوحيدة**.

ممنوع:

```text
docs/ui-reference → src/
docs/ui-reference → public/
docs/ui-reference → dist/
duplicate image copies
duplicate export packs
image-to-base64 bundles
temporary image copies in test artifacts
```

الصور المرجعية لا تدخل production bundle ما لم توجد حاجة runtime حقيقية مثبتة.

## 6. Mapping without document bloat

لا تنشئ Markdown مستقلًا لكل صورة.

استخدم هذا الملف لتسجيل:
- screen family؛
- route؛
- state؛
- viewport؛
- priority؛
- implementation status.

عند الحاجة، أنشئ **صفًا واحدًا لكل screen pack** بدل تكرار 20–80 صفًا للمكونات نفسها.

## 7. Naming

للمراجع الجديدة:

```text
<area>__<screen>__<state>__<viewport>__<sequence>.<ext>
```

مثال:
```text
admin__orders__details__desktop__01.png
customer__catalog__default__mobile__01.png
shared__table__filters__tablet__01.png
```

حافظ على الأسماء التاريخية الموجودة دون إعادة تسمية غير ضرورية.

## 8. Visual implementation procedure

```REFERENCE
→ EXTRACT SHARED VISUAL PRIMITIVES
→ REUSE EXISTING COMPONENTS
→ IMPLEMENT SCREEN
→ IMPLEMENT STATES
→ CONNECT REAL ACTIONS
→ CHECK RESPONSIVE
→ VISUAL COMPARE
→ EXACT-SHA VERIFY
```

لا تبدأ بتكرار CSS لكل صفحة.

أولًا أصلح:
- design tokens؛
- shared primitives؛
- common cards;
- common pills;
- common tables;
- common dialogs/drawers;
- common responsive rules.

ثم طبّقها على الصفحات.

## 9. Evidence

لأي شاشة P0 مكتملة بصريًا:

```Reference image
+
Route
+
Viewport
+
State
+
Implementation screenshot
+
Exact source SHA
```

ولا يكفي:
`route renders`

ولا يكفي:
`build passes`

ولا يكفي:
`looks similar`

## 10. Completion status

الشاشة تعتبر مكتملة عندما يكون:

```VISUAL MATCH
+
REAL INTERACTION
+
REAL STATE
+
REAL PERSISTENCE (where applicable)
+
SERVER AUTHORIZATION
+
TEST COVERAGE
+
RUNTIME/BROWSER PROOF
+
EXACT-SHA EVIDENCE
```

## 11. Space preservation

عند إضافة أي reference أو visual evidence:

**اسأل قبل الإضافة: هل هذه نسخة جديدة ضرورية فعلًا؟**

الأولوية:

```REUSE
→ LINK / REFERENCE
→ DEDUPLICATE
→ COMPRESS ONLY WHEN QUALITY REMAINS ACCEPTABLE
→ STORE ONCE
```

لا تحذف صورًا مرجعية لمجرد أنها قديمة. احذف/ادمج فقط بعد تحقق أنها duplicate أو بعد بوابة retirement موثقة.

## 12. Working rule for the programmer

ابدأ بالمراجع الحالية مباشرة.

لا تنتظر مصدرًا جديدًا.

لا تحول الصور إلى قائمة تحليلية طويلة.

استخدمها كمصدر تنفيذ واختبار، وأنهِ أكبر قدر ممكن من **in-scope live UI** في كل جلسة بالتوازي مع CORE/SECURITY/QA.

