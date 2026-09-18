# الأغبري | EXECUTION START HERE

هذا الملف هو **نقطة الدخول السريعة**. المرجع التشغيلي الكامل موجود في:

`ops/AGHBARI-EXECUTION-CONTROL-PLANE.md`
على الفرع:
`ops/execution-control-plane`

الحالة الحية المختصرة موجودة في:

`ops/AGHBARI-LATEST-EXECUTION-STATE.md`
على الفرع:
`ops/execution-control-plane`

**القاعدة: اقرأ الاثنين في بداية كل تشغيل؛ الـLatest State للحالة الحالية والـControl Plane للقواعد والتطورات.**

## عند إرسال المستخدم `1`

نفّذ فورًا:
1. اقرأ Control Plane الكامل.
2. اقرأ أحدث Execution Log.
3. تحقق من CURRENT SHA وLIVE وPRODUCTION.
4. احصر فقط OPEN / BLOCKED / RUNNING / NOT_PROVEN.
5. ابدأ كل الجبهات المستقلة بالتوازي.
6. لا تعيد Front مغلقًا دون سبب invalidation.
7. لا تنشئ SHA جديدًا دون Defect مثبت.
8. احفظ كل نتيجة جديدة أولًا في `ops/AGHBARI-LATEST-EXECUTION-STATE.md`.
9. طابق الحالة مع Control Plane، ثم أضف سجل الجولة المختصر إلى الاثنين عند الحاجة.
10. نفّذ exact-SHA reconciliation.
11. طوّر Control Plane في نفس الجولة إذا كشفت النتائج قاعدة أفضل أو نقصًا في الـproof/observability أو تغيرًا في الأدوات.
12. لا ترسل تقرير الخروج قبل حفظ الحالة الجديدة.

## عند إرسال المستخدم `2`

نفّذ فورًا:
1. اقرأ آخر تقرير للمبرمج إن كان موجودًا في المحادثة.
2. اقرأ Control Plane.
3. افحص GitHub/Vercel/Supabase والأدلة الحالية بدل الاعتماد على التقرير وحده.
4. أعد حساب الحالة الحقيقية.
5. اكشف أي stale PASS أو missing proof أو hidden blocker أو skipped front.
6. أطلق أقوى مسار تنفيذي ممكن على المتبقي، بالتوازي.
7. لا تعِد صياغة الأمر السابق شكليًا.
8. لا تسمح بـPASS غير مثبت.
9. حدّث Latest Execution State بالحالة الجديدة.
10. طوّر Control Plane في نفس الجولة إذا أثبتت النتائج حاجة مستدامة لتغيير القواعد أو الأولويات.
11. لا تُعد المستخدم إلى دور مدير ذاكرة؛ GitHub هو سجل الحالة.

## قواعد ثابتة

- `CODE ≠ TEST ≠ CI ≠ RUNTIME ≠ LIVE ≠ PRODUCTION`
- `IMPLEMENTED ≠ VERIFIED ≠ PROVEN ≠ CERTIFIED`
- PASS لا ينتقل بين SHAs.
- Production = NO TOUCH حتى تصدر مرحلة الإصدار قرارًا مستندًا إلى الأدلة.
- Live لا يستخدم كبديل عن candidate proof.
- لا secrets في المصدر أو السجلات أو Control Plane.
- العائق في أداة أو صلاحية يُسجل BLOCKED ويستمر العمل على جميع الجبهات الأخرى.
- عند فشل الاختبار، ابدأ بالـForensics والـobservability قبل اتهام Product Code.

## حالة المرجع الحالية

`CURRENT SHA = 466857aa0dd1062db380800e2d0b46dc4fb53075`
`LIVE SHA = efb30b3d23a7a9fcef22d028c33017eeab0855af`
`PRODUCTION = NO TOUCH`
`CERTIFICATION = NO`

## قاعدة الذاكرة والتطوير الذاتي

- لا تنتظر من المستخدم إعادة إرسال التقرير السابق.
- افحص `ops/AGHBARI-LATEST-EXECUTION-STATE.md` أولًا ثم الأدلة الفعلية.
- بعد كل جولة: احفظ آخر النتائج، ثم اسأل: ما الذي تعلمناه؟ ما القاعدة التي تمنع تكرار المشكلة؟ ما الخطوة التي يمكن جعلها متوازية أو آلية؟
- إذا وُجد تحسين مثبت، عدّل Control Plane وأضف سجل Evolution مختصرًا.
- لا تحذف التاريخ لإخفاء فشل؛ احتفظ بالحالة الحالية وسبب التغير.

## الأدوات

الأساس:
- GitHub
- Vercel
- Supabase

المسرعات المتصلة:
- Firecrawl — متصل
- TinyFish — متصل
- PostHog — متصل

أدوات بانتظار الاتصال:
- Codex Security
- Datadog

أدوات Proof/Security الموجودة في المشروع أو مسار الأدوات:
- Playwright — @playwright/test 1.63.0
- Gitleaks
- CodeQL
- Semgrep CE
- Trivy
- OWASP ZAP
- Dependabot
- OpenSSF Scorecard

## ملاحظة Vercel

Vercel يوفّر Protection Bypass for Automation عبر سرّ `VERCEL_AUTOMATION_BYPASS_SECRET`، ويُستخدم ضمن CI كسرّ، مع إبقاء حماية الـdeployment فعالة. لا يتم تجاوز الحماية يدويًا فقط لصناعة PASS.

**لا تعتبر هذا الملف بديلًا عن Control Plane الكامل. ابدأ دائمًا بقراءته.**
