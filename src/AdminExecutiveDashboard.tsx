import { useEffect, useMemo, useState } from 'react';
import { getStaffOrders, type StaffOrderSummary } from './services/staffOrders';
import { formatMoney } from './domain/pricing';
import { supabase } from './lib/supabase';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

interface DashboardSnapshot {
  products: number;
  customers: number;
  orders: number;
  stockItems: number;
  receivables: number;
  availableCredit: number;
  sales7d: number;
}

const EMPTY: DashboardSnapshot = { products: 0, customers: 0, orders: 0, stockItems: 0, receivables: 0, availableCredit: 0, sales7d: 0 };
const STATUS_LABELS: Record<string, string> = { pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي', draft: 'مسودة' };

function dayKey(date: Date) { return date.toISOString().slice(0, 10); }
function money(value: number) { return `${formatMoney(value)} ر.ي`; }

export default function AdminExecutiveDashboard({ role }: { role: UserRole }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(EMPTY);
  const [orders, setOrders] = useState<StaffOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) { setLoading(false); setError('قاعدة البيانات غير مهيأة في هذه البيئة.'); return; }
      setLoading(true); setError(null);
      try {
        const [productsResult, customersResult, ordersResult, stockResult, creditResult, staffOrders] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('inventory').select('product_id', { count: 'exact', head: true }),
          supabase.from('customer_credit_accounts').select('outstanding_balance,available_credit'),
          getStaffOrders(100),
        ]);
        const firstError = productsResult.error ?? customersResult.error ?? ordersResult.error ?? stockResult.error ?? creditResult.error;
        if (firstError) throw firstError;
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
        const sales7d = staffOrders.filter((order) => new Date(order.created_at) >= cutoff && order.status !== 'cancelled' && order.status !== 'draft').reduce((sum, order) => sum + order.total, 0);
        const creditRows = creditResult.data ?? [];
        if (!cancelled) {
          setSnapshot({
            products: productsResult.count ?? 0,
            customers: customersResult.count ?? 0,
            orders: ordersResult.count ?? 0,
            stockItems: stockResult.count ?? 0,
            receivables: creditRows.reduce((sum, row) => sum + Number(row.outstanding_balance ?? 0), 0),
            availableCredit: creditRows.reduce((sum, row) => sum + Number(row.available_credit ?? 0), 0),
            sales7d,
          });
          setOrders(staffOrders);
          setLastUpdated(new Date());
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'تعذر تحديث مؤشرات لوحة الإدارة.');
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const salesByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => { const d = new Date(); d.setDate(d.getDate() - (6 - index)); return { key: dayKey(d), label: d.toLocaleDateString('ar', { weekday: 'short' }), value: 0 }; });
    const map = new Map(days.map((day) => [day.key, day]));
    for (const order of orders) { if (order.status === 'cancelled' || order.status === 'draft') continue; const day = map.get(dayKey(new Date(order.created_at))); if (day) day.value += order.total; }
    return days;
  }, [orders]);
  const maxSales = Math.max(...salesByDay.map((day) => day.value), 1);
  const statusCounts = useMemo(() => Object.entries(STATUS_LABELS).map(([status, label]) => ({ status, label, count: orders.filter((order) => order.status === status).length })).filter((item) => item.count > 0), [orders]);
  const latestOrders = orders.slice(0, 5);

  return <section className="executive-dashboard" dir="rtl" aria-label="لوحة المعلومات التنفيذية">
    <header className="executive-header">
      <div>
        <span className="executive-eyebrow">لوحة التحكم · الإدارة التنفيذية</span>
        <h1>مرحباً بك في بوابة الأغبري التجارية</h1>
        <p>رؤية تشغيلية موحدة للمبيعات، المخزون، العملاء والسيولة — مبنية على بيانات النظام الحالية.</p>
      </div>
      <div className="executive-header-actions"><span className="live-dot">● النظام يعمل</span><button type="button" onClick={() => window.location.reload()}>تحديث البيانات ↻</button></div>
    </header>

    {error && <div className="executive-error" role="alert">تعذر تحديث بعض المؤشرات: {error}</div>}

    <div className="executive-layout">
      <aside className="executive-sidebar">
        <div className="executive-brand"><span>أ</span><div><strong>الأغبري</strong><small>Enterprise B2B</small></div></div>
        <nav aria-label="أقسام الإدارة">
          {['الرئيسية', 'المبيعات', 'المشتريات', 'المخزون', 'العملاء والتجار', 'الموردين', 'الحسابات والمالية', 'التقارير والتحليلات', 'إدارة النظام'].map((item, index) => <a key={item} className={index === 0 ? 'active' : ''} href={index === 0 ? '#admin-dashboard' : '#account'}>{index === 0 ? '⌂' : ['↗', '□', '▣', '♙', '▱', '◫', '▤', '⚙'][index - 1]}<span>{item}</span></a>)}
        </nav>
        <div className="executive-sidebar-section"><small>أدوات ذكية</small><a href="#account">✦ مساعد الأغبري الذكي</a><a href="#account">⌁ تحليل السوق</a><a href="#account">◈ التوصيات الذكية</a></div>
      </aside>

      <div className="executive-content" id="admin-dashboard">
        <div className="executive-kpis">
          <article><span>الذمم المدينة</span><strong>{loading ? '—' : money(snapshot.receivables)}</strong><small>إجمالي الأرصدة المستحقة</small></article>
          <article><span>المخزون المتوفر</span><strong>{loading ? '—' : snapshot.stockItems.toLocaleString('ar')}</strong><small>{snapshot.products.toLocaleString('ar')} صنف نشط</small></article>
          <article><span>الطلبات</span><strong>{loading ? '—' : snapshot.orders.toLocaleString('ar')}</strong><small>{snapshot.customers.toLocaleString('ar')} عميل مسجل</small></article>
          <article><span>التدفق التجاري · 7 أيام</span><strong>{loading ? '—' : money(snapshot.sales7d)}</strong><small>من الطلبات غير الملغاة</small></article>
        </div>

        <div className="executive-grid-two">
          <article className="executive-card sales-chart"><div className="executive-card-title"><div><span>المبيعات</span><h2>حركة المبيعات خلال آخر 7 أيام</h2></div><b>{money(snapshot.sales7d)}</b></div><div className="bars" aria-label="مخطط المبيعات لسبعة أيام">{salesByDay.map((day) => <div className="bar-column" key={day.key}><strong>{day.value ? formatMoney(day.value) : '0'}</strong><div className="bar" style={{ height: `${Math.max(8, (day.value / maxSales) * 150)}px` }} /><small>{day.label}</small></div>)}</div></article>
          <article className="executive-card"><div className="executive-card-title"><div><span>توزيع التشغيل</span><h2>حالة الطلبات</h2></div><b>{orders.length}</b></div><div className="status-list">{statusCounts.length ? statusCounts.map((item) => <div key={item.status}><span>{item.label}</span><strong>{item.count}</strong><div><i style={{ width: `${Math.min(100, (item.count / Math.max(orders.length, 1)) * 100)}%` }} /></div></div>) : <p className="executive-empty">لا توجد طلبات تشغيلية في العينة الحالية.</p>}</div></article>
        </div>

        <div className="executive-grid-two bottom-grid">
          <article className="executive-card"><div className="executive-card-title"><div><span>التشغيل</span><h2>أحدث الطلبات</h2></div><a href="#account">عرض الكل ←</a></div>{latestOrders.length ? <div className="executive-orders">{latestOrders.map((order) => <div key={order.id}><span>#{order.order_number}</span><div><strong>{order.customer_name}</strong><small>{new Date(order.created_at).toLocaleString('ar')}</small></div><b>{money(order.total)}</b><em>{STATUS_LABELS[order.status] ?? order.status}</em></div>)}</div> : <p className="executive-empty">لا توجد طلبات بعد.</p>}</article>
          <article className="executive-card smart-card"><div className="executive-card-title"><div><span>أدوات الإدارة</span><h2>أوامر سريعة</h2></div><span>تشغيل مباشر</span></div><div className="quick-actions"><a href="#account">＋ إضافة منتج</a><a href="#account">▤ إدارة الطلبات</a><a href="#account">▣ إدارة العملاء</a><a href="#account">▥ إدارة المخزون</a><a href="#account">◫ الحسابات والمالية</a><a href="#account">✦ مساعد الأغبري</a></div><div className="credit-summary"><span>الائتمان المتاح</span><strong>{money(snapshot.availableCredit)}</strong></div></article>
        </div>

        <footer className="executive-footer"><span>دورك الحالي: {role}</span><span>{lastUpdated ? `آخر تحديث ${lastUpdated.toLocaleTimeString('ar')}` : 'جارٍ التحديث…'}</span><span>التحديث التلقائي كل 60 ثانية</span></footer>
      </div>
    </div>
  </section>;
}
