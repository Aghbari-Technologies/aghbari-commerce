import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSession } from './services/auth';
import { supabase } from './lib/supabase';
import {
  canMarkNotificationRead,
  filterNotifications,
  type NotificationKind,
  type NotificationRow,
} from './domain/operations';
import RecordDetailDrawer from './RecordDetailDrawer';
import './operations.css';

type Audience = 'customer' | 'staff';

const KINDS: Array<{ key: 'all' | NotificationKind; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'order', label: 'طلبات' },
  { key: 'inventory', label: 'مخزون' },
  { key: 'security', label: 'أمان' },
  { key: 'system', label: 'نظام' },
  { key: 'task', label: 'مهام' },
];

const KIND_LABELS: Record<NotificationKind, string> = {
  order: 'طلب',
  inventory: 'مخزون',
  security: 'أمان',
  system: 'نظام',
  task: 'مهمة',
};

const PAGE_SIZE = 10;

function NotificationRowView({
  row,
  audience,
  actorId,
  busyId,
  bulkBusy,
  onOpenDetail,
  onMarkRead,
}: {
  row: NotificationRow;
  audience: Audience;
  actorId: string | null;
  busyId: string | null;
  bulkBusy: boolean;
  onOpenDetail: (row: NotificationRow) => void;
  onMarkRead: (row: NotificationRow) => void;
}) {
  const canRead = canMarkNotificationRead(row, audience, actorId);
  const icon = row.kind === 'order' ? '↗' : row.kind === 'inventory' ? '▣' : row.kind === 'security' ? '!' : row.kind === 'task' ? '✓' : '•';

  return (
    <article className={row.read_at ? 'notification-row read' : 'notification-row'}>
      <div className="notification-icon" aria-hidden="true">{icon}</div>
      <div className="notification-body">
        <div className="notification-head">
          <strong>{row.title}</strong>
          <span>{KIND_LABELS[row.kind]}</span>
        </div>
        <p>{row.body}</p>
        <small>{new Date(row.created_at).toLocaleString('ar-YE')}</small>
      </div>
      <div className="notification-actions">
        <button
          type="button"
          className="ghost notification-detail"
          onClick={() => onOpenDetail(row)}
        >
          التفاصيل
        </button>
        {canRead ? (
          <button
            type="button"
            className="ghost notification-read"
            disabled={busyId === row.id || bulkBusy}
            onClick={() => onMarkRead(row)}
          >
            {busyId === row.id ? 'جارٍ التحديث…' : 'تحديد كمقروء'}
          </button>
        ) : !row.read_at ? (
          <span className="notification-state">موجّه تشغيليًا</span>
        ) : null}
      </div>
    </article>
  );
}

