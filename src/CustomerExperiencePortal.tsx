import { useEffect, useMemo, useState } from 'react';
import type { OrderStatus } from './domain/types';
import { getCustomerOrderDetail, type CustomerOrderDetail } from './services/customerOrders';
import { bindCurrentCustomerDevice, getNotifications, markNotificationRead, requestDeviceChange, type NotificationItem } from './services/security';
import { supabase } from './lib/supabase';
import './customer-experience.css';

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'مسودة', pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي'
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar-YE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function CustomerExperiencePortal() {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unread = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  async function refresh() {
    if (!customer) return;
    try { setNotifications(await getNotifications(30)); } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحميل الإشعارات.'); }
  }

  useEffect(() => {
    let active = true;
    void supabase?.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      const { data: profile } = await supabase!.from('profiles').select('customer_id').eq('id', data.user.id).maybeSingle();
      if (!active) return;
      const isCustomer = Boolean(profile?.customer_id);
      setCustomer(isCustomer);
      if (isCustomer) {
        void bindCurrentCustomerDevice('الجهاز الحالي').catch(() => undefined);
        void getNotifications(30).then((items) => active && setNotifications(items)).catch(() => undefined);
      }
    });
    const channel = supabase?.channel('aghbari-customer-experience').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => void refresh()).subscribe();
    return () => { active = false; channel?.unsubscribe(); };
  }, [customer]);

  async function readNotification(item: NotificationItem) {
    if (item.read_at) return;
    try {
      await markNotificationRead(item.id);
      setNotifications((current) => current.map((row) => row.id === item.id ? { ...row, read_at: new Date().toISOString() } : row));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحديث الإشعار.'); }
  }

  async function openOrder(id: string) {
    setBusy(true); setError(null);
    try { setSelectedOrder(await getCustomerOrderDetail(id)); setOpen(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر فتح تفاصيل الطلب.'); }
    finally { setBusy(false); }
  }

  async function changeDevice() {
    setBusy(true); setError(null); setMessage(null);
    try { await requestDeviceChange('جهاز بديل', 'طلب العميل نقل الوصول إلى هذا الجهاز'); setMessage('تم تسجيل طلب تغيير الجهاز وسيظهر للإدارة للمراجعة.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تسجيل طلب تغيير الجهاز.'); }
    finally { setBusy(false); }
  }

  if (!customer) return null;

  return <>
    <button className="customer-experience-trigger" onClick={() => { setOpen(true); setError(null); void refresh(); }} aria-label="فتح مركز حسابي">
      حسابي {unread > 0 && <b>{unread > 99 ? '99+' : unread}</b>}
    </button>
    {open && <div className="customer-experience-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <aside className="customer-experience-drawer" dir="rtl" aria-label="مركز حساب العميل">
        <header><div><span className="eyebrow">بوابة الأغبري</span><h2>مركز حسابي</h2></div><button className="customer-experience-close" onClick={() => setOpen(false)} aria-label="إغلاق">×</button></header>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {message && <div className="success" role="status">{message}</div>}
        <section className="customer-experience-card">
          <div className="customer-experience-card-heading"><div><span className="eyebrow">الأمان</span><h3>الجهاز الموثوق</h3></div><span className="security-dot">محمي</span></div>
          <p>حساب العميل مرتبط بجهاز موثوق واحد. تغيير الجهاز يحتاج موافقة الإدارة.</p>
          <button onClick={() => void changeDevice()} disabled={busy}>طلب تغيير الجهاز</button>
        </section>
        <section className="customer-experience-card">
          <div className="customer-experience-card-heading"><div><span className="eyebrow">الإشعارات</span><h3>آخر التنبيهات</h3></div>{unread > 0 && <span>{unread} غير مقروء</span>}</div>
          {!notifications.length ? <p className="muted">لا توجد إشعارات جديدة.</p> : <div className="customer-notification-list">{notifications.map((item) => <article key={item.id} className={item.read_at ? 'customer-notification read' : 'customer-notification'} onClick={() => { void readNotification(item); if (item.entity_type === 'order' && item.entity_id) void openOrder(item.entity_id); }}>
            <div><strong>{item.title}</strong><p>{item.body}</p><small>{formatDate(item.created_at)}</small></div>{!item.read_at && <span className="unread-dot" />}
          </article>)}</div>}
        </section>
        {selectedOrder && <section className="customer-experience-card customer-order-detail">
          <div className="customer-experience-card-heading"><div><span className="eyebrow">تفاصيل الطلب</span><h3>#{selectedOrder.order_number}</h3></div><span>{STATUS_LABELS[selectedOrder.status]}</span></div>
          <strong>{new Intl.NumberFormat('ar-YE').format(selectedOrder.total)} {selectedOrder.currency}</strong>
          <p>أُنشئ في {formatDate(selectedOrder.created_at)}</p>
          <div className="customer-order-timeline" aria-label="مسار حالة الطلب">{(['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((status) => <span key={status} className={status === selectedOrder.status ? 'current' : ''}>{STATUS_LABELS[status]}</span>)}</div>
          <small>آخر تحديث: {formatDate(selectedOrder.updated_at)}</small>
        </section>}
        {busy && <div className="customer-experience-busy">جارٍ تنفيذ العملية…</div>}
      </aside>
    </div>}
  </>;
}
