# الأغبري | EXECUTION START HERE

هذا الملف هو **نقطة الدخول السريعة**. المرجع التشغيلي الكامل موجود في:

`ops/AGHBARI-EXECUTION-CONTROL-PLANE.md`
على الفرع:
`ops/execution-control-plane`

## عند إرسال المستخدم `1`

نفّذ فورًا:
1. اقرأ Control Plane الكامل.
2. اقرأ أحدث Execution Log.
3. تحقق من CURRENT SHA وLIVE وPRODUCTION.
4. احصر فقط OPEN / BLOCKED / RUNNING / NOT_PROVEN.
5. ابدأ كل الجبهات المستقلة بالتوازي.
6. لا تعيد Front مغلقًا دون سبب invalidation.
7. لا تنشئ SHA جديدًا دون Defect مثبت.
8. احفظ كل نتيجة جديدة في Control Plane.
9. أنهِ الجولة بـ exact-SHA reconciliation.
10. أرسل تقرير خروج مختصر وفق القالب الموجود في Control Plane.

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
9. حدّث Control Plane بالحالة الجديدة.

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

## الأدوات

الأساس:
- GitHub
- Vercel
- Supabase

المسرعات عند توفر الاتصال:
- Firecrawl — متصل
- TinyFish — بانتظار اتصال المستخدم
- Codex Security — بانتظار اتصال المستخدم
- Datadog — بانتظار اتصال المستخدم
- PostHog — بانتظار اتصال المستخدم

## ملاحظة Vercel

Vercel يوفّر Protection Bypass for Automation عبر سرّ `VERCEL_AUTOMATION_BYPASS_SECRET`، ويُستخدم ضمن CI كسرّ، مع إبقاء حماية الـdeployment فعالة. لا يتم تجاوز الحماية يدويًا فقط لصناعة PASS.

**لا تعتبر هذا الملف بديلًا عن Control Plane الكامل. ابدأ دائمًا بقراءته.**
