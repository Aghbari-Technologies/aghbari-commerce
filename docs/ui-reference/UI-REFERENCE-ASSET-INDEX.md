# Aghbari Commerce — UI Reference Asset Index

> **Canonical visual reference source for Aghbari Commerce / الأغبري.**
> Current reference pack: **84 PNG screenshots** under this directory.

## 1. Role of this directory

هذا المجلد هو **مصدر إلهام ومقارنة بصري** للواجهات، وليس مصدرًا وظيفيًا أو Backend contract أو قائمة شاشات مطلوبة.

استخدم المراجع لبناء ومراجعة:
- Admin / Staff Command Center
- Orders / Customers / Catalog / Pricing
- Inventory / Warehouses / Purchasing / Receiving
- Finance / Import / Export / Governance / Settings
- Customer Portal / Storefront
- shared navigation, tables, cards, dialogs, drawers and responsive states

**لا تعني أي صورة منفردة شاشة مطلوبة أو P0 تنفيذية بحد ذاتها.** تُرفع أولوية المرجع فقط عندما يتطابق نمطه مع قدرة Canonical داخل الأغبري.

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

هذه الأمثلة توضح نوع المادة المرجعية فقط. لا يلزم تنفيذ كل صورة؛ تتم مراجعة الصور بحسب قدرتها على كشف pattern مفيد أو variant مؤثر على تجربة الأغبري.

## 3. Visual contract

عند استخدام مرجع بصري ذي صلة بقدرة الأغبري، يجب الحفاظ على ما ينطبق من:

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

عند الحاجة، أنشئ **صفًا واحدًا لكل visual pack** بدل تكرار 20–80 صفًا للمكونات نفسها.

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

## 13. Mandatory 84-reference coverage gate

The 84 current PNGs must all be accounted for without creating 84 separate documents.

Use one compact row per screen pack with:
reference(s) | area | route/surface | view/state | viewport | contract/boundary | implementation | proof

A pack is not closed while any member reference is unclassified, visually unimplemented, or lacking an explicit boundary decision.

Reference review may discover missing product/UX/security/quality requirements. Such requirements must be routed into the corresponding canonical document; this index records the visual source and coverage, not a parallel requirements authority.

## 14. Execution economy

Do not repeat screenshots, crops, reports, comparisons or local artifacts when an existing proof already answers the same question. Generate new visual evidence only when it closes a distinct gap, changed SHA, changed viewport/state, or invalidated evidence.

## 15. Reference equivalence / duplicate rule — 2026-09-27

الـ84 PNG تمثل files/reference inputs، وليست 84 implementations.

عند اكتشاف duplicate أو visually equivalent reference:
```text
PRIMARY REFERENCE
+ ALIASED REFERENCES
→ ONE IMPLEMENTATION TARGET
→ ONE SHARED COMPONENT / SCREEN WHEN APPLICABLE
→ ONE PROOF SET THAT EXPLAINS ALL ALIASES
```

لا تُكرر التنفيذ لمجرد اختلاف اسم الملف.
لا تحذف النسخ المكررة تلقائيًا؛ يحافظ عليها المصدر ما لم تُعتمد بوابة retirement.
استخدم packs لتقليل مساحة الذاكرة والتوثيق، مع الحفاظ على provenance الكامل.


## 16. Fast-path visual processing — 2026-09-27

Do not inspect every file independently when the same screen family/state is already represented.

```text
EXACT HASH DUPLICATE → VISUAL EQUIVALENCE → SCREEN PACK → UNIQUE IMPLEMENTATION TARGET → ALIASES / PROVENANCE
```

Once a reference is proven equivalent to an implemented pack, do not rebuild or restyle the same target. Verify the alias against the existing result and move forward.

Read screenshots only for decisions that affect layout, hierarchy, state, interaction, responsive behavior, accessibility or scope boundary.

## 17. Compact visual-provenance register — 2026-09-28

All 84 current PNG references are accounted for exactly once in the code-level registry at `src/structure/ui-reference-packs.ts`. The registry is a provenance/visual-pattern index only; it does not represent Aghbari screen count or implementation count.

