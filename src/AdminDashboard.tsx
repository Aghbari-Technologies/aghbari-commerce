import { useCallback, useEffect, useState } from 'react';
import AdminPanel from './AdminPanel';
import { supabase } from './lib/supabase';
import './admin-dashboard.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

type DashboardStats = { orders: number; customers: number; products: number; warehouses: number };

const sections = [
  { id: 'account', label: 'المبيعات والطلبات', short: 'الطلبات', icon: '↗' },
  { id: 'customers', label: 'العملاء والحسابات', short: 'العملاء', icon: '◎' },
  { id: 'inventory', label: 'الأصناف والمخزون', short: 'المخزون', icon: '▦' },
  { id: 'purchasing', label: 'المشتريات والتوريد', short: 'التوريد', icon: '↔' },
  { id: 'finance', label: 'المالية', short: 'المالية', icon: '◇' },
  { id: 'exports', label: 'التقارير والتصدير', short: 'التقارير', icon: '▤' },
];

const advanced = [
  { label: 'مساحة عمل المدير', note: 'تشغيل ومعاينة من مكان واحد', id: 'account' },
  { label: 'مركز البيانات', note: 'الاستيراد والصور والتصدير', id: 'exports' },
  { label: 'الذكاء والتنبيهات', note: 'واجهة محجوزة للمحركات الفعلية', id: 'account' },
  { label: 'الأمان والصلاحيات', note: 'RBAC على الواجهة والخادم', id: 'customers' },
];

const initialStats: DashboardStats = { orders: 0, customers: 0, products: 0, warehouses: 0 };

export default function AdminDashboard({ role }: { role: UserRole }) {
  const [active, setActive] = useState('account');
  const [stats, setStats] = useState(initialStats);
  const [live, setLive] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!supabase) return;
    const [orders, customers, products, warehouses] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('warehouses').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    const firstError = [orders, customers, products, warehouses].find((result) => result.error)?.error;
    if (firstError) throw firstError;
    setStats({ orders: orders.count ?? 0, customers: customers.count ?? 0, products: products.count ?? 0, warehouses: warehouses.count ?? 0 });
    setStatsError(null);
  }, []);

  useEffect(() => {
    void loadStats().catch((error) => setStatsError(error instanceof Error ? error.message : 'تعذر تحميل مؤشرات لوحة التحكم.'));
  }, [loadStats]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('aghbari-admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { setLive(true); void loadStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { setLive(true); void loadStats(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => { setLive(true); void loadStats(); })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));
    return () => { void supabase.removeChannel(channel); };
  }, [loadStats]);

  function go(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return <section className="admin-dashboard" id="admin-dashboard">
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar" aria-label="تنقل الإدارة">
        <div className="admin-sidebar-brand"><span className="brand-mark">أ</span><div><strong>الأغبري</strong><small>مركز الإدارة</small></div></div>
        <div className="admin-sidebar-label">التشغيل</div>
        <div className="admin-sidebar-links">{sections.map((section) => <button key={section.id} className={active === section.id ? 'active' : ''} onClick={() => go(section.id)}><span className="admin-sidebar-icon">{section.icon}</span><span>{section.label}</span></button>)}</div>
        <div className="admin-sidebar-label">الوصول السريع</div>
        <div className="admin-sidebar-links compact">{advanced.map((item) => <button key={item.label} onClick={() => go(item.id)}><span>•</span><span><strong>{item.label}</strong><small>{item.note}</small></span></button>)}</div>
        <div className="admin-sidebar-footer"><span className={live ? 'live-dot on' : 'live-dot'} />{live ? 'تحديثات لحظية مفعّلة' : 'جاري الاتصال بالتحديثات اللحظية'}<strong>{role}</strong></div>
      </aside>

      <div className="admin-dashboard-main">
        <header className="admin-dashboard-head"><div><span className="eyebrow">لوحة التشغيل التنفيذية</span><h2>مركز إدارة الأغبري</h2><p>الطلبات والعملاء والأصناف والمخزون والتوريد والمالية في مساحة تشغيل واحدة.</p></div><div className="admin-role"><span>الحساب الحالي</span><strong>{role}</strong><small>{live ? '● مباشر' : '○ في انتظار الاتصال'}</small></div></header>
        <div className="admin-kpi-grid" aria-label="مؤشرات التشغيل">
          <article><span>الطلبات</span><strong>{stats.orders}</strong><small>إجمالي السجلات</small></article>
          <article><span>العملاء</span><strong>{stats.customers}</strong><small>حسابات مسجلة</small></article>
          <article><span>الأصناف النشطة</span><strong>{stats.products}</strong><small>من قاعدة البيانات</small></article>
          <article><span>المستودعات</span><strong>{stats.warehouses}</strong><small>مستودعات نشطة</small></article>
        </div>
        {statsError && <div className="error-banner" role="alert">تعذر تحديث المؤشرات: {statsError}</div>}
        <div className="admin-section-nav" aria-label="أقسام لوحة التحكم">{sections.map((section) => <button key={section.id} className={active === section.id ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => go(section.id)}><span>{section.icon}</span><strong>{section.short}</strong></button>)}</div>
        <div className="admin-command-grid">
          <button onClick={() => go('account')}><span>01 · المبيعات</span><strong>إدارة دورة الطلب</strong><small>قائمة التشغيل وتحويل الحالات</small></button>
          <button onClick={() => go('customers')}><span>02 · الحسابات</span><strong>العملاء وشرائح الأسعار</strong><small>إنشاء وتفعيل وتصنيف العملاء</small></button>
          <button onClick={() => go('inventory')}><span>03 · المخزون</span><strong>التوفر والمستودعات</strong><small>تعديل المخزون وحركة الأصناف</small></button>
          <button onClick={() => go('purchasing')}><span>04 · التوريد</span><strong>المشتريات</strong><small>تشغيل دورة التوريد</small></button>
          <button onClick={() => go('finance')}><span>05 · المالية</span><strong>المالية والتحصيل</strong><small>العمليات المتاحة للدور</small></button>
          <button onClick={() => go('exports')}><span>06 · البيانات</span><strong>التقارير والتصدير</strong><small>إخراج البيانات التشغيلية</small></button>
        </div>
        <div className="admin-capability-strip" aria-label="قدرات النظام"><div><b>Realtime</b><span>مؤشرات الطلبات والبيانات الأساسية تتحدث دون Refresh.</span></div><div><b>RBAC</b><span>صلاحيات الدور تُطبق في الواجهة ويُعاد فرضها خادميًا.</span></div><div><b>Data-safe</b><span>السعر المعروض للعميل مصدره الخادم وليس مدخلًا من المتصفح.</span></div></div>
        <AdminPanel role={role} />
      </div>
    </div>
  </section>;
}
