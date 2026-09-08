import { useState } from 'react';
import AdminPanel from './AdminPanel';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

const sections = [
  { id: 'account', label: 'لوحة الطلبات', icon: '01' },
  { id: 'customers', label: 'العملاء والحسابات', icon: '02' },
  { id: 'inventory', label: 'المخزون والمستودعات', icon: '03' },
  { id: 'purchasing', label: 'المشتريات والتوريد', icon: '04' },
  { id: 'finance', label: 'المالية', icon: '05' },
  { id: 'exports', label: 'التقارير والتصدير', icon: '06' },
];

export default function AdminDashboard({ role }: { role: UserRole }) {
  const [active, setActive] = useState('account');

  function go(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="admin-dashboard" id="admin-dashboard">
      <div className="admin-dashboard-head">
        <div>
          <span className="eyebrow">بوابة الإدارة</span>
          <h2>مركز تشغيل الأغبري</h2>
          <p>مساحة تشغيل احترافية لإدارة دورة الطلب، العملاء، المنتجات، المخزون، التوريد والمالية.</p>
        </div>
        <div className="admin-role"><span>الدور الحالي</span><strong>{role}</strong></div>
      </div>

      <div className="admin-section-nav" aria-label="أقسام لوحة التحكم">
        {sections.map((section) => (
          <button key={section.id} className={active === section.id ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => go(section.id)}>
            <span>{section.icon}</span>
            <strong>{section.label}</strong>
          </button>
        ))}
      </div>

      <div className="admin-command-grid">
        <button onClick={() => go('account')}><span>01 · الطلبات</span><strong>إدارة دورة الطلب</strong><small>مراجعة وتحويل حالات الطلبات</small></button>
        <button onClick={() => go('customers')}><span>02 · العملاء</span><strong>الحسابات والأسعار</strong><small>فئات العملاء وإدارة الحسابات</small></button>
        <button onClick={() => go('inventory')}><span>03 · المخزون</span><strong>المستودعات والتوفر</strong><small>نقل وجرد وتنبيهات إعادة الطلب</small></button>
        <button onClick={() => go('finance')}><span>04 · المالية</span><strong>الفواتير والتحصيل</strong><small>النقدية والمصروفات والتصدير</small></button>
      </div>

      <AdminPanel role={role} />
    </section>
  );
}
