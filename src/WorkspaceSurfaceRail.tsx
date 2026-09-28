import { useEffect, useMemo, useState } from 'react';
import { getAdminStructureForRole } from './structure/admin-structure';
import { AGHBARI_CUSTOMER_STRUCTURE, CUSTOMER_PORTAL_SECTIONS, type CustomerPortalSection } from './structure/customer-structure';
import './workspace-surface.css';

type StaffRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type WorkspaceSurfaceRailProps =
  | { variant: 'staff'; role: StaffRole }
  | { variant: 'customer'; section: CustomerPortalSection; onSelect: (section: CustomerPortalSection) => void; visibleSections?: readonly CustomerPortalSection[] };

const STAFF_PACKS = [
  { id: 'command', label: 'مركز القيادة', eyebrow: 'التشغيل', target: '#admin-dashboard', targets: ['#admin-dashboard'], tone: 'live' },
  { id: 'sales', label: 'المبيعات والطلبات', eyebrow: 'الطلبات والعملاء', target: '#admin-orders', targets: ['#admin-orders', '#admin-customers'], tone: 'live' },
  { id: 'data', label: 'البيانات والاستيراد', eyebrow: 'الاستيراد والتصدير', target: '#admin-import', targets: ['#admin-import', '#admin-export'], tone: 'live' },
  { id: 'inventory', label: 'المخزون', eyebrow: 'الحركة والجرد', target: '#admin-inventory-activity', targets: ['#admin-inventory-activity', '#admin-inventory-history', '#admin-warehouses'], tone: 'live' },
  { id: 'purchasing', label: 'المشتريات والتوريد', eyebrow: 'التوريد والاستلام', target: '#admin-purchasing', targets: ['#admin-purchasing', '#admin-suppliers', '#admin-receipts'], tone: 'live' },
  { id: 'catalog', label: 'الكتالوج والتسعير', eyebrow: 'الأصناف', target: '#admin-catalog', targets: ['#admin-catalog', '#admin-pricing-matrix', '#admin-product-image'], tone: 'live' },
  { id: 'finance', label: 'المالية التشغيلية', eyebrow: 'الحسابات', target: '#admin-finance', targets: ['#admin-finance'], tone: 'live' },
  { id: 'access', label: 'المستخدمون والصلاحيات', eyebrow: 'الحوكمة', target: '#admin-access', targets: ['#admin-access'], tone: 'live' },
  { id: 'settings', label: 'الإعدادات والهوية', eyebrow: 'التهيئة', target: '#admin-settings', targets: ['#admin-settings'], tone: 'live' },
  { id: 'governance', label: 'الحوكمة والتدقيق', eyebrow: 'الثقة', target: '#admin-governance', targets: ['#admin-governance', '#admin-notifications'], tone: 'mixed' },

  { id: 'boundaries', label: 'الحدود والتكاملات', eyebrow: 'خارج Commerce', target: '#admin-boundaries', tone: 'boundary' },
] as const;

const CUSTOMER_PACKS = [
  { id: 'catalog', label: 'اكتشاف وشراء', eyebrow: 'الكتالوج', description: 'البحث، التصنيف، السعر، المخزون والطلب السريع.' },
  { id: 'orders', label: 'الطلبات والتتبع', eyebrow: 'المتابعة', description: 'السجل، التفاصيل، الحالة وإعادة الطلب.' },
  { id: 'finance', label: 'المركز المالي', eyebrow: 'الثقة المالية', description: 'الكشف والفواتير والمدفوعات المتاحة.' },
  { id: 'templates', label: 'الطلبات المتكررة', eyebrow: 'القوالب', description: 'حفظ السلة وإعادة التطبيق بسرعة.' },
  { id: 'account', label: 'الحساب والشركة', eyebrow: 'السياق', description: 'الملف، الشركة، العناوين والإعدادات.' },
  { id: 'notifications', label: 'الإشعارات', eyebrow: 'التشغيل', description: 'تنبيهات مرتبطة بالحساب والطلبات.' },
] as const;

const CUSTOMER_NEXT_SECTION: Partial<Record<CustomerPortalSection, CustomerPortalSection>> = {
  catalog: 'orders',
  orders: 'catalog',
  finance: 'account',
  templates: 'catalog',
  account: 'catalog',
  notifications: 'orders',
};

export function getCustomerSurfaceItems(section: CustomerPortalSection, visibleSections: readonly CustomerPortalSection[] = CUSTOMER_PORTAL_SECTIONS) {
  return AGHBARI_CUSTOMER_STRUCTURE.filter((item) => item.section === section && visibleSections.includes(item.section));
}

export function getStaffSurfaceItems(role: StaffRole, target: string | readonly string[]) {
  const targets = new Set(typeof target === 'string' ? [target] : target);
  return getAdminStructureForRole(role)
    .flatMap((group) => group.items)
    .filter((item) => item.status === 'live' && item.target && targets.has(item.target.trim()));
}

export function getStaffBoundaryItems(role: StaffRole) {
  return getAdminStructureForRole(role)
    .flatMap((group) => group.items)
    .filter((item) => item.status !== 'live');
}

