import type { StructureStatus } from './admin-structure';

export type UiReferencePackStatus = 'in-scope-visual' | 'mixed-visual' | 'external-pattern';

export interface UiReferencePack {
  id: string;
  title: string;
  area: string;
  status: UiReferencePackStatus;
  target: string;
  note: string;
  references: readonly string[];
}

export const UI_REFERENCE_PACKS: readonly UiReferencePack[] = [
  { id: 'command-center', title: 'مركز القيادة', area: 'العمل التشغيلي', status: 'in-scope-visual', target: '#admin-dashboard', note: 'لوحة القيادة، الشجرة، البنية العامة ومسارات التشغيل.', references: ["1.png","2.png","3.png","لقطة شاشة 2026-08-06 150303.png","لقطة شاشة 2026-08-06 150329.png"] },
  { id: 'sales-orders', title: 'المبيعات والطلبات', area: 'الطلبات والعملاء', status: 'in-scope-visual', target: '#admin-orders', note: 'القوائم، التفاصيل، حالات الطلب ومسارات العملاء.', references: ["لقطة شاشة 2026-08-06 150354.png","لقطة شاشة 2026-08-06 150421.png","لقطة شاشة 2026-08-06 150457.png","لقطة شاشة 2026-08-06 150526.png","لقطة شاشة 2026-08-06 150556.png","لقطة شاشة 2026-08-06 150633.png","لقطة شاشة 2026-08-06 150708.png","لقطة شاشة 2026-08-06 150743.png","لقطة شاشة 2026-08-06 150815.png","لقطة شاشة 2026-08-06 150840.png","لقطة شاشة 2026-08-06 150907.png","لقطة شاشة 2026-08-06 150938.png","لقطة شاشة 2026-08-06 151020.png","لقطة شاشة 2026-08-06 151045.png","لقطة شاشة 2026-08-06 151202.png","لقطة شاشة 2026-08-06 151249.png","لقطة شاشة 2026-08-06 151316.png","لقطة شاشة 2026-08-06 151344.png","لقطة شاشة 2026-08-06 151413.png","لقطة شاشة 2026-08-06 151445.png"] },
  { id: 'imports-data', title: 'إدارة البيانات', area: 'الاستيراد والتحقق', status: 'in-scope-visual', target: '#admin-import', note: 'الاستيراد، المصالحة، البيانات والعمليات المساندة.', references: ["لقطة شاشة 2026-08-06 151523.png","لقطة شاشة 2026-08-06 151606.png","لقطة شاشة 2026-08-06 151650.png","لقطة شاشة 2026-08-06 151739.png","لقطة شاشة 2026-08-06 151814.png","لقطة شاشة 2026-08-06 151855.png","لقطة شاشة 2026-08-06 152002.png"] },
  { id: 'inventory', title: 'المخزون', area: 'الحركة والجرد والمستودعات', status: 'in-scope-visual', target: '#admin-inventory-activity', note: 'المخزون، الحركات، الجرد، التحويلات والمستودعات.', references: ["لقطة شاشة 2026-08-06 152023.png","لقطة شاشة 2026-08-06 152046.png","لقطة شاشة 2026-08-06 152107.png","لقطة شاشة 2026-08-06 152134.png","لقطة شاشة 2026-08-06 152155.png","لقطة شاشة 2026-08-06 152215.png","لقطة شاشة 2026-08-06 152236.png","لقطة شاشة 2026-08-06 152300.png","لقطة شاشة 2026-08-06 152326.png","لقطة شاشة 2026-08-06 152352.png","لقطة شاشة 2026-08-06 152432.png","لقطة شاشة 2026-08-06 152459.png","لقطة شاشة 2026-08-06 152524.png","لقطة شاشة 2026-08-06 152547.png","لقطة شاشة 2026-08-06 152614.png","لقطة شاشة 2026-08-06 152639.png","لقطة شاشة 2026-08-06 152709.png","لقطة شاشة 2026-08-06 152734.png"] },
  { id: 'analytics', title: 'التحليلات/الذكاء', area: 'حدود التحليلات الخارجية', status: 'external-pattern', target: '#admin-boundaries', note: 'المراجع التحليلية/الذكاء المتقدمة تبقى خارج Commerce transactional core.', references: ["لقطة شاشة 2026-08-06 152813.png","لقطة شاشة 2026-08-06 152845.png","لقطة شاشة 2026-08-06 152925.png","لقطة شاشة 2026-08-06 152944.png","لقطة شاشة 2026-08-06 153012.png","لقطة شاشة 2026-08-06 153032.png","لقطة شاشة 2026-08-06 153055.png","لقطة شاشة 2026-08-06 153124.png","لقطة شاشة 2026-08-06 153150.png","لقطة شاشة 2026-08-06 153238.png","لقطة شاشة 2026-08-06 153305.png","لقطة شاشة 2026-08-06 153333.png","لقطة شاشة 2026-08-06 153435.png"] },
  { id: 'health-governance', title: 'الصحة والحوكمة', area: 'التدقيق، الطوابير، الحالة', status: 'mixed-visual', target: '#admin-governance', note: 'الأجزاء التشغيلية حية، بينما شاشات الصحة/القدرات غير المتعاقدة تبقى Boundary.', references: ["لقطة شاشة 2026-08-06 153509.png","لقطة شاشة 2026-08-06 153539.png","لقطة شاشة 2026-08-06 153603.png","لقطة شاشة 2026-08-06 153639.png","لقطة شاشة 2026-08-06 153703.png","لقطة شاشة 2026-08-06 153730.png","لقطة شاشة 2026-08-06 153758.png"] },
  { id: 'catalog-settings', title: 'الكتالوج والإعدادات', area: 'الكتالوج، العروض، الإعدادات', status: 'mixed-visual', target: '#admin-catalog', note: 'الكتالوج والإعدادات حية؛ العروض/الأجزاء التاريخية غير المتعاقدة تبقى Boundary.', references: ["لقطة شاشة 2026-08-06 153840.png","لقطة شاشة 2026-08-06 153905.png","لقطة شاشة 2026-08-06 154053.png","لقطة شاشة 2026-08-06 154115.png","لقطة شاشة 2026-08-06 154138.png","لقطة شاشة 2026-08-06 154200.png","لقطة شاشة 2026-08-06 154217.png","لقطة شاشة 2026-08-06 154245.png","لقطة شاشة 2026-08-06 154318.png"] },
  { id: 'integrations-dev', title: 'التكاملات وأدوات المطور', area: 'Onyx / Developer AI / Integration', status: 'external-pattern', target: '#admin-boundaries', note: 'التكاملات التاريخية وDeveloper AI ليست مصدر الحقيقة في Commerce الحالي.', references: ["لقطة شاشة 2026-08-06 154338.png","لقطة شاشة 2026-08-06 154358.png","لقطة شاشة 2026-08-06 154417.png","لقطة شاشة 2026-08-06 154438.png","لقطة شاشة 2026-08-06 154521.png"] },
];

export const UI_REFERENCE_TOTAL = UI_REFERENCE_PACKS.reduce((sum, pack) => sum + pack.references.length, 0);

export const UI_REFERENCE_FILES = UI_REFERENCE_PACKS.flatMap((pack) => pack.references);

export function uiReferenceCoverageStatus(status: UiReferencePackStatus): StructureStatus {
  return status === 'in-scope-visual' ? 'live' : status === 'external-pattern' ? 'boundary' : 'contract-gap';
}
