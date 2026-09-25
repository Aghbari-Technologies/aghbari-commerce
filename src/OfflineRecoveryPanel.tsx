import { useCallback, useEffect, useMemo, useState } from 'react';
import { pendingOfflineOperations, removeOfflineOperation, type OfflineOperation } from './services/offlineQueue';
import './offline-recovery.css';

type RecoveryFilter = 'all' | 'problems';

function label(operation: OfflineOperation): string {
  if (operation.state === 'conflicted') return 'تعارض يحتاج مراجعة';
  if (operation.state === 'terminal') return 'فشل نهائي';
  if (operation.state === 'retrying') return 'إعادة محاولة مجدولة';
  return 'مؤجلة';
}

function explanation(operation: OfflineOperation): string {
  if (operation.state === 'conflicted') return 'تعارض في البيانات؛ لم تتم إعادة العملية تلقائيًا حتى لا تتكرر عملية قديمة.';
  if (operation.state === 'terminal') return operation.lastFailureCode === 401 || operation.lastFailureCode === 403 ? 'تم رفض الوصول أو انتهت صلاحية الصلاحية. حدّث الجلسة أو الصلاحيات ثم راجع العملية قبل أي إعادة إرسال.' : 'رفض الخادم العملية ولا تتم إعادة التشغيل تلقائيًا.';
  if (operation.state === 'retrying') return 'تعذر الاتصال مؤقتًا؛ ستتم إعادة المحاولة وفق تأخير محدود.';
  return 'عملية سلة محفوظة محليًا بانتظار الاتصال بالخادم.';
}

export default function OfflineRecoveryPanel({ userId }: { userId: string | null }) {
  const [rows, setRows] = useState<OfflineOperation[]>([]);
  const [filter, setFilter] = useState<RecoveryFilter>('problems');

  const reload = useCallback(() => {
    setRows(userId ? pendingOfflineOperations(userId) : []);
  }, [userId]);

  useEffect(() => {
    reload();
    const timer = window.setInterval(reload, 4000);
    return () => window.clearInterval(timer);
  }, [reload]);

  const problems = useMemo(() => rows.filter((row) => row.state === 'conflicted' || row.state === 'terminal'), [rows]);
  const visible = filter === 'problems' ? problems : rows;

  if (!rows.length) return null;

  return <section className="offline-recovery-panel" aria-labelledby="offline-recovery-title">
    <div className="section-title">
      <div><span className="eyebrow">Recovery Center</span><h2 id="offline-recovery-title">مركز التعارض والاسترداد</h2><p>حالات السلة المحلية فقط؛ المصدر الخادمي يظل صاحب القرار النهائي.</p></div>
      <span>{problems.length ? problems.length + ' تحتاج إجراء' : rows.length + ' عمليات مؤجلة'}</span>
    </div>
    <div className="offline-recovery-summary"><span>كل العمليات: {rows.length}</span><span>مشكلات: {problems.length}</span><span>إعادة محاولة: {rows.filter((row) => row.state === 'retrying').length}</span></div>
    <div className="offline-recovery-toolbar" role="tablist" aria-label="فلترة حالة العمليات">
      <button type="button" role="tab" aria-selected={filter === 'problems'} className={filter === 'problems' ? 'active' : ''} onClick={() => setFilter('problems')}>المشكلات ({problems.length})</button>
      <button type="button" role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>كل العمليات</button>
      <button type="button" className="ghost" onClick={reload}>تحديث</button>
    </div>
    {!visible.length ? <div className="empty-state"><strong>لا توجد مشكلات معلقة.</strong><span>ستظهر التعارضات أو حالات الفشل هنا عند الحاجة.</span></div> : <div className="offline-recovery-list">
      {visible.map((operation) => <article key={operation.operationId}>
        <div><strong>{label(operation)}</strong><small>{operation.type === 'cart:set_item' ? 'تحديث كمية السلة' : 'إزالة صنف من السلة'} · {new Date(operation.createdAt).toLocaleString('ar-YE')}</small></div>
        <p>{explanation(operation)}</p>
        {(operation.state === 'conflicted' || operation.state === 'terminal') && <button type="button" className="ghost" onClick={() => { removeOfflineOperation(operation.operationId); reload(); }}>إزالة من الطابور</button>}
      </article>)}
    </div>}
  </section>;
}
