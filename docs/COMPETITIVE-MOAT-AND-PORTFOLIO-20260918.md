# الأغبري | Competitive Moat & Portfolio System — 2026-09-18

> الهدف ليس تقليد ERP/SaaS كبير بإضافة عدد لا نهائي من الصفحات. الهدف هو بناء **تفوق قابل للإثبات** في B2B commerce والأنظمة التشغيلية العربية: أسرع، أوضح، أكثر موثوقية، أسهل في الترحيل والتكامل، وأقوى في البرهان على الجودة.

## 1. Strategic position

الأغبري لا ينافس العمالقة على breadth وحده.

نموذج التميز المستهدف:

**Niche depth + operational speed + trust/evidence + Arabic/RTL excellence + migration/integration readiness + production reliability**

المنتج يجب أن يجعل العميل يشعر أنه يحصل على:
- workflow فعلي وليس dashboard فقط؛
- نتائج أسرع من مشروع ERP ثقيل؛
- بيانات موثوقة يمكن تتبع مصدرها؛
- تجربة عربية أصلية؛
- طريق واضح من Excel/Onyx/أنظمته القديمة إلى النظام؛
- تكاملات لا تتحول إلى مصدر أعطال؛
- إمكانية إثبات ما تم بناؤه وتشغيله.

## 2. Competitive moat pillars

| ID | Moat | ما الذي نفعله | لماذا يصعب تقليده بسرعة |
|---|---|---|---|
| MOAT-01 | Evidence-First Product | كل capability مهمة لها proof trail: implementation → tests → adversarial → runtime → release | يجمع الهندسة مع البرهان بدل claims تسويقية |
| MOAT-02 | Trust Layer | provenance لمصدر السعر/المخزون/الحالة، audit history، actor/tenant/correlation | يزيد الثقة ويقلل النزاعات التشغيلية |
| MOAT-03 | Fast B2B Order OS | catalog/search → unit → qty → price tier → cart → reorder/template → submit | قيمة تشغيلية يومية مباشرة بدل تعقيد ERP |
| MOAT-04 | Arabic/RTL First | RTL عميق في الجداول/forms/dialogs/mobile/printing مع UX عربية أصلية | لا يعتمد على ترجمة سطحية |
| MOAT-05 | Low-Bandwidth / Offline Discipline | cache/draft/queue bounded + reconnect/revalidate، دون جعل offline مصدر الحقيقة | مناسب لبيئات الاتصال غير المستقرة |
| MOAT-06 | Migration Bridge | Excel/legacy/Onyx ingestion: quarantine → mapping → validation → preview → commit → reconciliation | يخفض كلفة الانتقال ويحوّل الاستيراد إلى onboarding advantage |
| MOAT-07 | Customer-Specific Commerce | tiered pricing، MOQ، credit، customer-specific controls | يترجم business rules إلى تجربة شراء حقيقية |
| MOAT-08 | Multi-Branch Inventory | branches/warehouses + scoped stock + concurrency/no-oversell | يتعامل مع الواقع التشغيلي للتوزيع |
| MOAT-09 | Operations Command Center | approvals، exceptions، sync failures، orders awaiting action، operational alerts | يركز الإدارة على العمل المطلوب |
| MOAT-10 | Integration Reliability | typed contracts، outbox، idempotency، retry/backoff، terminal failure، delivery status | يجعل التكاملات قابلة للتشغيل لا مجرد connectors |
| MOAT-11 | Takeover-Ready Codebase | architecture boundaries، tests، migrations، decision records، proof artifacts | مناسب لعملاء لديهم codebase قائم أو مولد بالذكاء الاصطناعي |
| MOAT-12 | Portfolio-as-Evidence | case studies مبنية على evidence packs، screenshots، test reports، architecture proof | يجيب على سؤال العميل: "أين الدليل؟" |
| MOAT-13 | Demo/Trial Data Safety | sanitized demo tenant، resettable seed، no secrets، no customer PII | يسمح بعرض حي من دون تعريض بيانات حقيقية |
| MOAT-14 | Recovery & Operability | failure states، retry visibility، rollback/recovery runbooks، observability | يميّز المنتج التشغيلي عن prototype |
| MOAT-15 | API/Data Portability | versioned exports، canonical identifiers، documented integration contracts | يقلل lock-in ويجعل النظام أصلًا طويل العمر |
| MOAT-16 | AI-with-Boundaries | AI مساعد في التشغيل/الأتمتة فقط حيث يضيف قيمة؛ BI/forecasting/decision stays in Report-Advisor | يمنع ازدواجية المنتج ويحافظ على وضوح المسؤوليات |

## 3. Killer workflows

يجب أن نصمم ونثبت workflows كاملة بدل تجميع features منفصلة:

### Workflow A — First Order
Sign in → catalog → search SKU/barcode → choose unit → quantity → customer price → cart → submit → order status → audit.

### Workflow B — Repeat Buyer
Previous order → reorder → stock validation → tier price → cart → submit.

### Workflow C — Excel Customer
Upload → quarantine → parse → SKU match → unmatched review → validation → preview → commit → receipt/audit.

### Workflow D — Warehouse
Order queue → reserve/prepare → stock mutation → conflict prevention → shipment state → audit.

### Workflow E — New Tenant
Create organization → users/roles → customer policy → catalog/pricing rules → seed/import → first order → operational visibility.

