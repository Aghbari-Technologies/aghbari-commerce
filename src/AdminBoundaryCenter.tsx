import { getAdminStructureForRole, type AdminStructureItem } from './structure/admin-structure';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

const SAFE_ALTERNATIVES: Record<string, { label: string; target: string }> = {
  devices: { label: 'دورة العملاء الحالية', target: '#admin-customers' },
  'inventory-sync': { label: 'المخزون التشغيلي', target: '#admin-inventory' },
  promotions: { label: 'الكتالوج والتسعير', target: '#admin-catalog' },
  'import-logs': { label: 'الاستيراد ومصالحة المصدر', target: '#admin-import' },
  'legacy-sync': { label: 'مركز البيانات', target: '#admin-export' },
  'finance-data': { label: 'المالية التشغيلية', target: '#admin-finance' },
  'ai-dashboard': { label: 'لوحة التشغيل', target: '#admin-dashboard' },
  'ai-reports': { label: 'بوابة الحوكمة', target: '#admin-governance' },
  'ai-alerts': { label: 'الإشعارات التشغيلية', target: '#admin-notifications' },
  'ai-tasks': { label: 'مركز التشغيل', target: '#admin-dashboard' },
  'ai-assistant': { label: 'مركز الأوامر', target: '#admin-dashboard' },
  'ai-governance': { label: 'الحوكمة', target: '#admin-governance' },
  'ai-insights': { label: 'التشغيل والبيانات', target: '#admin-dashboard' },
  'ai-prompts': { label: 'العمل التشغيلي', target: '#admin-dashboard' },
  'ai-models': { label: 'الإعدادات', target: '#admin-settings' },
  'ai-settings': { label: 'إعدادات العميل', target: '#admin-settings' },
  'ai-audit': { label: 'سجل العمليات', target: '#admin-governance' },
  'ai-executive': { label: 'لوحة التشغيل', target: '#admin-dashboard' },
  reports: { label: 'سجل العمليات', target: '#admin-governance' },
  errors: { label: 'الأحداث والطوابير', target: '#admin-governance' },
  health: { label: 'الحوكمة والتشغيل', target: '#admin-governance' },
  invites: { label: 'دورة العميل', target: '#admin-customers' },
  onyx: { label: 'البنية والحدود', target: '#admin-governance' },
  restore: { label: 'مركز التعارض والاسترداد', target: '#admin-recovery' },
  'dev-ai': { label: 'الحوكمة', target: '#admin-governance' },
  patches: { label: 'الحوكمة', target: '#admin-governance' },
  'dev-audit': { label: 'سجل العمليات', target: '#admin-governance' },
  'dev-settings': { label: 'إعدادات العميل', target: '#admin-settings' },
};

function BoundaryCard({ item }: { item: AdminStructureItem }) {
  const alternative = SAFE_ALTERNATIVES[item.id];
  return <article className="admin-boundary-card" data-status={item.status} data-path={item.path}>
    <div className="admin-boundary-card-head">
      <div>
        <span className="eyebrow">حد نطاق / عقد غير متوفر</span>
        <h3>{item.label}</h3>
      </div>
      <span className="admin-boundary-badge">{item.status === 'contract-gap' ? 'عقد مطلوب' : 'خارج النطاق الحالي'}</span>
    </div>
    <div className="admin-boundary-card-meta"><code dir="ltr">{item.path}</code><span>{item.permission}</span></div>
    <p>{item.note ?? 'لا توجد بيانات تشغيلية canonical لهذا المسار في Commerce الحالي.'}</p>
    <div className="admin-boundary-card-actions">
      {alternative && <a href={alternative.target}>{alternative.label}<span aria-hidden="true">↗</span></a>}
      <span className="admin-boundary-no-fake">لا توجد بيانات تجريبية ولا عمليات وهمية</span>
    </div>
  </article>;
}

export default function AdminBoundaryCenter({ role }: { role: UserRole }) {
  const boundaries = getAdminStructureForRole(role).flatMap((group) => group.items.filter((item) => item.status !== 'live'));
  if (!boundaries.length) return null;
  return <section className="admin-boundary-center" id="admin-boundaries" aria-labelledby="admin-boundaries-title">
    <div className="admin-boundary-center-heading">
      <div>
        <span className="eyebrow">تغطية واجهة كاملة بدون اختلاق عقد</span>
        <h2 id="admin-boundaries-title">الأسطح غير المتعاقدة</h2>
        <p>كل مسار مرجعي ظاهر هنا كواجهة فعلية مع حدوده، بدل Route فارغ أو شاشة توحي بقدرة غير موجودة. عند توفر بديل تشغيلي حالي يظهر الانتقال المباشر إليه.</p>
      </div>
      <strong>{boundaries.length} أسطح</strong>
    </div>
    <div className="admin-boundary-grid">{boundaries.map((item) => <BoundaryCard key={item.id} item={item} />)}</div>
  </section>;
}