| Visual provenance pack | Assets | Existing Aghbari surface / reference target | Interpretation |
|---|---:|---|---|
| Command Center | 5 | Admin Command Center / `#admin-dashboard` | LIVE |
| Sales & Orders | 20 | Orders, customers and operational details / `#admin-orders` | LIVE |
| Data & Imports | 7 | Import, reconciliation and data operations / `#admin-import` | LIVE |
| Inventory | 18 | Inventory, movements, count, transfers and warehouses / `#admin-inventory` | LIVE |
| Analytics / AI | 13 | External/advanced analytics references / `#admin-boundaries` | BOUNDARY |
| Health / Governance | 7 | Audit, outbox, notifications and unsupported health surfaces / `#admin-governance` | MIXED |
| Catalog / Settings | 9 | Catalog, presentation settings and unsupported historical offers / `#admin-catalog` | MIXED |
| Integrations / Developer | 5 | Onyx, integration and Developer-AI references / `#admin-boundaries` | BOUNDARY |

**Coverage invariant:** 8 packs / 84 references / 84 unique filenames. The automated contract test `src/structure/ui-reference-packs.test.ts` also verifies every registered filename resolves to an existing tracked PNG under this directory.

**Important:** classification and implementation mapping are not final visual/browser proof. Final P0 closure still requires reference + route/surface + state + viewport + exact source SHA + implementation browser evidence, as defined by the canonical UX/QA documents.

## 17. External visual corpus interpretation — 2026-09-28

**Important correction:** the 84 PNG files are visual references captured from another application/context. They are **not** an Aghbari screen inventory and must never be interpreted as 84 product screens, 84 required routes, or 84 required features.

Use them in this order:

```
REFERENCE CORPUS
→ EXACT DUPLICATE / VISUAL EQUIVALENCE
→ SHARED VISUAL PATTERN
→ IN-SCOPE AGHBARI CAPABILITY
→ EXISTING SCREEN / COMPONENT
→ IMPLEMENT ONLY THE MISSING DELTA
```

Visual patterns that are reusable include composition, hierarchy, RTL layout, dense tables, cards, pills, navigation rails, dialogs/drawers, responsive behavior and state presentation.

A reference that shows functionality outside the Aghbari Commerce canonical product contract remains **visual inspiration only**. Its behavior must not be copied into Commerce.

The registry in `src/structure/ui-reference-packs.ts` exists for provenance/accounting of the supplied assets. Its 84-count is **not a UI completion metric**. Completion is determined by the canonical capability map plus route/state/action/persistence/authorization/test/runtime evidence.

### 17.1 Implementation metric

The primary UI completion metric is:

```
CANONICAL AGHBARI CAPABILITIES
→ ADMIN/STAFF SURFACES
→ CUSTOMER PORTAL SURFACES
→ NESTED STATES
→ REAL ACTIONS
→ RESPONSIVE + ACCESSIBLE UX
→ EXACT-SHA BROWSER PROOF
```

The reference corpus is a supporting visual input, not the denominator.

### 17.2 Duplicate/equivalence rule

Multiple supplied images may describe the same underlying visual family, state or layout from the source application. Do not create duplicate Aghbari screens because filenames differ.

Keep provenance, but collapse implementation through:

```
PRIMARY VISUAL FAMILY
+
ALIASES / EQUIVALENTS
→ ONE SHARED IMPLEMENTATION
```

Do not claim visual equivalence automatically without evidence. When equivalence is uncertain, keep the assets grouped as references and inspect only the variants that can change implementation decisions.

**The previous 8-pack registry is therefore a provenance grouping, not a claim that Aghbari has exactly 8 screen families.**

## 17.3 UI-FIRST CLOSURE GATE — 2026-09-28

The reference registry is not itself completion. During the active UI closure wave, every visual pack must resolve to one of:

IMPLEMENTED
→ actual Commerce screen/subview/state with real actions

BOUNDARY
→ explicit canonical reason the referenced behavior is outside Commerce

OPEN
→ exact implementation gap with target surface and next executable action

A pack cannot be marked complete because:
- a route exists;
- a registry row exists;
- a generic card/table was added;
- a screenshot merely resembles the reference;
- build/CI passes.

For every in-scope pack, the closure record must identify:

PRIMARY REFERENCE
→ ALIASES / EQUIVALENTS
→ AGHBARI SURFACE
→ PARENT SECTION
→ SUBVIEW / STATE
→ VIEWPORT
→ REAL ACTIONS
→ CONTRACT / SERVICE
→ IMPLEMENTATION
→ TEST
→ BROWSER / RUNTIME PROOF
→ EXACT SHA

When execution discovers a capability that has no logical parent, create a new logical section/route under the canonical UI/product structure rather than attaching it to an unrelated page.

When a visual reference reveals a new requirement not represented in the existing canonical contract, route that requirement into the correct canonical owner and implement it in the same closure wave when it is in scope.

The 84-image corpus remains provenance input, but 100% accounting is mandatory and 100% of in-scope visual families must have an implementation or an explicit documented boundary.