### Workflow F — Failed Integration
Business action → outbox → retry → provider error → visible failure → replay/idempotency → final delivery or terminal state.

## 4. Product "wow" features worth prioritizing

هذه ليست إضافات تجميلية؛ تُنفذ عندما تتوافق مع architecture and evidence:

1. **Command Palette:** تنفيذ أوامر إدارية سريعة، بحث global، انتقال مباشر، actions scoped by permission.
2. **Bulk Action Center:** تحديث أسعار/حالات/مخزون/طلبات دفعة واحدة مع preview + authorization + audit.
3. **Smart Reorder:** اقتراح إعادة الطلب اعتمادًا على تاريخ العميل/القواعد التشغيلية، دون تحويله إلى BI.
4. **Barcode-first operations:** scanning-friendly catalog/order/warehouse workflows.
5. **Explainable business state:** عند عرض السعر/المخزون/حالة الطلب، يستطيع المستخدم معرفة "لماذا هذه القيمة؟" من المصدر/القاعدة المناسبة.
6. **Conflict Center:** شاشة واضحة لحالات التعارض في المزامنة والاستيراد والأوامر بدل أخطاء غامضة.
7. **Recovery Center:** retry/replay للعمليات الآمنة، مع idempotency status.
8. **Tenant onboarding wizard:** إعداد مؤسسة جديدة بسرعة وبخطوات قابلة للقياس.
9. **Saved Views:** فلاتر/أعمدة/ترتيب محفوظ بحسب دور المستخدم.
10. **Keyboard-first desktop workflow:** اختصارات للفئات المهنية التي تعمل ساعات طويلة على النظام.
11. **Progressive disclosure:** لا نعرض تعقيد ERP للمستخدم الذي لا يحتاجه.
12. **Customer communication timeline:** تجميع حالات الطلب والرسائل/الإشعارات في timeline عملي عندما يتم اعتماد messaging integration.
13. **Sanitized Demo Mode:** بيانات تجريبية واقعية مع reset سريع للعرض والمقابلات.
14. **Capability Cards:** لكل وظيفة سوقية، صفحة case study مختصرة تربط المشكلة → الحل → الإثبات.

## 5. Performance as a feature

في سوق الأعمال، "سريع" يعني إتمام المهمة بسرعة.

نقيس:
- time-to-first-product;
- time-to-search-result;
- time-to-add-to-cart;
- time-to-repeat-order;
- import preview time;
- admin bulk-action completion;
- perceived responsiveness on low-bandwidth connections.

لا نضع أرقامًا تسويقية قبل القياس الفعلي.

## 6. Trust UX

الثقة يجب أن تظهر في الواجهة نفسها:

- مصدر القيمة؛
- آخر تحديث معروف؛
- حالة المزامنة؛
- حالة العملية؛
- من نفذها؛
- إمكانية إعادة المحاولة عندما تكون آمنة؛
- سبب الرفض/التعارض؛
- ما إذا كانت العملية committed أو queued أو failed.

هذا يحول حالات الفشل من "رسالة خطأ" إلى "حالة تشغيل مفهومة".

## 7. Anti-feature discipline

لا نضيف:
- BI clone داخل الأغبري؛
- عشرات widgets لا تساعد workflow؛
- AI chat لمجرد وجود LLM في السوق؛
- تكاملات مدفوعة بلا business case؛
- features خاصة بعميل واحد داخل core product؛
- modules لا يمكن إثباتها أو تشغيلها reliably.

أي feature جديدة يجب أن تربح واحدًا من:
**Revenue / Retention / Workflow Speed / Trust / Migration / Integration / Reliability / Security**

وإلا تبقى في backlog.

## 8. Portfolio evidence standard

كل case study تجاري يجب أن يحتوي:

`PROBLEM → CONTEXT → ARCHITECTURE → IMPLEMENTATION → SECURITY → TESTS → ADVERSARIAL → RUNTIME → RESULT → LIMITATIONS`

ويجب أن تكون الادعاءات مساوية لقوة الأدلة:
- screenshot = visual proof only;
- test = test-layer proof;
- runtime = runtime proof;
- production = production proof.

## 9. Market differentiation hierarchy

عند تنافسنا على وظيفة، نبرز بالترتيب:

1. **Problem-specific evidence**
2. **Relevant Aghbari workflow**
3. **Security/data/reliability depth**
4. **Production proof**
5. **Arabic/RTL/localization**
6. **Integration/migration readiness**
7. **Stack match**

هذا يمنع الوقوع في سباق "من يكتب أسماء تقنيات أكثر".

## 10. 90-day build-to-market direction

### Phase A — Proof Foundation
إغلاق runtime/deployment blockers + إنشاء sanitized demo + case-study evidence.

### Phase B — Operational Differentiation
Command Palette + Bulk Actions + Conflict Center + Recovery Center + barcode-first flows.

### Phase C — Migration/Integration Moat
Hardened Excel/legacy/Onyx bridge + webhooks/outbox + delivery/replay evidence.

### Phase D — Commercialization
تحويل capabilities إلى case studies، proposal templates، milestone packages، pricing hypotheses، funnel measurement.

## 11. North-star rule

**لا نسأل: كم feature عند الأغبري؟**

نسأل:

**كم workflow تجاري مهم يستطيع الأغبري إنجازه أسرع، بأمان أعلى، وبشرح أوضح، وبإثبات أقوى من prototype تقليدي؟**

هذا هو معيار المنافسة الحقيقي.