export default function NotificationPanel({ audience }: { audience: Audience }) {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | NotificationKind>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [actorId, setActorId] = useState<string | null>(null);
  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!supabase) throw new Error('خدمة البيانات غير متاحة.');
    const session = await getSession();
    const userId = session?.user.id ?? null;
    setActorId(userId);
    if (!userId) throw new Error('انتهت جلسة الحساب.');
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('notifications')
        .select('id,kind,title,body,entity_type,entity_id,read_at,recipient_user_id,customer_id,created_at')
        .order('created_at', { ascending: false })
        .limit(80);
      if (queryError) throw queryError;
      setRows((data ?? []) as NotificationRow[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل الإشعارات.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPage(1);
  }, [query, kind, unreadOnly]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const visible = useMemo(
    () => filterNotifications(rows, query, kind, unreadOnly),
    [rows, query, kind, unreadOnly],
  );

  const unreadCount = rows.filter((row) => !row.read_at).length;
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const activePage = Math.min(page, pages);
  const paged = visible.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const actionable = paged.filter((row) => !row.read_at && canMarkNotificationRead(row, audience, actorId));

  async function markRead(row: NotificationRow) {
    if (!supabase || !canMarkNotificationRead(row, audience, actorId)) return;
    setBusyId(row.id);
    setError(null);
    const readAt = new Date().toISOString();
    try {
      const { error: updateError } = await supabase.rpc('mark_notification_read', {
        p_notification_id: row.id,
      });
      if (updateError) throw updateError;
      setRows((current) => current.map((item) => (
        item.id === row.id ? { ...item, read_at: readAt } : item
      )));
      setSelected((current) => current?.id === row.id ? { ...current, read_at: readAt } : current);
      window.dispatchEvent(new CustomEvent('aghbari:notifications-changed'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحديث حالة الإشعار.');
    } finally {
      setBusyId(null);
    }
  }

  function exportCurrent() {
    if (!visible.length) return;
    const headers = ['التاريخ', 'النوع', 'العنوان', 'الحالة', 'المستلم', 'معرّف الكيان'];
    const rows = visible.map((row) => [
      new Date(row.created_at).toLocaleString('ar-YE'),
      KIND_LABELS[row.kind],
      row.title,
      row.read_at ? 'مقروء' : 'غير مقروء',
      row.recipient_user_id ?? '',
      row.entity_id ?? '',
    ]);
    const csv = '\ufeff' + [headers, ...rows]
      .map((row) => row.map((value) => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'aghbari-notifications-' + audience + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function markVisibleRead() {
    if (!supabase || !actionable.length || bulkBusy) return;
    setBulkBusy(true);
    setError(null);
    const readAt = new Date().toISOString();
    const completed: string[] = [];
    try {
      for (const row of actionable) {
        const { error: updateError } = await supabase.rpc('mark_notification_read', {
          p_notification_id: row.id,
        });
        if (updateError) throw updateError;
        completed.push(row.id);
      }
      const ids = new Set(completed);
      setRows((current) => current.map((item) => (
        ids.has(item.id) ? { ...item, read_at: readAt } : item
      )));
      setSelected((current) => current && ids.has(current.id) ? { ...current, read_at: readAt } : current);
      window.dispatchEvent(new CustomEvent('aghbari:notifications-changed'));
    } catch (cause) {
      const ids = new Set(completed);
      if (completed.length) {
        setRows((current) => current.map((item) => (
          ids.has(item.id) ? { ...item, read_at: readAt } : item
        )));
      }
      setError(cause instanceof Error ? cause.message : 'تعذر تحديد الإشعارات الظاهرة كمقروءة.');
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <section
      id="admin-notifications"
      className="content-card operations-panel"
      aria-busy={loading}
    >
      <div className="section-title">
        <div>
          <span className="eyebrow">التنبيهات والتشغيل</span>
          <h2>{audience === 'staff' ? 'إشعارات مركز التشغيل' : 'إشعارات الحساب'}</h2>
        </div>
        <span>{unreadCount} غير مقروء</span>
      </div>

      <div className="operations-toolbar">
        <input
          aria-label="بحث الإشعارات"
          placeholder="بحث في العنوان أو المحتوى…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          aria-label="نوع الإشعار"
          value={kind}
          onChange={(event) => setKind(event.target.value as 'all' | NotificationKind)}
        >
          {KINDS.map((item) => (
            <option key={item.key} value={item.key}>{item.label}</option>
          ))}
        </select>
        <label className="inline-toggle">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) => setUnreadOnly(event.target.checked)}
          />
          غير مقروء فقط
        </label>
        <button
          type="button"
          className="ghost"
          onClick={exportCurrent}
          disabled={loading || bulkBusy || !visible.length}
        >
          تصدير CSV
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => void markVisibleRead()}
          disabled={loading || bulkBusy || !actionable.length}
        >
          {bulkBusy ? 'جارٍ تحديث الظاهر…' : `قراءة الظاهر (${actionable.length})`}
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => void reload()}
          disabled={loading || bulkBusy}
        >
          إعادة تحميل
        </button>
      </div>

      {loading ? (
        <div className="notification-loading-skeleton" role="status" aria-label="جارٍ تحميل الإشعارات">
          {Array.from({ length: 5 }).map((_, index) => (
            <article key={index}>
              <span className="notification-loading-icon" />
              <div><i /><i /><small /></div>
              <b />
            </article>
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <strong>تعذر تحميل الإشعارات.</strong>
          <span>{error}</span>
          <button type="button" onClick={() => void reload()}>إعادة المحاولة</button>
        </div>
      ) : !visible.length ? (
        <div className="empty-state">
          <strong>لا توجد إشعارات مطابقة.</strong>
          <span>
            {unreadOnly
              ? 'لا توجد إشعارات غير مقروءة ضمن المرشح الحالي.'
              : 'ستظهر هنا التنبيهات التشغيلية التي يحق للحساب الاطلاع عليها.'}
          </span>
        </div>
      ) : (
        <div className="notification-list">
          {paged.map((row) => (
            <NotificationRowView
              key={row.id}
              row={row}
              audience={audience}
              actorId={actorId}
              busyId={busyId}
              bulkBusy={bulkBusy}
              onOpenDetail={setSelected}
              onMarkRead={markRead}
            />
          ))}
        </div>
      )}

      <div className="directory-pagination">
        <span>صفحة {activePage} / {pages} · {visible.length} إشعار</span>
        <div>
          <button
            type="button"
            className="ghost"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={activePage === 1 || bulkBusy}
          >
            السابق
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => setPage((value) => Math.min(pages, value + 1))}
            disabled={activePage === pages || bulkBusy}
          >
            التالي
          </button>
        </div>
      </div>

      {selected && (
        <RecordDetailDrawer
          eyebrow={audience === 'staff' ? 'Notifications · Operations' : 'Notifications · Customer'}
          title={selected.title}
          summary={KIND_LABELS[selected.kind]}
          fields={[
            { label: 'النوع', value: KIND_LABELS[selected.kind] },
            { label: 'الحالة', value: selected.read_at ? 'مقروء' : 'غير مقروء' },
            { label: 'التاريخ', value: new Date(selected.created_at).toLocaleString('ar-YE') },
            { label: 'الكيان', value: selected.entity_type ?? '—' },
            { label: 'معرّف الكيان', value: selected.entity_id ?? '—' },
            { label: 'نص الإشعار', value: selected.body, wide: true },
            { label: 'المستلم', value: selected.recipient_user_id ?? '—' },
            { label: 'معرّف العميل', value: selected.customer_id ?? '—' },
          ]}
          onClose={() => setSelected(null)}
        />
      )}

      {error && !loading && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" className="ghost" onClick={() => void reload()} disabled={bulkBusy}>
            إعادة تحميل الإشعارات
          </button>
        </div>
      )}
    </section>
  );
}
