import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getStaffOrders, type StaffOrderSummary } from './services/staffOrders';
import { formatMoney } from './domain/pricing';
import { supabase } from './lib/supabase';
import { buildSevenDaySales, calculateSevenDaySales, type DashboardSaleRow } from './domain/adminDashboard';
import { AGHBARI_ADMIN_STRUCTURE } from './structure/admin-structure';

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

const EMPTY: DashboardSnapshot = {
  products: 0,
  customers: 0,
  orders: 0,
  stockItems: 0,
  receivables: 0,
  availableCredit: 0,
  sales7d: 0,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  preparing: 'قيد التجهيز',
  ready: 'جاهز',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  draft: 'مسودة',
};

const roleLabels: Record<UserRole, string> = {
  owner: 'مالك النظام',
  admin: 'مدير',
  sales: 'مبيعات',
  warehouse: 'مخازن',
  viewer: 'مشاهد',
};

function money(value: number) {
  return `${formatMoney(value)} ر.ي`;
}

function Tile({
  icon,
  title,
  target,
  tone = 'plain',
}: {
  icon: string;
  title: string;
  target: string;
  tone?: 'plain' | 'brand';
}) {
  return (
    <a className={`control-tile control-tile-${tone}`} href={target}>
      <span className="control-tile-icon" aria-hidden="true">{icon}</span>
      <span>{title}</span>
      <b aria-hidden="true">←</b>
    </a>
  );
}

function BoundaryTile({ item }: { item: { label: string; note?: string } }) {
  return (
    <div className="control-tile control-tile-boundary" title={item.note ?? 'ضمن الهيكلة المرجعية وليس عقدًا تنفيذيًا في Commerce الحالي.'}>
      <span className="control-tile-icon" aria-hidden="true">◌</span>
      <span>{item.label}</span>
      <small aria-hidden="true">حد</small>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <article className="control-section-card">
      <header>
        <div className="control-section-title">
          <span className="control-section-icon" aria-hidden="true">{icon}</span>
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
      </header>
      <div className="control-section-grid">{children}</div>
    </article>
  );
}