function staffItemHref(item: { path: string; target?: string }) {
  return item.path.includes('/:') ? (item.target ?? '#admin-boundaries') : item.path;
}

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

  const boundaryVisible = useMemo(() => {
    if (props.variant !== 'staff') return false;
    return getAdminStructureForRole(props.role).some((group) => group.items.some((item) => item.status !== 'live'));
  }, [props.variant === 'staff' ? props.role : 'customer']);

  if (props.variant === 'customer') {
    const visibleSections = props.visibleSections ?? CUSTOMER_PORTAL_SECTIONS;
    const activePackIndex = CUSTOMER_PACKS.findIndex((pack) => pack.id === props.section);
    const surfaceItems = getCustomerSurfaceItems(props.section, visibleSections);
    const nextSection = CUSTOMER_NEXT_SECTION[props.section];
    const nextPack = nextSection ? CUSTOMER_PACKS.find((pack) => pack.id === nextSection) : undefined;

    return (
      <section className="workspace-surface-rail customer-surface-rail" aria-label="مسارات بوابة الأغبري">
        <div className="workspace-surface-rail-head">
          <div>
            <span className="eyebrow">تجربة الأغبري</span>
            <strong>مساحات العمل</strong>
            <small>انتقل بين مراحل رحلة الشراء مع كشف القدرات الفعلية للقسم الحالي.</small>
          </div>
          <span className="workspace-surface-count">{visibleSections.length} مساحات · {surfaceItems.length} قدرات</span>
        </div>
        <div className="workspace-surface-grid">
          {CUSTOMER_PACKS.filter((pack) => visibleSections.includes(pack.id)).map((pack) => {
            const active = props.section === pack.id;
            const index = CUSTOMER_PACKS.filter((entry) => visibleSections.includes(entry.id)).findIndex((entry) => entry.id === pack.id);
            return (
              <button key={pack.id} type="button" className={active ? 'workspace-surface-item active' : 'workspace-surface-item'} aria-current={active ? 'page' : undefined} onClick={() => props.onSelect(pack.id)}>
                <span className="workspace-surface-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="workspace-surface-copy"><small>{pack.eyebrow}</small><strong>{pack.label}</strong><em>{pack.description}</em></span>
                <b aria-hidden="true">{active ? '●' : '↗'}</b>
              </button>
            );
          })}
        </div>
        <div className="workspace-surface-capabilities" aria-label={`قدرات قسم ${CUSTOMER_PACKS[activePackIndex]?.label ?? props.section}`}>
          <div className="workspace-surface-capabilities-head">
            <div><span className="eyebrow">تفاصيل القسم</span><strong>كل الوظائف المرتبطة بالمساحة الحالية</strong></div>
            {nextPack && visibleSections.includes(nextPack.id) && <button type="button" className="workspace-surface-next" onClick={() => props.onSelect(nextPack.id)}>التالي: {nextPack.label} <span aria-hidden="true">→</span></button>}
          </div>
          <div className="workspace-surface-capability-list">
            {surfaceItems.map((item) => (
              <span key={item.id} className={item.status === 'live' ? 'workspace-surface-capability is-live' : 'workspace-surface-capability'}>
                <b aria-hidden="true">{item.status === 'live' ? '✓' : '•'}</b>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-surface-rail staff-surface-rail" aria-label="مساحات عمل مركز التشغيل">
      <div className="workspace-surface-rail-head">
        <div><span className="eyebrow">الأغبري · Control Surface</span><strong>كل مساحة تشغيل في طبقة واحدة</strong><small>روابط مرئية للشاشات الحية مع الحدود غير التنفيذية في مكانها.</small></div>
        <span className="workspace-surface-count">{allowedStaffTargets.size} وجهة مسموحة</span>
      </div>
      <div className="workspace-surface-grid">
        {STAFF_PACKS.map((pack, index) => {
          const packTargets: readonly string[] = 'targets' in pack ? pack.targets : [pack.target];
          const enabled = packTargets.some((target) => allowedStaffTargets.has(target)) || (pack.tone === 'boundary' && boundaryVisible);
          const active = packTargets.includes(activeStaffTarget);
          if (!enabled) return null;
          const packItems = pack.tone === 'boundary' ? [] : getStaffSurfaceItems(props.role, packTargets);
          const boundaryItems = pack.tone === 'boundary' ? getStaffBoundaryItems(props.role) : [];
          const className = 'workspace-surface-item' + (active ? ' active' : '') + ' tone-' + pack.tone;
          return (
            <div key={pack.id} className={className}>
              <a href={pack.target} className="workspace-surface-primary" aria-current={active ? 'page' : undefined}>
                <span className="workspace-surface-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="workspace-surface-copy"><small>{pack.eyebrow}</small><strong>{pack.label}</strong><em>{pack.tone === 'boundary' ? 'قدرات خارج عقد Commerce الحالي' : 'فتح مساحة التشغيل الفعلية'}</em></span>
                <b aria-hidden="true">{active ? '●' : '↗'}</b>
              </a>
              {packItems.length > 0 && (
                <nav className="workspace-surface-subitems" aria-label={'قدرات ' + pack.label}>
                  {packItems.map((item) => <a key={item.id} href={staffItemHref(item)} title={item.note ?? item.path}>{item.label}<span aria-hidden="true">↗</span></a>)}
                </nav>
              )}
              {boundaryItems.length > 0 && (
                <div className="workspace-surface-subitems workspace-surface-boundaries" aria-label="حدود خارج Commerce">
                  {boundaryItems.map((item) => <a key={item.id} href="#admin-boundaries" title={item.note ?? item.label}><span>• {item.label}</span><span aria-hidden="true">↗</span></a>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="workspace-surface-staff-meta" aria-label="ملخص صلاحيات ومساحات التشغيل">
        <span><b>{allowedStaffTargets.size}</b> وجهة حية</span>
        <span><b>{getAdminStructureForRole(props.role).reduce((count, group) => count + group.items.filter((item) => item.status === 'boundary').length, 0)}</b> حدود واضحة</span>
        <span><b>{props.role}</b> صلاحية الجلسة</span>
      </div>
    </section>
  );
}

export { STAFF_PACKS, CUSTOMER_PACKS };
