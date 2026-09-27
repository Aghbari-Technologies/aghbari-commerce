import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  pendingOfflineOperations,
  removeOfflineOperation,
  retryOfflineOperationNow,
  type OfflineOperation
} from './services/offlineQueue';
import { syncOfflineCart } from './services/cart';
import './offline-recovery.css';

type RecoveryFilter = 'all' | 'problems';

function label(operation: OfflineOperation): string {
  if (operation.state === 'conflicted') return 'تعارض يحتاج مراجعة';
  if (operation.state === 'terminal') return 'فشل نهائي';
  if (operation.state === 'retrying') return 'إعادة محاولة مجدولة';
  return 'مؤجلة بأمان';
}

function explanation(operation: OfflineOperation): string {
  if (operation.state === 'conflicted') return 'تعارض في البيانات؛ لم تتم إعادة العملية تلقائيًا حتى لا تتكرر عملية قديمة.';
  if (operation.state === 'terminal') return operation.lastFailureCode === 401 || operation.lastFailureCode === 403
    ? 'تم رفض الوصول أو انتهت صلاحية الصلاحية. حدّث الجلسة أو الصلاحيات ثم راجع العملية قبل أي إعادة إرسال.'
    : 'رفض الخادم العملية ولا تتم إعادة التشغيل تلقائيًا.';
  if (operation.state === 'retrying') return 'تعذر الاتصال مؤقتًا؛ يمكن طلب إعادة محاولة آمنة الآن عند توفر الاتصال.';
  return 'عملية سلة محفوظة محليًا وتنتظر المزامنة مع الخادم.';
}

function isRetryable(operation: OfflineOperation): boolean {
  return operation.state === 'queued' || operation.state === 'retrying';
}

export default function OfflineRecoveryPanel({
  userId,
  alwaysVisible = false
}: {
  userId: string | null;
  alwaysVisible?: boolean;
}) {
  const [rows, setRows] = useState<OfflineOperation[]>([]);
  const [filter, setFilter] = useState<RecoveryFilter>('problems');
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setRows(userId ? pendingOfflineOperations(userId) : []);
  }, [userId]);

  useEffect(() => {
    reload();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, 4000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reload]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const problems = useMemo(
    () => rows.filter((row) => row.state === 'conflicted' || row.state === 'terminal'),
    [rows]
  );
  const retryable = useMemo(() => rows.filter(isRetryable), [rows]);
  const visible = filter === 'problems' ? problems : rows;

  async function synchronize() {
    if (!userId || !online || syncing) return;
    setSyncing(true);
    setActionError(null);
    try {
      await syncOfflineCart();
      reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'تعذر مزامنة العمليات الآمنة.');
    } finally {
      setSyncing(false);
      reload();
    }
  }

  async function retryNow(operationId: string) {
    if (!userId || !online || syncing) return;
    setSyncing(true);
    setActionError(null);
    try {
      retryOfflineOperationNow(operationId, userId);
      await syncOfflineCart();
      reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'تعذر إعادة محاولة العملية.');
    } finally {
      setSyncing(false);
      reload();
    }
  }

  function remove(operationId: string) {
    setActionError(null);
    removeOfflineOperation(operationId);
    reload();
  }

  if (!rows.length && !alwaysVisible) return null;

  return (
    <section
      className="offline-recovery-panel"
      aria-labelledby="offline-recovery-title"
      aria-busy={syncing}
    >
      <div className="section-title">
        <div>
          <span className="eyebrow">Recovery Center</span>
          <h2 id="offline-recovery-title">مركز التعارض والاسترداد</h2>
          <p>عمليات السلة الآمنة فقط؛ المصدر الخادمي يظل صاحب القرار النهائي.</p>
        </div>
        <span>
          {problems.length
            ? problems.length + ' تحتاج إجراء'
            : rows.length
              ? rows.length + ' عمليات مؤجلة'
              : 'لا توجد عمليات معلقة'}
        </span>
      </div>

      <div className="offline-recovery-summary">
        <span>كل العمليات: {rows.length}</span>
        <span>مشكلات: {problems.length}</span>
        <span>جاهزة للمزامنة: {retryable.length}</span>
      </div>

      <div className="offline-recovery-toolbar" role="tablist" aria-label="فلترة حالة العمليات">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'problems'}
          className={filter === 'problems' ? 'active' : ''}
          onClick={() => setFilter('problems')}
        >
          المشكلات ({problems.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          كل العمليات
        </button>
        <button type="button" className="ghost" onClick={reload} disabled={syncing}>
          تحديث
        </button>
        <button type="button" onClick={() => void synchronize()} disabled={!userId || !online || !retryable.length || syncing}>
          {syncing ? 'جارٍ المزامنة…' : 'مزامنة العمليات الآمنة'}
        </button>
      </div>

      {!online && (
        <div className="offline-recovery-notice" role="status">
          الجهاز غير متصل. لا يمكن تشغيل المزامنة الآن؛ ستبقى العمليات محفوظة محليًا.
        </div>
      )}

      {actionError && (
        <div className="error-banner" role="alert">
          <span>{actionError}</span>
          <button type="button" className="ghost" onClick={() => setActionError(null)}>
            إغلاق
          </button>
        </div>
      )}

      {!visible.length ? (
        <div className="empty-state">
          <strong>{filter === 'problems' ? 'لا توجد مشكلات معلقة.' : 'لا توجد عمليات في الطابور.'}</strong>
          <span>
            {filter === 'problems'
              ? 'عند وجود تعارض أو فشل نهائي سيظهر هنا مع إجراء المراجعة المناسب.'
              : 'ستظهر عمليات السلة المؤجلة هنا قبل مزامنتها مع الخادم.'}
          </span>
        </div>
      ) : (
        <div className="offline-recovery-list">
          {visible.map((operation) => (
            <article key={operation.operationId}>
              <div>
                <strong>{label(operation)}</strong>
                <small>
                  {operation.type === 'cart:set_item' ? 'تحديث كمية السلة' : 'إزالة صنف من السلة'}
                  {' · '}
                  {new Date(operation.createdAt).toLocaleString('ar-YE')}
                  {' · '}
                  {operation.attempts} محاولات
                </small>
              </div>
              <p>{explanation(operation)}</p>
              <div className="offline-recovery-actions">
                {isRetryable(operation) && (
                  <button
                    type="button"
                    onClick={() => void retryNow(operation.operationId)}
                    disabled={!online || syncing}
                  >
                    إعادة المحاولة الآن
                  </button>
                )}
                {(operation.state === 'conflicted' || operation.state === 'terminal') && (
                  <button type="button" className="ghost" onClick={() => remove(operation.operationId)}>
                    إزالة من الطابور
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