export default function AdminExecutiveDashboard({ role }: { role: UserRole }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(EMPTY);
  const [orders, setOrders] = useState<StaffOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [salesRows, setSalesRows] = useState<DashboardSaleRow[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setLoading(false);
        setError('قاعدة البيانات غير مهيأة في هذه البيئة.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);

        const [
          productsResult,
          customersResult,
          ordersResult,
          stockResult,
          creditResult,
          staffOrders,
          salesResult,
        ] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('inventory_balances').select('product_id', { count: 'exact', head: true }),
          supabase.from('customer_credit_accounts').select('outstanding_balance,available_credit'),
          getStaffOrders(100),
          supabase
            .from('orders')
            .select('status,total,created_at')
            .gte('created_at', cutoff.toISOString())
            .order('created_at', { ascending: true })
            .limit(1000),
        ]);

        const firstError =
          productsResult.error ??
          customersResult.error ??
          ordersResult.error ??
          stockResult.error ??
          creditResult.error ??
          salesResult.error;

        if (firstError) throw firstError;

        const salesRowsData: DashboardSaleRow[] = (salesResult.data ?? []).map((row) => ({
          status: String(row.status),
          total: Number(row.total ?? 0),
          created_at: String(row.created_at),
        }));

        const sales7d = calculateSevenDaySales(salesRowsData, new Date());
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
          setSalesRows(salesRowsData);
          setLastUpdated(new Date());
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'تعذر تحديث مؤشرات لوحة الإدارة.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refreshTick]);

  const salesByDay = useMemo(() => buildSevenDaySales(salesRows), [salesRows]);
  const maxSales = Math.max(...salesByDay.map((day) => day.value), 1);
  const statusCounts = useMemo(
    () =>
      Object.entries(STATUS_LABELS)
        .map(([status, label]) => ({
          status,
          label,
          count: orders.filter((order) => order.status === status).length,
        }))
        .filter((item) => item.count > 0),
    [orders],
  );

  const latestOrders = orders.slice(0, 6);
  const canOrders = ['owner', 'admin', 'sales', 'warehouse'].includes(role);
  const canInventory = ['owner', 'admin', 'warehouse'].includes(role);
  const canCustomers = ['owner', 'admin', 'sales'].includes(role);
  const canFinance = ['owner', 'admin', 'sales'].includes(role);
  const canAdmin = ['owner', 'admin'].includes(role);

  return (
    <section
      className="control-plane-dashboard"
      dir="rtl"
      aria-label="لوحة التحكم الرئيسية للأغبري"
      aria-busy={loading}
    >
      <header className="control-plane-topbar">
        <div className="control-plane-title">
          <span className="control-eyebrow">الأغبري · مركز التحكم التشغيلي</span>
          <h1>لوحة التحكم</h1>
          <p>واجهة تشغيل موحدة للمبيعات والعملاء والكتالوج والمخزون والمالية والحوكمة.</p>
        </div>
        <div className="control-plane-status">
          <span className="system-status"><i aria-hidden="true">●</i> النظام يعمل</span>
          <span className="role-chip">{roleLabels[role]}</span>
          <button
            type="button"
            className="refresh-control"
            onClick={() => setRefreshTick((value) => value + 1)}
            disabled={loading}
          >
            {loading ? 'جارٍ التحديث…' : 'تحديث البيانات ↻'}
          </button>
        </div>
      </header>

      {error && (
        <div className="control-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshTick((value) => value + 1)} disabled={loading}>
            إعادة المحاولة
          </button>
        </div>
      )}

      <div className="control-plane-layout">
        <main className="control-plane-main">
          <div className="control-quickbar" aria-label="إجراءات سريعة">
            {canOrders && <a href="#admin-orders">الطلبات الجديدة <span>↗</span></a>}
            {canCustomers && <a href="#admin-customers">إضافة عميل <span>＋</span></a>}
            {canCustomers && <a href="#admin-product-create">إضافة صنف <span>＋</span></a>}
            {canAdmin && <a href="#admin-settings">إعدادات العميل <span>⚙</span></a>}
            {canOrders && <a href="#admin-governance">مركز العمليات <span>⌁</span></a>}
            <a href="#admin-catalog">المساعد التشغيلي <span>◉</span></a>
          </div>

          <section className="control-hero-grid">
            <article className="control-hero-card">
              <div className="control-hero-copy">
                <span>تشغيل الأغبري</span>
                <h2>كل ما يحتاجه فريقك التجاري في شاشة واحدة.</h2>
                <p>
                  الوصول السريع إلى العمليات الفعلية، مع بيانات حية من قاعدة النظام وصلاحيات مرتبطة بالدور.
                </p>
                <div className="control-hero-actions">
                  {canOrders && <a href="#admin-orders">متابعة الطلبات</a>}
                  {canInventory && <a href="#admin-inventory">فحص المخزون</a>}
                  {canCustomers && <a href="#admin-customers">إدارة العملاء</a>}
                </div>
              </div>
              <div className="control-hero-metrics">
                <div><small>الذمم المدينة</small><strong>{loading ? '—' : money(snapshot.receivables)}</strong></div>
                <div><small>المتاح للشراء</small><strong>{loading ? '—' : money(snapshot.availableCredit)}</strong></div>
              </div>
            </article>

            <article className="control-focus-card">
              <header>
                <div>
                  <span>نبض التشغيل</span>
                  <h2>الحركة الحالية</h2>
                </div>
                <b>{loading ? '—' : snapshot.orders.toLocaleString('ar')}</b>
              </header>
              <div className="focus-lines">
                <div><span>الأصناف النشطة</span><strong>{loading ? '—' : snapshot.products.toLocaleString('ar')}</strong></div>
                <div><span>العملاء</span><strong>{loading ? '—' : snapshot.customers.toLocaleString('ar')}</strong></div>
                <div><span>أرصدة المخزون</span><strong>{loading ? '—' : snapshot.stockItems.toLocaleString('ar')}</strong></div>
              </div>
              <div className="focus-foot">
                <span>التدفق التجاري · 7 أيام</span>
                <strong>{loading ? '—' : money(snapshot.sales7d)}</strong>
              </div>
            </article>
          </section>

          <section className="control-kpi-grid" aria-label="مؤشرات سريعة">
            <article><span>العملاء</span><strong>{loading ? '—' : snapshot.customers.toLocaleString('ar')}</strong><small>حسابات التجار</small></article>
            <article><span>المنتجات</span><strong>{loading ? '—' : snapshot.products.toLocaleString('ar')}</strong><small>أصناف نشطة</small></article>
            <article><span>الطلبات</span><strong>{loading ? '—' : snapshot.orders.toLocaleString('ar')}</strong><small>كل حالات الطلب</small></article>
            <article><span>مخزون</span><strong>{loading ? '—' : snapshot.stockItems.toLocaleString('ar')}</strong><small>أرصدة تشغيلية</small></article>
            <article><span>الطلبات التشغيلية</span><strong>{latestOrders.length.toLocaleString('ar')}</strong><small>آخر عينة معروضة</small></article>
          </section>

          <div className="control-main-grid">
            <section className="control-widget">
              <header className="widget-header">
                <div><span>المبيعات</span><h2>حركة المبيعات خلال 7 أيام</h2></div>
                <strong>{loading ? '—' : money(snapshot.sales7d)}</strong>
              </header>
              <div className="sales-bars" aria-label="مخطط مبيعات سبعة أيام">
                {salesByDay.map((day) => (
                  <div key={day.key} className="sales-bar-col">
                    <strong>{day.value ? formatMoney(day.value) : '0'}</strong>
                    <div className="sales-bar-track">
                      <i style={{ height: `${Math.max(10, (day.value / maxSales) * 145)}px` }} />
                    </div>
                    <small>{day.label}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="control-widget">
              <header className="widget-header">
                <div><span>التشغيل</span><h2>حالة الطلبات</h2></div>
                <a href="#admin-orders">عرض الكل ←</a>
              </header>
              <div className="order-status-stack">
                {statusCounts.length ? statusCounts.map((item) => (
                  <div key={item.status}>
                    <div><span>{item.label}</span><strong>{item.count}</strong></div>
                    <div className="status-track"><i style={{ width: `${Math.min(100, (item.count / Math.max(orders.length, 1)) * 100)}%` }} /></div>
                  </div>
                )) : <p className="control-empty">لا توجد طلبات تشغيلية في العينة الحالية.</p>}
              </div>
            </section>
          </div>

          <div className="control-main-grid">
            <section className="control-widget">
              <header className="widget-header">
                <div><span>التشغيل</span><h2>أحدث الطلبات</h2></div>
                {canOrders && <a href="#admin-orders">عرض الكل ←</a>}
              </header>
              {latestOrders.length ? (
                <div className="recent-orders-table">
                  {latestOrders.map((order) => (
                    <div className="recent-order-row" key={order.id}>
                      <span className="order-number">#{order.order_number}</span>
                      <div><strong>{order.customer_name}</strong><small>{new Date(order.created_at).toLocaleString('ar-YE')}</small></div>
                      <b>{money(order.total)}</b>
                      <em>{STATUS_LABELS[order.status] ?? order.status}</em>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="control-empty">لا توجد طلبات بعد.</p>
              )}
            </section>

            <section className="control-widget control-quick-tools">
              <header className="widget-header">
                <div><span>الوصول المباشر</span><h2>أدوات التشغيل</h2></div>
                <span>تشغيل فعلي</span>
              </header>
              <div className="tool-pill-grid">
                {canCustomers && <a href="#admin-catalog">إدارة المنتجات</a>}
                {canCustomers && <a href="#admin-pricing-matrix">مصفوفة الأسعار</a>}
                {canCustomers && <a href="#admin-customers">أجهزة العملاء</a>}
                {canInventory && <a href="#admin-inventory-history">دفتر المخزون</a>}
                {canInventory && <a href="#admin-purchasing">المشتريات</a>}
                {canFinance && <a href="#admin-finance">الحسابات والمالية</a>}
                {canOrders && <a href="#admin-notifications">الإشعارات</a>}
                {canAdmin && <a href="#admin-access">المستخدمون والصلاحيات</a>}
              </div>
              <div className="tool-credit">
                <span>آخر تحديث</span>
                <strong>{lastUpdated ? lastUpdated.toLocaleTimeString('ar-YE') : 'جارٍ التحديث…'}</strong>
              </div>
            </section>
          </div>


          <section className="control-structure-index" aria-label="شجرة النظام الكاملة">
            <header className="control-structure-index-header">
              <div><span>الهيكلة الكاملة</span><h2>شجرة الأغبري التشغيلية</h2></div>
              <small>العناصر الحية تفتح مساحات العمل الحالية، وحدود النطاق تظهر صراحة ولا تتحول إلى وظائف وهمية.</small>
            </header>
            <div className="control-structure-groups">
              {AGHBARI_ADMIN_STRUCTURE.map((group) => {
                const boundaryItems = group.items.filter((item) => item.status !== 'live').slice(0, 8);
                const liveItems = group.items.filter((item) => item.status === 'live').slice(0, 8);
                if (!boundaryItems.length && !liveItems.length) return null;
                return (
                  <article className="control-structure-group" key={group.id}>
                    <header><span className="control-structure-group-icon">{group.icon}</span><div><h3>{group.label}</h3><small>{group.path}</small></div></header>
                    <div>
                      {liveItems.map((item) => item.target ? <Tile key={item.id} icon="↗" title={item.label} target={item.target} /> : null)}
                      {boundaryItems.map((item) => <BoundaryTile key={item.id} item={item} />)}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="control-section-grid-shell">
            <div className="control-section-grid-title">
              <div><span>الأقسام الرئيسية</span><h2>مركز الأغبري التشغيلي</h2></div>
              <small>كل بطاقة تفتح مساحة العمل الفعلية</small>
            </div>

            {canOrders && (
              <SectionCard icon="🛒" title="المبيعات والعملاء" description="الطلبات والعملاء ومسارات العمل اليومية">
                <Tile icon="👥" title="أجهزة العملاء" target="#admin-customers" tone="brand" />
                <Tile icon="🧾" title="الطلبات" target="#admin-orders" />
                <Tile icon="↪" title="مساحة عمل المدير" target="#admin-orders" />
                <Tile icon="🔔" title="الإشعارات" target="#admin-notifications" />
              </SectionCard>
            )}

            {canInventory && (
              <SectionCard icon="▣" title="الأصناف والمخزون" description="الكتالوج والأسعار والمستودعات والحركات">
                <Tile icon="▣" title="إدارة الأصناف" target="#admin-catalog" />
                <Tile icon="$" title="محرك التسعير" target="#admin-pricing-matrix" />
                <Tile icon="↻" title="مزامنة المخزون" target="#admin-inventory" tone="brand" />
                <Tile icon="⇄" title="التحويلات والحركات" target="#admin-inventory-history" />
                <Tile icon="⌂" title="المستودعات والفروع" target="#admin-warehouses" />
              </SectionCard>
            )}

            {canInventory && (
              <SectionCard icon="▤" title="إدارة البيانات" description="إدخال واسترجاع البيانات بشكل مضبوط">
                <Tile icon="▣" title="مركز البيانات الموحد" target="#admin-catalog" />
                <Tile icon="⇅" title="سجل الاستيراد" target="#admin-import" />
                <Tile icon="↥" title="مركز التصدير" target="#admin-export" />
                <Tile icon="◉" title="تحسين الصور" target="#admin-product-image" />
                <Tile icon="▥" title="إدارة الحركات" target="#admin-inventory-activity" />
              </SectionCard>
            )}

            {(canOrders || canFinance) && (
              <SectionCard icon="◫" title="الحسابات والحوكمة" description="المالية والتدقيق وطبقة التكامل">
                {canFinance && <Tile icon="◫" title="الحسابات والمالية" target="#admin-finance" />}
                {canFinance && <Tile icon="▤" title="السجل المالي" target="#admin-finance-history" />}
                {canOrders && <Tile icon="✓" title="التدقيق والتكاملات" target="#admin-governance" tone="brand" />}
                {canOrders && <Tile icon="↻" title="Outbox والعمليات" target="#admin-governance" />}
              </SectionCard>
            )}

            {(canAdmin || role === 'viewer') && (
              <SectionCard icon="♙" title="المستخدمون والأمان" description="الدخول والأدوار والصلاحيات وحدود الوصول">
                <Tile icon="♙" title="الموظفون والصلاحيات" target="#admin-access" tone="brand" />
                {canAdmin && <Tile icon="⚙" title="إعدادات العميل" target="#admin-settings" />}
                <Tile icon="🔔" title="الإشعارات" target="#admin-notifications" />
              </SectionCard>
            )}

            {canAdmin && (
              <SectionCard icon="⚙" title="الإعدادات والتكاملات" description="تخصيص تجربة العميل وقواعد التشغيل">
                <Tile icon="⚙" title="إعدادات العميل" target="#admin-settings" />
                <Tile icon="↕" title="الاستيراد والتصدير" target="#admin-export" />
                <Tile icon="▦" title="كتالوج العميل" target="#admin-catalog" />
              </SectionCard>
            )}
          </section>
        </main>

        <aside className="control-rail">
          <div className="rail-brand-card">
            <div className="rail-logo">أ</div>
            <div><strong>لوحة المعلومات</strong><small>الأغبري B2B Commerce</small></div>
          </div>

          <section className="rail-group">
            <header><span>🛒</span><h2>المبيعات والعملاء</h2></header>
            <div>
              {canOrders && <Tile icon="🧾" title="الطلبات" target="#admin-orders" />}
              {canCustomers && <Tile icon="♙" title="العملاء" target="#admin-customers" />}
              {canCustomers && <Tile icon="▣" title="أجهزة العملاء" target="#admin-customers" />}
              {canOrders && <Tile icon="▥" title="مساحة عمل المدير" target="#admin-orders" />}
            </div>
          </section>

          {canInventory && (
            <section className="rail-group">
              <header><span>▣</span><h2>الأصناف والمخزون</h2></header>
              <div>
                <Tile icon="▣" title="إدارة الأصناف" target="#admin-catalog" />
                <Tile icon="$" title="محرك التسعير الذكي" target="#admin-pricing-matrix" />
                <Tile icon="↻" title="مزامنة المخزون" target="#admin-inventory" />
                <Tile icon="⇄" title="دفتر الحركات" target="#admin-inventory-history" />
                <Tile icon="⌂" title="المستودعات والفروع" target="#admin-warehouses" />
              </div>
            </section>
          )}

          {canInventory && (
            <section className="rail-group">
              <header><span>▤</span><h2>إدارة البيانات</h2></header>
              <div>
                <Tile icon="▣" title="مركز البيانات الموحد" target="#admin-catalog" />
                <Tile icon="▤" title="سجل الاستيراد" target="#admin-import" />
                <Tile icon="⇅" title="مزامنة ونقل البيانات" target="#admin-export" />
                <Tile icon="🖼" title="تحسين الصور" target="#admin-product-image" />
                <Tile icon="⌁" title="لوحة إدارة الحركات" target="#admin-inventory-activity" />
              </div>
            </section>
          )}

          {(canOrders || canFinance) && (
            <section className="rail-group">
              <header><span>♙</span><h2>المستخدمون والأمان</h2></header>
              <div>
                {canOrders && <Tile icon="♙" title="الموظفون والصلاحيات" target="#admin-access" />}
                {canOrders && <Tile icon="✓" title="التدقيق والتكاملات" target="#admin-governance" />}
                {canOrders && <Tile icon="🔔" title="الإشعارات" target="#admin-notifications" />}
                {canFinance && <Tile icon="◫" title="الحسابات والمالية" target="#admin-finance" />}
              </div>
            </section>
          )}

          {canAdmin && (
            <section className="rail-group">
              <header><span>⚙</span><h2>الإعدادات والتكاملات</h2></header>
              <div>
                <Tile icon="⚙" title="إعدادات العميل" target="#admin-settings" />
                <Tile icon="⇅" title="الاستيراد والتصدير" target="#admin-export" />
                <Tile icon="▦" title="إدارة الكتالوج" target="#admin-catalog" />
              </div>
            </section>
          )}

          <div className="rail-footer-card">
            <span>الحالة</span>
            <strong><i aria-hidden="true">●</i> البيانات مرتبطة بالنظام</strong>
            <small>{lastUpdated ? `آخر تحديث ${lastUpdated.toLocaleTimeString('ar-YE')}` : 'جارٍ التحديث…'}</small>
          </div>
        </aside>
      </div>

      <footer className="control-plane-footer">
        <span>الأغبري Commerce · المصدر التشغيلي للمعاملات</span>
        <span>التحديث التلقائي كل 60 ثانية</span>
        <span>{roleLabels[role]}</span>
      </footer>
    </section>
  );
}
