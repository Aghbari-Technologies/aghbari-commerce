# 🔴 AGHBARI COMMERCE — MASTER BOOT ROUTER

> **This is the only launch message a new session needs.** It is intentionally short. It does not contain project memory; it forces the programmer to read the live memory chain in order.

## PROJECT
**Aghbari Commerce | الأغبري**

Repository: `Aghbari-Technologies/aghbari-commerce`

## 🔒 MANDATORY MEMORY CHAIN

Do **not** start from chat history. Start here, then follow the chain exactly:

```text
00 START / ROUTER
   ↓
01 CONTROL PLANE — rules, authority, proof, safety
   ↓
02 PROJECT MEMORY — PRODUCT SPECIFICATIONS + permanent decisions
   ↓
03 DEVELOPMENT PROGRESS — PROBLEMS / fixes / closures / historical evidence
   ↓
04 LATEST EXECUTION STATE — LATEST RESULTS / current blockers / next action
   ↓
05 CURRENT REALITY — verify GitHub / CI / Supabase / deployment / runtime as required
   ↓
06 EXECUTE — highest-priority unresolved front
```

### Exact files

**01 — Constitution**
`ops/AGHBARI-EXECUTION-CONTROL-PLANE.md`

Read first after this router. It defines the operating rules, decision authority, proof hierarchy, security, certification, production safety, and execution protocol.

**02 — Specifications / Permanent Memory**
`PROJECT_MEMORY.md`

Read next. This is the durable product and engineering specification: scope, architecture, UX standards, boundaries, decisions, constraints, and long-lived knowledge.

**03 — Problems / Progress Ledger**
`ops/AGHBARI-DEVELOPMENT-PROGRESS.md`

Read next. It carries the execution history as a compact problem/solution ledger: what was found, root cause, what changed, what was proven, what remains open, and why closed work must not be repeated.

**04 — Latest Results / Current Router**
`ops/AGHBARI-LATEST-EXECUTION-STATE.md`

Read last in the memory chain. It is the current checkpoint: exact SHA, branch, PR, candidate, production, latest evidence, active blockers, and the next executable front.

## 🔁 HANDOFF RULE

Each layer hands the next layer only the information it needs:

`RULES → SPECIFICATION → PROBLEMS/HISTORY → LATEST RESULTS → CURRENT REALITY → EXECUTION`

Do not create another memory system. Do not ask the owner to reconstruct history that is already stored here.

## 🔴 MASTER COMPLETION & PARALLEL EXECUTION DIRECTIVE — EVERY LAUNCH

هذا القسم إلزامي في **كل انطلاقة**:
1. استأنف من آخر `CURRENT RESUME POINTER` بعد التحقق من GitHub Exact HEAD؛ لا تبدأ من الصفر ولا تعيد تنفيذ المكتمل.
2. **UI/UX DEVELOPMENT IS MANDATORY IN EVERY LAUNCH.** في كل انطلاقة يجب فحص جميع Admin/Staff وCustomer Portal routes/views والصفحات الفرعية وdialogs/drawers/forms/tables/filters/search وجميع حالات loading/empty/error/success/disabled/permission/offline وDesktop/Tablet/Mobile. إذا وُجدت أي فجوة UI/UX أو حالة ناقصة، يجب تنفيذها في نفس الانطلاقة؛ لا يجوز تحويل الانطلاقة إلى تحقق/CI فقط ما دامت هناك فجوة واجهة قابلة للتنفيذ.
3. أول 120 دقيقة هي بوابة **FULL PRODUCT UI COVERAGE**: واجهات حقيقية راقية وقابلة للاستخدام، بلا placeholders أو أزرار وهمية أو بيانات مصطنعة لإخفاء النقص.
4. بالتوازي في كل انطلاقة: UI/UX Development + Core transactions + Security/Data integrity + QA/Browser/Test-the-Test + Deployment/Release proof + Performance/Resource preservation. لا تنتظر جبهة متوقفة بينما توجد جبهة مستقلة قابلة للتنفيذ.
5. كل متطلب canonical غير مكتمل في UI أو workflow هو **CORE PRODUCT GAP** ويجب فتحه وتنفيذه في نفس الانطلاقة ما لم يكن محجوبًا بقرار أعمال جوهري أو عائق تقني حقيقي.
6. لكل واجهة: `UI → State → Logic → API/RPC → Auth/RLS/Storage → Audit → Verification`. ممنوع الأزرار الوهمية والبيانات الاصطناعية لإخفاء النقص.
7. وفّر المساحة من المصدر: reuse للمكونات والأنماط والأصول، CSS/design-system قبل dependency جديد، caches/queues/storage bounded/deterministic، وتجنب تكرار CI/build/deploy والملفات والصور. لا تحذف بيانات تشغيلية أو مالية أو تدقيقية لتوفير المساحة.
8. لا PASS بلا دليل Exact-SHA؛ ولا تعِد فحص جبهة مثبتة إلا بسبب SHA/dependency/evidence/regression. لا تنقل دليلًا بين SHAs.
9. استخدم كل الصلاحيات والأدوات الممنوحة لك لاتخاذ وتنفيذ القرارات التقنية المفوضة، ولا تنتظر إذنًا تفصيليًا.
10. **بعد كل انطلاقة يجب حفظ النتائج إلزاميًا داخل GitHub**: حدّث `PROJECT_MEMORY.md` للقرارات/الدروس الدائمة فقط، و`ops/AGHBARI-DEVELOPMENT-PROGRESS.md` بسجل run مضغوط، و`ops/AGHBARI-LATEST-EXECUTION-STATE.md` بأحدث Exact HEAD والـevidence والـblockers والـCandidate/Production والـCURRENT RESUME POINTER. لا تعتبر الانطلاقة مكتملة إذا لم تُحفظ هذه الحالة.
11. **لا تقرير بدل التنفيذ:** نفّذ → اختبر → اثبت → سجّل → انتقل للجبهة التالية، حتى إغلاق أكبر قدر ممكن من العمل القابل للتنفيذ.

## 🎯 EXECUTE NOW

After the complete chain is read:

`READ → RECONCILE → IDENTIFY OPEN FRONTS → PRIORITIZE → IMPLEMENT UI + CORE → TEST → VERIFY → PROVE → UPDATE MEMORY → CONTINUE`

Do not reply with a new plan or repeat this protocol. **Execute.**

## 🔴 MANDATORY END GATE

No execution is complete until the existing live-memory files are updated:

1. `PROJECT_MEMORY.md` — only durable specifications/decisions/lessons.
2. `ops/AGHBARI-DEVELOPMENT-PROGRESS.md` — one compact run/problem/result record.
3. `ops/AGHBARI-LATEST-EXECUTION-STATE.md` — newest exact state, evidence, blockers, next action.

The next session must be able to resume from these files without asking what happened.

**USER COMMAND `1` = EXECUTE NOW.**
