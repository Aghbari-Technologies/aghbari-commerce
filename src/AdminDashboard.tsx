import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OrderStatus } from './domain/types';
import AdminPanel from './AdminPanel';
import SecurityCenter from './SecurityCenter';
import NotificationCenter from './NotificationCenter';
import { getStaffOrders, transitionOrder, type StaffOrderSummary } from './services/staffOrders';
import { supabase } from './lib/supabase';
import './admin-dashboard.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type DashboardStats = { orders: number; customers: number; products: number; warehouses: number };
type Activity = { id: string; title: string; detail: string; time: string };
const sections = [
  { id: 'account', label: 'المبيعات والطلبات', short: 'الطلبات', icon: '↗' },
  { id: 'customers', label: 'العملاء والحسابات', short: 'العملاء', icon: '◎' },
  { id: 'inventory', label: 'الأصناف والمخزون', short: 'المخزون', icon: '▦' },
  { id: 'purchasing', label: 'المشتريات والتوريد', short: 'التوريد', icon: '↔' },
  { id: 'finance', label: 'المالية', short: 'المالية', icon: '◇' },
  { id: 'exports', label: 'التقارير والتصدير', short: 'التقارير', icon: '▤' },
  { id: 'security', label: 'الأمان والأجهزة', short: 'الأمان', icon: '⌁' },
  { id: 'notifications', label: 'الإشعارات', short: 'التنبيهات', icon: '◉' },
];
const STATUS_LABELS: Record<OrderStatus, string> = { draft: 'مسودة', pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي' };
const STATUS_COLUMNS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
const initialStats: DashboardStats = { orders: 0, customers: 0, products: 0, warehouses: 0 };
function allowedNextStatuses(status: OrderStatus, role: UserRole): OrderStatus[] {
  if (status === 'pending' && ['owner', 'admin', 'sales'].includes(role)) return ['confirmed', 'cancelled'];
  if (status === 'confirmed' && ['owner', 'admin', 'warehouse'].includes(role)) return ['preparing', 'cancelled'];
  if (status === 'preparing' && ['owner', 'admin', 'warehouse'].includes(role)) return ['ready', 'cancelled'];
  if (status === 'ready' && ['owner', 'admin', 'warehouse', 'sales'].includes(role)) return ['completed'];
  return [];
}
export default function AdminDashboard({ role }: { role: UserRole }) {
  const [active, setActive] = useState('account');
  const [stats, setStats] = useState(initialStats);
  const [live, setLive] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lowStock, setLowStock] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [orders, setOrders] = useState<StaffOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderView, setOrderView] = useState<'kanban' | 'list'>('kanban');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [orderQuery, setOrderQuery] = useState('');
  const [orderBusy, setOrderBusy] = useState<string | null>(null);
  const loadStats = useCallback(async () => {
    if (!supabase) return;
    const [ordersResult, customers, products, warehouses, stock] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('warehouses').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('inventory').select('id', { count: 'exact', head: true }).lte('quantity', 10),
    ]);
    const firstError = [ordersResult, customers, products, warehouses, stock].find((result) => result.error)?.error;
    if (firstError) throw firstError;
    setStats({ orders: ordersResult.count ?? 0, customers: customers.count ?? 0, products: products.count ?? 0, warehouses: warehouses.count ?? 0 });
    setLowStock(stock.count ?? 0); setStatsError(null);
  }, []);
  const loadActivity = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('orders').select('id,order_number,status,updated_at').order('updated_at', { ascending: false }).limit(6);
    if (!error) setActivity((data ?? []).map((row) => ({ id: row.id, title: `طلب #${row.order_number}`, detail: `الحالة: ${STATUS_LABELS[row.status as OrderStatus] ?? row.status}`, time: row.updated_at })));
  }, []);
  const loadOrders = useCallback(async () => { setOrdersLoading(true); try { setOrders(await getStaffOrders(100)); } finally { setOrdersLoading(false); } }, []);
  useEffect(() => { void loadStats().catch((error) => setStatsError(error instanceof Error ? error.message : 'تعذر تحميل مؤشرات لوحة التحكم.')); void loadActivity(); void loadOrders(); }, [loadStats, loadActivity, loadOrders]);
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('aghbari-admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { setLive(true); void loadStats(); void loadActivity(); void loadOrders(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { setLive(true); void loadStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => { setLive(true); void loadStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => { setLive(true); void loadStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => setLive(true))
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));
    return () => { void supabase.removeChannel(channel); };
  }, [loadStats, loadActivity, loadOrders]);
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesStatus = orderFilter === 'all' || order.status === orderFilter;
    const q = orderQuery.trim().toLowerCase();
    return matchesStatus && (!q || String(order.order_number).toLowerCase().includes(q) || order.customer_name.toLowerCase().includes(q));
  }), [orders, orderFilter, orderQuery]);
  async function changeStatus(orderId: string, status: OrderStatus) { setOrderBusy(orderId); try { await transitionOrder(orderId, status); await Promise.all([loadOrders(), loadStats(), loadActivity()]); } finally { setOrderBusy(null); } }
  function go(id: string) { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  return <section className="admin-dashboard" id="admin-dashboard">
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar" aria-label="تنقل الإدارة">
        <div className="admin-sidebar-brand"><span className="brand-mark">أ</span><div><strong>الأغبري</strong><small>مركز الإدارة</small></div></div>
        <div className="admin-sidebar-label">التشغيل</div>
        <div className="admin-sidebar-links">{sections.map((section) => <button key={section.id} className={active === section.id ? 'active' : ''} onClick={() => go(section.id)}><span className="admin-sidebar-icon">{section.icon}</span><span>{section.label}</span></button>)}</div>
        <div className="admin-sidebar-label">الوصول السريع</div>
        <div className="admin-sidebar-links compact"><button onClick={() => go('account')}><span>•</span><span><strong>مساحة عمل المدير</strong><small>الطلبات والتنفيذ المباشر</small></span></button><button onClick={() => go('exports')}><span>•</span><span><strong>مركز البيانات</strong><small>الاستيراد والتصدير</small></span></button><button onClick={() => go('inventory')}><span>•</span><span><strong>الذكاء والتنبيهات</strong><small>مؤشرات فوق البيانات الفعلية</small></span></button><button onClick={() => go('security')}><span>•</span><span><strong>الأمان والصلاحيات</strong><small>الأجهزة وطلبات التغيير</small></span></button></div>
        <div className="admin-sidebar-footer"><span className={live ? 'live-dot on' : 'live-dot'} />{live ? 'تحديثات لحظية مفعّلة' : 'جاري الاتصال بالتحديثات اللحظية'}<strong>{role}</strong></div>
      </aside>
      <div className="admin-dashboard-main">
        <header className="admin-dashboard-head"><div><span className="eyebrow">لوحة التشغيل التنفيذية</span><h2>مركز إدارة الأغبري</h2><p>مساحة تشغيل حقيقية للطلبات والعملاء والأصناف والمخزون والتوريد والمالية والأمان.</p></div><div className="admin-role"><span>الحساب الحالي</span><strong>{role}</strong><small>{live ? '● مباشر' : '○ في انتظار الاتصال'}</small></div></header>
        <div className="admin-kpi-grid" aria-label="مؤشرات التشغيل"><article><span>الطلبات</span><strong>{stats.orders}</strong><small>إجمالي السجلات</small></article><article><span>العملاء</span><strong>{stats.customers}</strong><small>حسابات مسجلة</small></article><article><span>الأصناف النشطة</span><strong>{stats.products}</strong><small>من قاعدة البيانات</small></article><article><span>مخاطر المخزون</span><strong>{lowStock}</strong><small>سجلات بكمية ≤ 10</small></article></div>
        {statsError && <div className="error-banner" role="alert">تعذر تحديث المؤشرات: {statsError}</div>}
        <div className="admin-section-nav" aria-label="أقسام لوحة التحكم">{sections.map((section) => <button key={section.id} className={active === section.id ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => go(section.id)}><span>{section.icon}</span><strong>{section.short}</strong></button>)}</div>
        <section className="admin-order-cockpit" id="manager-workspace" aria-label="مساحة عمل المدير"><div className="section-heading"><div><span className="eyebrow">مساحة عمل المدير</span><h3>دورة الطلبات</h3></div><span>{filteredOrders.length} من {orders.length} طلب</span></div><div className="admin-order-toolbar"><input aria-label="بحث الطلبات" placeholder="بحث برقم الطلب أو اسم العميل" value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} /><select aria-label="تصفية الحالة" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value as 'all' | OrderStatus)}><option value="all">كل الحالات</option>{STATUS_COLUMNS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select><div className="view-toggle"><button className={orderView === 'kanban' ? 'active' : ''} onClick={() => setOrderView('kanban')}>كانبان</button><button className={orderView === 'list' ? 'active' : ''} onClick={() => setOrderView('list')}>قائمة</button></div></div>{ordersLoading ? <p>جارٍ تحميل الطلبات…</p> : orderView === 'kanban' ? <div className="order-kanban">{STATUS_COLUMNS.map((status) => { const column = filteredOrders.filter((o) => o.status === status); return <section className="order-column" key={status}><header><strong>{STATUS_LABELS[status]}</strong><span>{column.length}</span></header>{column.map((order) => <article className="order-card" key={order.id}><strong>#{order.order_number}</strong><span>{order.customer_name}</span><b>{order.total.toLocaleString('ar-YE')} {order.currency}</b><div className="order-actions">{allowedNextStatuses(order.status, role).map((next) => <button key={next} disabled={orderBusy === order.id} onClick={() => void changeStatus(order.id, next)}>{orderBusy === order.id ? 'جارٍ…' : STATUS_LABELS[next]}</button>)}</div></article>)}</section>; })}</div> : <div className="order-list">{filteredOrders.map((order) => <article className="order-list-row" key={order.id}><strong>#{order.order_number}</strong><span>{order.customer_name}</span><span>{STATUS_LABELS[order.status]}</span><b>{order.total.toLocaleString('ar-YE')} {order.currency}</b><div className="order-actions">{allowedNextStatuses(order.status, role).map((next) => <button key={next} disabled={orderBusy === order.id} onClick={() => void changeStatus(order.id, next)}>{STATUS_LABELS[next]}</button>)}</div></article>)}</div>}</section>
        <div className="admin-capability-strip"><div><b>Realtime</b><span>الطلبات والمخزون والإشعارات تتحدث من Supabase دون Refresh.</span></div><div><b>RBAC</b><span>مسارات الانتقال الحساسة تمر عبر RPC وصلاحيات الخادم.</span></div><div><b>Security</b><span>جهاز واحد للعميل مع تغيير خاضع للمراجعة.</span></div></div>
        <div className="admin-live-grid"><section className="admin-live-card"><div className="section-heading"><div><span className="eyebrow">مباشر</span><h3>آخر نشاط للطلبات</h3></div><span>{activity.length} عمليات</span></div>{activity.length ? activity.map((item) => <article key={item.id}><div><strong>{item.title}</strong><small>{item.detail}</small></div><time dateTime={item.time}>{new Date(item.time).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</time></article>) : <p>لا توجد حركة حديثة.</p>}</section><section className="admin-live-card"><div className="section-heading"><div><span className="eyebrow">تنبيه</span><h3>مخاطر المخزون</h3></div><span>{lowStock} سجلات</span></div><p>{lowStock ? 'هناك أصناف تحتاج مراجعة المخزون والتوريد.' : 'لا توجد سجلات منخفضة حسب حد التنبيه الحالي.'}</p><button onClick={() => go('inventory')}>فتح المخزون</button></section></div>
        <NotificationCenter role={role} /><SecurityCenter role={role} /><AdminPanel role={role} />
      </div>
    </div>
  </section>;
}
