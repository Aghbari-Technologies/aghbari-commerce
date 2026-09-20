import { useEffect, useMemo, useState } from 'react';
import { getStaffOrders, type StaffOrderSummary } from './services/staffOrders';
import { formatMoney } from './domain/pricing';
import { supabase } from './lib/supabase';
import { buildSevenDaySales, calculateSevenDaySales, type DashboardSaleRow } from './domain/adminDashboard';
import { getLowStock, type LowStockRow } from './services/inventory';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type DashboardMetric = 'products' | 'customers' | 'orders' | 'stockItems' | 'receivables' | 'availableCredit' | 'sales7d';

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

function money(value: number) { return `${formatMoney(value)} ر.ي`; }
const DASHBOARD_TIME_ZONE = 'Asia/Aden';
function formatBusinessDate(value: string | Date) { return new Intl.DateTimeFormat('ar-YE', { timeZone: DASHBOARD_TIME_ZONE, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function formatBusinessTime(value: Date) { return new Intl.DateTimeFormat('ar-YE', { timeZone: DASHBOARD_TIME_ZONE, timeStyle: 'short' }).format(value); }

export default function AdminExecutiveDashboard({ role }: { role: UserRole }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(EMPTY);
  const [orders, setOrders] = useState<StaffOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [salesRows, setSalesRows] = useState<DashboardSaleRow[]>([]);
  const [metricErrors, setMetricErrors] = useState<Partial<Record<DashboardMetric, boolean>>>({});
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [lowStockError, setLowStockError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) { setLoading(false); setError('قاعدة البيانات غير مهيأة في هذه البيئة.'); return; }
      setLoading(true); setError(null);
      try {
        // Read a wider window than the seven-day presentation window so browser/runner timezone cannot under-fetch the first included business day. The domain calculator performs the exact Asia/Aden day filter.
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 10);
        const [productsResult, customersResult, ordersResult, stockResult, creditResult, staffOrdersResult, salesResult] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('inventory_balances').select('product_id', { count: 'exact', head: true }),
          supabase.from('customer_credit_accounts').select('outstanding_balance,available_credit'),
          getStaffOrders(100).then((data) => ({ data, error: null as Error | null })).catch((cause) => ({ data: [] as StaffOrderSummary[], error: cause instanceof Error ? cause : new Error('تعذر تحميل الطلبات التشغيلية.') })),
          supabase.from('orders').select('status,total,created_at').gte('created_at', cutoff.toISOString()).order('created_at', { ascending: true }).limit(1000),
        ]);
        const queryFailures = [
          productsResult.error,
          customersResult.error,
          ordersResult.error,
          stockResult.error,
          creditResult.error,
          staffOrdersResult.error,
          salesResult.error,
        ].filter(Boolean);
        const salesRowsData: DashboardSaleRow[] = (salesResult.data ?? []).map((row) => ({ status: String(row.status), total: Number(row.total ?? 0), created_at: String(row.created_at) }));
        const sales7d = calculateSevenDaySales(salesRowsData, new Date());
        const creditRows = creditResult.data ?? [];
        const lowStockResult = ['owner', 'admin', 'warehouse'].includes(role)
          ? await getLowStock().then((data) => ({ data, error: false })).catch(() => ({ data: [] as LowStockRow[], error: true }))
          : { data: [] as LowStockRow[], error: false };
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
          setOrders(staffOrdersResult.data);
          setSalesRows(salesRowsData);
          setLowStock(lowStockResult.data);
          setLowStockError(lowStockResult.error);
          setMetricErrors({
            products: Boolean(productsResult.error),
            customers: Boolean(customersResult.error),
            orders: Boolean(ordersResult.error || staffOrdersResult.error),
            stockItems: Boolean(stockResult.error),
            receivables: Boolean(creditResult.error),
            availableCredit: Boolean(creditResult.error),
            sales7d: Boolean(salesResult.error),
          });
          setLastUpdated(new Date());
          setError(queryFailures.length ? 'تعذر تحديث بعض مناطق لوحة الإدارة؛ المناطق السليمة ما زالت تعرض آخر بيانات مؤكدة.' : null);
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'تعذر تحديث مؤشرات لوحة الإدارة.');
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [role]);

  const salesByDay = useMemo(() => buildSevenDaySales(salesRows), [salesRows]);
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
      <div className="executive-header-actions"><span className="live-dot">{error ? '● تحديث جزئي' : '● النظام يعمل'}</span><button type="button" onClick={() => window.location.reload()}>تحديث البيانات ↻</button></div>
    </header>

    {error && <div className="executive-error" role="alert">تعذر تحديث بعض المؤشرات: {error}</div>}

    <div className="executive-layout">
      <aside className="executive-sidebar">
        <div className="executive-brand"><span>أ</span><div><strong>الأغبري</strong><small>Enterprise B2B</small></div></div>
        <nav aria-label="أقسام الإدارة">
          {[{label:'الرئيسية',target:'#admin-dashboard',icon:'⌂',can:true},{label:'الطلبات',target:'#admin-orders',icon:'↗',can:['owner','admin','sales','warehouse'].includes(role)},{label:'المخزون',target:'#admin-inventory',icon:'□',can:['owner','admin','warehouse'].includes(role)},{label:'العملاء والتجار',target:'#admin-customers',icon:'♙',can:['owner','admin','sales'].includes(role)},{label:'الموردين',target:'#admin-purchasing',icon:'▱',can:['owner','admin','warehouse'].includes(role)},{label:'الحسابات والمالية',target:'#admin-finance',icon:'◫',can:['owner','admin','sales'].includes(role)},{label:'الإعدادات',target:'#admin-settings',icon:'⚙',can:['owner','admin'].includes(role)}].filter((item) => item.can).map((item, index) => <a key={item.label} className={index === 0 ? 'active' : ''} href={item.target}>{item.icon}<span>{item.label}</span></a>)}
        </nav>
        <div className="executive-sidebar-section"><small>تشغيل سريع</small>{["owner","admin","sales","warehouse"].includes(role) && <a href="#admin-orders">↗ متابعة الطلبات</a>}{["owner","admin","warehouse"].includes(role) && <a href="#admin-inventory">□ إدارة المخزون</a>}{["owner","admin","sales"].includes(role) && <a href="#admin-customers">♙ إدارة العملاء</a>}{role === "viewer" && <span>وصول قراءة فقط — لا توجد مهام تشغيلية متاحة لهذا الدور.</span>}</div>
      </aside>

      <div className="executive-content" id="admin-dashboard">
        <div className="executive-kpis">
          <article><span>الذمم المدينة</span><strong>{loading ? '—' : metricErrors.receivables ? 'غير متاح' : money(snapshot.receivables)}</strong><small>إجمالي الأرصدة المستحقة</small></article>
          <article><span>المخزون المتوفر</span><strong>{loading ? '—' : metricErrors.stockItems ? 'غير متاح' : snapshot.stockItems.toLocaleString('ar')}</strong><small>{metricErrors.products ? 'عدد الأصناف غير متاح' : `${snapshot.products.toLocaleString('ar')} صنف نشط`}</small></article>
          <article><span>الطلبات</span><strong>{loading ? '—' : metricErrors.orders ? 'غير متاح' : snapshot.orders.toLocaleString('ar')}</strong><small>{metricErrors.customers ? 'عدد العملاء غير متاح' : `${snapshot.customers.toLocaleString('ar')} عميل مسجل`}</small></article>
          <article><span>التدفق التجاري · 7 أيام</span><strong>{loading ? '—' : metricErrors.sales7d ? 'غير متاح' : money(snapshot.sales7d)}</strong><small>من الطلبات غير الملغاة</small></article>
        </div>

        <div className="executive-grid-two">
          <article className="executive-card sales-chart"><div className="executive-card-title"><div><span>المبيعات</span><h2>حركة المبيعات خلال آخر 7 أيام</h2></div><b>{metricErrors.sales7d ? 'غير متاح' : money(snapshot.sales7d)}</b></div>{metricErrors.sales7d ? <div className="executive-degraded">تعذر تحديث حركة المبيعات؛ لا يمكن اعتبار الفترة بلا مبيعات.</div> : snapshot.sales7d > 0 ? <div className="bars" aria-label="مخطط المبيعات لسبعة أيام">{salesByDay.map((day) => <div className="bar-column" key={day.key}><strong>{day.value ? formatMoney(day.value) : '0'}</strong><div className="bar" style={{ height: `${Math.max(8, (day.value / maxSales) * 150)}px` }} /><small>{day.label}</small></div>)}</div> : <div className="executive-empty-chart" role="status"><strong>لا توجد مبيعات مسجلة</strong><span>لم تُسجّل طلبات مكتملة خلال آخر 7 أيام.</span></div>}</article>
          <article className="executive-card"><div className="executive-card-title"><div><span>توزيع التشغيل</span><h2>حالة الطلبات</h2></div><b>{metricErrors.orders ? '—' : orders.length}</b></div>{metricErrors.orders ? <div className="executive-degraded">تعذر تحديث حالات الطلبات من المصدر التشغيلي.</div> : <div className="status-list">{statusCounts.length ? statusCounts.map((item) => <div key={item.status}><span>{item.label}</span><strong>{item.count}</strong><div><i style={{ width: `${Math.min(100, (item.count / Math.max(orders.length, 1)) * 100)}%` }} /></div></div>) : <p className="executive-empty">لا توجد طلبات تشغيلية في العينة الحالية.</p>}</div>}</article>
        </div>

        <div className="executive-grid-two operational-insight-grid">
          <article className="executive-card"><div className="executive-card-title"><div><span>إشارة المخزون</span><h2>أصناف تحتاج إجراء</h2></div><b>{lowStockError ? "—" : lowStock.length}</b></div>{lowStockError ? <div className="executive-degraded">تعذر تحديث إشارات المخزون؛ لم يتم الاستنتاج بأن المخزون ضمن الحدود.</div> : lowStock.length ? <div className="executive-alert-list">{lowStock.slice(0,5).map((row) => <div key={`${row.warehouse_id}:${row.product_id}`}><div><strong>{row.product_name}</strong><small>{row.sku} · {row.warehouse_name}</small></div><span><b>{row.current_quantity}</b><small>الحد {row.min_quantity}</small></span></div>)}</div> : <div className="executive-empty-chart"><strong>المخزون ضمن الحدود</strong><span>لا توجد أصناف تحت حد إعادة الطلب المعلن حاليًا.</span></div>}</article>
          <article className="executive-card smart-card"><div className="executive-card-title"><div><span>مركز القرار</span><h2>توصيات تشغيلية</h2></div><span>مباشرة</span></div><div className="recommendation-list"><div><span>01</span><div><strong>{metricErrors.orders ? 'غير متاح' : orders.filter((o) => o.status === 'pending').length} طلبات تحتاج مراجعة</strong><small>ابدأ بدورة الاعتماد من مركز الطلبات بعد توفر بياناتها.</small></div></div><div><span>02</span><div><strong>{lowStockError ? 'غير متاح' : lowStock.length} أصناف تحت الحد</strong><small>راجع إعادة الطلب أو التحويل بين المستودعات بعد تحديث المؤشر.</small></div></div><div><span>03</span><div><strong>{metricErrors.availableCredit ? 'غير متاح' : money(snapshot.availableCredit)}{metricErrors.availableCredit ? '' : ' ائتمان متاح'}</strong><small>الرصيد المتاح للعملاء وفق بيانات النظام الحالية.</small></div></div></div></article>
        </div>

        <div className="executive-grid-two bottom-grid">
          <article className="executive-card"><div className="executive-card-title"><div><span>التشغيل</span><h2>أحدث الطلبات</h2></div>{['owner','admin','sales','warehouse'].includes(role) && <a href="#admin-orders">عرض الكل ←</a>}</div>{metricErrors.orders ? <p className="executive-degraded">تعذر تحديث قائمة الطلبات، مع بقاء بقية بيانات اللوحة مستقلة.</p> : latestOrders.length ? <div className="executive-orders">{latestOrders.map((order) => <div key={order.id}><span>#{order.order_number}</span><div><strong>{order.customer_name}</strong><small>{formatBusinessDate(order.created_at)}</small></div><b>{money(order.total)}</b><em>{STATUS_LABELS[order.status] ?? order.status}</em></div>)}</div> : <p className="executive-empty">لا توجد طلبات بعد.</p>}</article>
          <article className="executive-card smart-card"><div className="executive-card-title"><div><span>أدوات الإدارة</span><h2>أوامر سريعة</h2></div><span>تشغيل مباشر</span></div><div className="quick-actions">{['owner','admin','sales'].includes(role) && <a href="#admin-product-create">＋ إضافة منتج</a>}{['owner','admin','sales','warehouse'].includes(role) && <a href="#admin-orders">▤ إدارة الطلبات</a>}{['owner','admin','sales'].includes(role) && <a href="#admin-customers">▣ إدارة العملاء</a>}{['owner','admin','warehouse'].includes(role) && <a href="#admin-inventory">▥ إدارة المخزون</a>}{['owner','admin','sales'].includes(role) && <a href="#admin-finance">◫ الحسابات والمالية</a>}{['owner','admin'].includes(role) && <a href="#admin-settings">⚙ إعدادات التحكم</a>}</div><div className="credit-summary"><span>الائتمان المتاح</span><strong>{metricErrors.availableCredit ? 'غير متاح' : money(snapshot.availableCredit)}</strong></div></article>
        </div>

        <footer className="executive-footer"><span>دورك الحالي: {{owner:'مالك',admin:'مدير',sales:'مبيعات',warehouse:'مخزون',viewer:'قارئ'}[role] ?? role}</span><span>{lastUpdated ? `آخر تحديث ${formatBusinessTime(lastUpdated)}` : 'جارٍ التحديث…'}</span><span>التحديث التلقائي كل 60 ثانية</span></footer>
      </div>
    </div>
  </section>;
}