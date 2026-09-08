import { useEffect, useMemo, useState } from 'react';
import type { OrderStatus } from './domain/types';
import { getStaffOrders, transitionOrder, type StaffOrderSummary } from './services/staffOrders';
import { supabase } from './lib/supabase';
import './order-operations.css';

const STAFF = new Set(['owner', 'admin', 'sales', 'warehouse']);
const FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
const LABELS: Record<OrderStatus, string> = { draft: 'مسودة', pending: 'جديد', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي' };

export default function OrderOperations() {
  const [staff, setStaff] = useState(false);
  const [orders, setOrders] = useState<StaffOrderSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() { try { setOrders(await getStaffOrders(100)); } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحميل الطلبات التشغيلية.'); } }
  useEffect(() => {
    let active = true;
    void supabase?.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      const { data: profile } = await supabase!.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      const allowed = Boolean(profile?.role && STAFF.has(profile.role));
      if (active) setStaff(allowed);
      if (allowed) void reload();
    });
    const channel = supabase?.channel('aghbari-order-operations').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { if (staff) void reload(); }).subscribe();
    return () => { active = false; channel?.unsubscribe(); };
  }, [staff]);

  const grouped = useMemo(() => Object.fromEntries(FLOW.map((status) => [status, orders.filter((order) => order.status === status)])) as Record<OrderStatus, StaffOrderSummary[]>, [orders]);
  async function move(order: StaffOrderSummary, status: OrderStatus) {
    if (status === order.status || busyId) return;
    setBusyId(order.id); setError(null);
    try { const next = await transitionOrder(order.id, status); setOrders((current) => current.map((item) => item.id === order.id ? next : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تغيير حالة الطلب.'); }
    finally { setBusyId(null); }
  }
  if (!staff) return null;
  return <>
    <button className="order-ops-trigger" onClick={() => { setOpen(true); void reload(); }} aria-label="فتح مركز الطلبات">الطلبات التشغيلية <b>{orders.filter((item) => item.status === 'pending').length}</b></button>
    {open && <div className="order-ops-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="order-ops-panel" dir="rtl" aria-label="مركز الطلبات التشغيلية">
        <header className="order-ops-header"><div><span className="eyebrow">المبيعات والتشغيل</span><h2>مركز الطلبات</h2><p>{orders.length} طلب · تحديث مباشر من قاعدة البيانات</p></div><div className="order-ops-actions"><button className={view === 'kanban' ? 'selected' : ''} onClick={() => setView('kanban')}>لوحة</button><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}>قائمة</button><button onClick={() => setOpen(false)}>إغلاق</button></div></header>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {view === 'kanban' ? <div className="order-kanban">{FLOW.map((status) => <section className="order-column" key={status}><h3>{LABELS[status]} <span>{grouped[status].length}</span></h3>{grouped[status].map((order) => <article className="order-card" key={order.id}><strong>#{order.order_number}</strong><span>{order.customer_name}</span><small>{new Intl.NumberFormat('ar-YE').format(order.total)} {order.currency}</small><div className="order-card-controls"><select value={order.status} disabled={busyId === order.id} onChange={(event) => void move(order, event.target.value as OrderStatus)}>{FLOW.map((next) => <option key={next} value={next}>{LABELS[next]}</option>)}</select></div><div className="order-timeline">{FLOW.map((step) => <i key={step} className={FLOW.indexOf(step) <= FLOW.indexOf(order.status) ? 'done' : ''} title={LABELS[step]} />)}</div></article>)}</section>)}</div> : <div className="order-list">{orders.map((order) => <article className="order-list-row" key={order.id}><strong>#{order.order_number}</strong><span>{order.customer_name}</span><span>{new Intl.NumberFormat('ar-YE').format(order.total)} {order.currency}</span><span>{LABELS[order.status]}</span><select value={order.status} disabled={busyId === order.id} onChange={(event) => void move(order, event.target.value as OrderStatus)}>{FLOW.map((next) => <option key={next} value={next}>{LABELS[next]}</option>)}</select></article>)}</div>}
      </section>
    </div>}
  </>;
}
