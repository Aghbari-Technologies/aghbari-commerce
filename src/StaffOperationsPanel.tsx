import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { filterAudit, filterOutbox, outboxLifecycle, redactAuditMetadata, redactSensitiveText, type AuditRow, type OutboxRow } from './domain/operations';
import RecordDetailDrawer from './RecordDetailDrawer';

type Tab = 'audit' | 'outbox';

const RESULT_LABELS: Record<AuditRow['result'], string> = {
  success: 'نجاح',
  failure: 'فشل',
  denied: 'مرفوض',
};

const OUTBOX_LABELS: Record<OutboxRow['status'], string> = {
  pending: 'معلّق',
  processing: 'قيد التنفيذ',
  delivered: 'تم التسليم',
  dead: 'فشل نهائي',
};

export default function StaffOperationsPanel() {
  const [tab, setTab] = useState<Tab>('audit');
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [outboxRows, setOutboxRows] = useState<OutboxRow[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<'all' | AuditRow['result']>('all');
  const [status, setStatus] = useState<'all' | OutboxRow['status']>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditRow | null>(null);
  const [selectedOutbox, setSelectedOutbox] = useState<OutboxRow | null>(null);

  const reload = useCallback(async () => {
    if (!supabase) {
      setError('خدمة البيانات غير متاحة.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (tab === 'audit') {
        const { data, error: auditError } = await supabase
          .from('audit_events')
          .select('id,action,target_type,target_id,result,correlation_id,metadata,created_at')
          .order('created_at', { ascending: false })
          .limit(120);
        if (auditError) throw auditError;
        setAuditRows((data ?? []) as AuditRow[]);
      } else {
        const { data, error: outboxError } = await supabase
          .from('outbox_events')
          .select('id,aggregate_type,aggregate_id,event_type,status,attempts,available_at,locked_until,last_error,created_at,delivered_at')
          .order('created_at', { ascending: false })
          .limit(120);
        if (outboxError) throw outboxError;
        setOutboxRows((data ?? []) as OutboxRow[]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل بيانات الحوكمة والتكاملات.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => { setPage(1); }, [tab, query, result, status]);

  const auditVisible = useMemo(() => filterAudit(auditRows, query, result), [auditRows, query, result]);
  const outboxVisible = useMemo(() => filterOutbox(outboxRows, query, status), [outboxRows, query, status]);
  const activeRows = tab === 'audit' ? auditVisible : outboxVisible;
  const pages = Math.max(1, Math.ceil(activeRows.length / 10));
  const activePage = Math.min(page, pages);
  const pagedRows = activeRows.slice((activePage - 1) * 10, activePage * 10);

  function changeTab(next: Tab) {
    setTab(next);
    setQuery('');
    setPage(1);
  }

  return (
    <>
      <section className="content-card operations-panel" id="admin-governance" aria-busy={loading}>
        <div className="section-title">
          <div>
            <span className="eyebrow">Governance</span>
            <h2>التدقيق والتكاملات</h2>
          </div>
          <span>{tab === 'audit' ? `${auditVisible.length}/${auditRows.length}` : `${outboxVisible.length}/${outboxRows.length}`}</span>
        </div>

        <div className="ops-metrics-strip" aria-label="ملخص الحوكمة">
          <article><small>التدقيق</small><strong>{auditRows.length.toLocaleString('ar')}</strong><span>سجل أحداث</span></article>
          <article><small>نجاحات</small><strong>{auditRows.filter(row => row.result === 'success').length.toLocaleString('ar')}</strong><span>عمليات ناجحة</span></article>
          <article><small>مرفوضة</small><strong>{auditRows.filter(row => row.result === 'denied').length.toLocaleString('ar')}</strong><span>محاولات مرفوضة</span></article>
          <article><small>Outbox</small><strong>{outboxRows.length.toLocaleString('ar')}</strong><span>أحداث تكامل</span></article>
        </div>

        <div className="operations-tabs" role="tablist" aria-label="حوكمة التشغيل">
          <button type="button" role="tab" aria-selected={tab === 'audit'} className={tab === 'audit' ? 'active' : ''} onClick={() => changeTab('audit')}>سجل التدقيق</button>
          <button type="button" role="tab" aria-selected={tab === 'outbox'} className={tab === 'outbox' ? 'active' : ''} onClick={() => changeTab('outbox')}>صندوق التكاملات</button>
          <button type="button" className="ghost" onClick={() => void reload()} disabled={loading}>إعادة تحميل</button>
        </div>

        <div className="operations-toolbar">
          <input aria-label={tab === 'audit' ? 'بحث سجل التدقيق' : 'بحث صندوق التكاملات'} placeholder={tab === 'audit' ? 'بحث بالإجراء أو الهدف أو النتيجة…' : 'بحث بالحدث أو التجميع أو الخطأ…'} value={query} onChange={event => setQuery(event.target.value)} />
          {tab === 'audit' ? (
            <select aria-label="نتيجة التدقيق" value={result} onChange={event => setResult(event.target.value as 'all' | AuditRow['result'])}>
              <option value="all">كل النتائج</option>
              <option value="success">نجاح</option>
              <option value="failure">فشل</option>
              <option value="denied">مرفوض</option>
            </select>
          ) : (
            <select aria-label="حالة التكامل" value={status} onChange={event => setStatus(event.target.value as 'all' | OutboxRow['status'])}>
              <option value="all">كل الحالات</option>
              <option value="pending">معلّق</option>
              <option value="processing">قيد التنفيذ</option>
              <option value="delivered">تم التسليم</option>
              <option value="dead">فشل نهائي</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="portal-loading" role="status">جارٍ تحميل بيانات التشغيل…</div>
        ) : error ? (
          <div className="empty-state">
            <strong>تعذر تحميل البيانات.</strong>
            <span>{error}</span>
            <button type="button" onClick={() => void reload()}>إعادة المحاولة</button>
          </div>
        ) : tab === 'audit' ? (
          !auditVisible.length ? (
            <div className="empty-state"><strong>لا توجد سجلات مطابقة.</strong><span>سجل التدقيق للعمليات المصرح برؤيتها سيظهر هنا.</span></div>
          ) : (
            <>
              <div className="operations-list">
                {(pagedRows as AuditRow[]).map(row => (
                  <article className="operation-record" key={row.id}>
                    <div><strong>{row.action}</strong><small>{row.target_type}{row.target_id ? ' · ' + row.target_id : ''}</small></div>
                    <span className={'operation-result ' + row.result}>{RESULT_LABELS[row.result]}</span>
                    <time>{new Date(row.created_at).toLocaleString('ar-YE')}</time>
                    <button type="button" className="ghost" onClick={() => setSelectedAudit(row)}>عرض التفاصيل</button>
                  </article>
                ))}
              </div>
              <div className="directory-pagination" aria-label="صفحات سجل التدقيق">
                <span>صفحة {activePage} / {pages} · {auditVisible.length} سجل</span>
                <div>
                  <button type="button" className="ghost" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={activePage === 1}>السابق</button>
                  <button type="button" className="ghost" onClick={() => setPage(current => Math.min(pages, current + 1))} disabled={activePage === pages}>التالي</button>
                </div>
              </div>
            </>
          )
        ) : !outboxVisible.length ? (
          <div className="empty-state"><strong>لا توجد أحداث تكامل مطابقة.</strong><span>الأحداث الخارجية والطابور التشغيلي يظهران هنا وفق صلاحية الحساب.</span></div>
        ) : (
          <>
            <div className="operations-list">
              {(pagedRows as OutboxRow[]).map(row => (
                <article className="operation-record" key={row.id}>
                  <div><strong>{row.event_type}</strong><small>{row.aggregate_type + ' · ' + row.aggregate_id}</small></div>
                  <span className={'operation-result ' + row.status}>{OUTBOX_LABELS[row.status]}</span>
                  <small className="operation-lifecycle">{({ pending: 'في الانتظار', retrying: 'إعادة محاولة مجدولة', retryable: 'جاهز لإعادة المحاولة', processing: 'قيد التنفيذ', delivered: 'تم التسليم', terminal: 'نهائي' } as Record<string, string>)[outboxLifecycle(row)]}</small>
                  <time>{'محاولات: ' + row.attempts + ' · ' + new Date(row.created_at).toLocaleString('ar-YE')}</time>
                  {row.last_error && <details className="operation-error"><summary>تفاصيل الخطأ المقيد</summary><pre>{redactSensitiveText(row.last_error)}</pre></details>}
                  <button type="button" className="ghost" onClick={() => setSelectedOutbox(row)}>عرض التفاصيل</button>
                </article>
              ))}
            </div>
            <div className="directory-pagination" aria-label="صفحات صندوق التكاملات">
              <span>صفحة {activePage} / {pages} · {outboxVisible.length} سجل</span>
              <div>
                <button type="button" className="ghost" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={activePage === 1}>السابق</button>
                <button type="button" className="ghost" onClick={() => setPage(current => Math.min(pages, current + 1))} disabled={activePage === pages}>التالي</button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedAudit && (
        <RecordDetailDrawer
          eyebrow="Governance / Audit"
          title={selectedAudit.action}
          summary={RESULT_LABELS[selectedAudit.result]}
          fields={[
            { label: 'الهدف', value: selectedAudit.target_type + (selectedAudit.target_id ? ' · ' + selectedAudit.target_id : '') },
            { label: 'النتيجة', value: RESULT_LABELS[selectedAudit.result] },
            { label: 'Correlation ID', value: selectedAudit.correlation_id ?? 'غير متاح' },
            { label: 'التاريخ', value: new Date(selectedAudit.created_at).toLocaleString('ar-YE') },
            { label: 'المعرف', value: selectedAudit.id },
            { label: 'البيانات المقيدة', value: JSON.stringify(redactAuditMetadata(selectedAudit.metadata), null, 2), wide: true },
          ]}
          onClose={() => setSelectedAudit(null)}
        />
      )}

      {selectedOutbox && (
        <RecordDetailDrawer
          eyebrow="Governance / Outbox"
          title={selectedOutbox.event_type}
          summary={OUTBOX_LABELS[selectedOutbox.status]}
          fields={[
            { label: 'Aggregate', value: selectedOutbox.aggregate_type + ' · ' + selectedOutbox.aggregate_id },
            { label: 'الحالة', value: OUTBOX_LABELS[selectedOutbox.status] },
            { label: 'دورة التسليم', value: ({ pending: 'في الانتظار', retrying: 'إعادة محاولة مجدولة', retryable: 'جاهز لإعادة المحاولة', processing: 'قيد التنفيذ', delivered: 'تم التسليم', terminal: 'نهائي' } as Record<string, string>)[outboxLifecycle(selectedOutbox)] },
            { label: 'المحاولات', value: selectedOutbox.attempts },
            { label: 'متاح منذ', value: new Date(selectedOutbox.available_at).toLocaleString('ar-YE') },
            { label: 'تم التسليم', value: selectedOutbox.delivered_at ? new Date(selectedOutbox.delivered_at).toLocaleString('ar-YE') : 'لم يتم' },
            { label: 'آخر خطأ', value: selectedOutbox.last_error ? redactSensitiveText(selectedOutbox.last_error) : 'لا يوجد', wide: true },
            { label: 'المعرف', value: selectedOutbox.id, wide: true },
          ]}
          onClose={() => setSelectedOutbox(null)}
        />
      )}
    </>
  );
}
