import { useEffect, useMemo, useState } from 'react';
import { getAdminStructureForRole } from './structure/admin-structure';
import { CUSTOMER_PORTAL_SECTIONS, type CustomerPortalSection } from './structure/customer-structure';
import './workspace-surface.css';

type StaffRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type WorkspaceSurfaceRailProps =
  | { variant: 'staff'; role: StaffRole }
  | { variant: 'customer'; section: CustomerPortalSection; onSelect: (section: CustomerPortalSection) => void };

const STAFF_PACKS = [
  { id: 'command', label: 'مركز القيادة', eyebrow: 'التشغيل', target: '#admin-dashboard', tone: 'live' },
  { id: 'sales', label: 'المبيعات والطلبات', eyebrow: 'الطلبات والعملاء', target: '#admin-orders', tone: 'live' },
  { id: 'data', label: 'البيانات والاستيراد', eyebrow: 'الاستيراد والتصدير', target: '#admin-import', tone: 'live' },
  { id: 'inventory', label: 'المخزون', eyebrow: 'الحركة والجرد', target: '#admin-inventory', tone: 'live' },
  { id: 'catalog', label: 'الكتالوج والتسعير', eyebrow: 'الأصناف', target: '#admin-catalog', tone: 'live' },
  { id: 'finance', label: 'المالية التشغيلية', eyebrow: 'الحسابات', target: '#admin-finance', tone: 'live' },
  { id: 'governance', label: 'الحوكمة والتدقيق', eyebrow: 'الثقة', target: '#admin-governance', tone: 'mixed' },
  { id: 'boundaries', label: 'الحدود والتكاملات', eyebrow: 'خارج Commerce', target: '#admin-boundaries', tone: 'boundary' },
] as const;

const CUSTOMER_PACKS = [
  { id: 'catalog', label: 'اكتشاف وشراء', eyebrow: 'الكتالوج', description: 'البحث، التصنيف، السعر، المخزون والطلب السريع.' },
  { id: 'orders', label: 'الطلبات والتتبع', eyebrow: 'المتابعة', description: 'السجل، التفاصيل، الحالة وإعادة الطلب.' },
  { id: 'finance', label: 'المركز المالي', eyebrow: 'الثقة المالية', description: 'الكشف والفواتير والمدفوعات المتاحة.' },
  { id: 'templates', label: 'الطلبات المتكررة', eyebrow: 'المسحات', description: 'حفظ السلة وإعادة التطبيق بسرعة.' },
  { id: 'account', label: 'الحساب والشركة', eyebrow: 'السياق', description: 'الملف، الشركة، العناوين والإعدادات.' },
  { id: 'notifications', label: 'الإشعارات', eyebrow: 'التشغيل', description: 'تنبيهات مرتبطة بالحساب والطلبات.' },
] as const;

export default function WorkspaceSurfaceRail(props: WorkspaceSurfaceRailProps) {
  const [activeStaffTarget, setActiveStaffTarget] = useState(() =>
    typeof window === 'undefined' ? '#admin-dashboard' : window.location.hash || '#admin-dashboard'
  );

  useEffect(() => {
    if (props.variant !== 'staff') return;
    const sync = () => setActiveStaffTarget(window.location.hash || '#admin-dashboard');
    window.addEventListener('hashchange', sync);
    sync();
    return () => window.removeEventListener('hashchange', sync);
  }, [props.variant]);

  const allowedStaffTargets = useMemo(() => {
    if (props.variant !== 'staff') return new Set<string>();
    const allowed = new Set<string>();
    for (const group of getAdminStructureForRole(props.role)) {
      for (const item of group.items) if (item.status === 'live' && item.target) allowed.add(item.target);
    }
    return allowed;
  }, [props.variant === 'staff' ? props.role : 'customer']);

  if (props.variant === 'customer') {
    return (
      <section className="workspace-surface-rail customer-surface-rail" aria-label="مسارات بوابة الأغبري">
        <div className="workspace-surface-rail-head">
          <div>
            <span className="eyebrow">تجربة الأغبري</span>
            <strong>مساحات العمل</strong>
            <small>انتقل بين مراحل رحلة الشراء دون فقدان سياق الحساب.</small>
          </div>
          <span className="workspace-surface-count">{CUSTOMER_PORTAL_SECTIONS.length} مساحات</span>
        </div>
        <div className="workspace-surface-grid">
          {CUSTOMER_PACKS.map((pack) => {
            const active = props.section === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                className={active ? 'workspace-surface-item active' : 'workspace-surface-item'}
                aria-current={active ? 'page' : undefined}
                onClick={() => props.onSelect(pack.id)}
              >
                <span className="workspace-surface-index">{String(CUSTOMER_PACKS.findIndex((entry) => entry.id === pack.id) + 1).padStart(2, '0')}</span>
                <span className="workspace-surface-copy">
                  <small>{pack.eyebrow}</small>
                  <strong>{pack.label}</strong>
                  <em>{pack.description}</em>
                </span>
                <b aria-hidden="true">{active ? '●' : '↗'}</b>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-surface-rail staff-surface-rail" aria-label="مساحات عمل مركز التشغيل">
      <div className="workspace-surface-rail-head">
        <div>
          <span className="eyebrow">الأغبري · Control Surface</span>
          <strong>كل مساحة تشغيل في طبقة واحدة</strong>
          <small>روابط مرئية للشاشات الحية مع الحدود غير التنفيذية في مكانها.</small>
        </div>
        <span className="workspace-surface-count">{allowedStaffTargets.size} وجهة مسموحة</span>
      </div>
      <div className="workspace-surface-grid">
        {STAFF_PACKS.map((pack, index) => {
          const enabled = allowedStaffTargets.has(pack.target) || pack.tone === 'boundary';
          const active = activeStaffTarget === pack.target;
          if (!enabled) return null;
          return (
            <a
              key={pack.id}
              href={pack.target}
              className={active ? `workspace-surface-item active tone-${pack.tone}` : `workspace-surface-item tone-${pack.tone}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="workspace-surface-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="workspace-surface-copy">
                <small>{pack.eyebrow}</small>
                <strong>{pack.label}</strong>
                <em>{pack.tone === 'boundary' ? 'قدرات خارج عقد Commerce الحالي' : 'فتح مساحة التشغيل الفعلية'}</em>
              </span>
              <b aria-hidden="true">{active ? '●' : '↗'}</b>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export { STAFF_PACKS, CUSTOMER_PACKS };
