import { roleCan } from './role-matrix';

export type StructureStatus = 'live' | 'boundary' | 'contract-gap';

export interface AdminStructureItem {
  id: string;
  label: string;
  path: string;
  permission: string;
  target?: string;
  status: StructureStatus;
  note?: string;
  actions?: string[];
}

export interface AdminStructureGroup {
  id: string;
  label: string;
  path: string;
  icon: string;
  items: AdminStructureItem[];
}

const live = (id: string, label: string, path: string, permission: string, target: string, actions: string[] = ['view'], note?: string): AdminStructureItem =>
  ({ id, label, path, permission, target, status: 'live', actions, note });

const boundary = (id: string, label: string, path: string, permission: string, note: string): AdminStructureItem =>
  ({ id, label, path, permission, status: 'boundary', note });

const gap = (id: string, label: string, path: string, permission: string, note: string): AdminStructureItem =>
  ({ id, label, path, permission, status: 'contract-gap', note });

export const AGHBARI_ADMIN_STRUCTURE: AdminStructureGroup[] = [
  {
    id: 'dashboard',
    label: 'لوحة المعلومات',
    path: '/admin',
    icon: '⌂',
    items: [
      live('dashboard', 'الرئيسية', '/admin', 'dashboard.view', '#admin-dashboard', ['view']),
    ],
  },
  {
    id: 'sales-customers',
    label: 'المبيعات والعملاء',
    path: '/admin/orders',
    icon: '🛒',
    items: [
      live('orders', 'الطلبات', '/admin/orders', 'orders.view', '#admin-orders', ['view', 'edit', 'approve', 'reject', 'export']),
      live('order-detail', 'تفاصيل الطلب', '/admin/order/:id', 'orders.view', '#admin-orders', ['view', 'edit', 'approve', 'reject', 'export']),
      live('customers', 'العملاء', '/admin/customers', 'customers.view', ' #admin-customers'.trim(), ['view', 'create', 'edit', 'approve', 'reject']),
      boundary('devices', 'أجهزة العملاء', '/admin/devices', 'devices.manage', 'الهيكلة محفوظة؛ عقد أجهزة العملاء غير موجود ضمن نطاق Commerce الحالي.'),
      live('workspace', 'مساحة عمل المدير', '/admin/workspace', 'orders.view', '#admin-orders', ['view']),
    ],
  },
  {
    id: 'catalog-inventory',
    label: 'الأصناف والمخزون',
    path: '/admin/catalog',
    icon: '▣',
    items: [
      live('catalog', 'إدارة الأصناف', '/admin/catalog', 'products.view', '#admin-catalog', ['view', 'create', 'edit', 'export', 'import']),
      live('pricing', 'محرك التسعير', '/admin/pricing', 'pricing.rules.view', '#admin-pricing-matrix', ['view', 'create', 'edit', 'approve']),
      live('inventory-sync', 'مزامنة المخزون', '/admin/ai/stock-sync', 'ai.sync.preview', '#admin-inventory', ['view']),
      live('inventory-ledger', 'دفتر حركة المخزون', '/admin/inventory/history', 'stock.view', '#admin-inventory-history', ['view']),
      live('warehouses', 'المستودعات والفروع', '/admin/inventory/warehouses', 'stock.view', '#admin-warehouses', ['view', 'edit']),
      live('suppliers', 'الموردون', '/admin/purchasing/suppliers', 'purchasing.view', '#admin-suppliers', ['view', 'edit']),
      live('receiving', 'الاستلام', '/admin/purchasing/receiving', 'purchasing.view', '#admin-receipts', ['view']),
      gap('promotions', 'العروض / Promotions', '/admin/promotions', 'offers.manage', 'لا يوجد عقد أعمال/بيانات canonical للعروض في Commerce الحالي؛ لا يتم اختلاق شاشة تنفيذية.'),
    ],
  },
  {
    id: 'data-management',
    label: 'إدارة البيانات',
    path: '/admin/import',
    icon: '▤',
    items: [
      live('data-center', 'مركز البيانات الموحّد', '/admin/data-center', 'datacenter.view', '#admin-import', ['view', 'import', 'export']),
      live('smart-import', 'محرك الاستيراد الآمن', '/admin/import', 'import.run', '#admin-import', ['view', 'import', 'run']),
      boundary('import-logs', 'سجل الاستيراد', '/admin/import-logs', 'import.logs.view', 'البيانات التشغيلية للاستيراد موجودة ضمن شاشة الاستيراد الحالية؛ صفحة مستقلة لم تُنشأ كعقد منفصل.'),
      boundary('legacy-sync', 'مزامنة Onyx Pro', '/admin/ai/sync', 'ai.sync', 'تكامل خارجي/ترحيل، وليس مصدر الحقيقة في Commerce.'),
      boundary('finance-data', 'مركز البيانات المالي', '/admin/finance-data', 'ai.sync', 'النسخة التحليلية/اللقطات المالية تخص نظامًا خارجيًا وليست جزءًا من نموذج Commerce transactional truth.'),
      live('images', 'تحسين الصور', '/admin/images', 'images.optimize', '#admin-product-image', ['view', 'run', 'optimize']),
      live('export', 'مركز التصدير', '/admin/export', 'products.export', '#admin-export', ['view', 'export']),
    ],
  },
  {
    id: 'artificial-intelligence',
    label: 'الذكاء الاصطناعي',
    path: '/admin/ai',
    icon: '◎',
    items: [
      boundary('ai-dashboard', 'لوحة الذكاء', '/admin/ai', 'ai.view', 'ليست ضمن Commerce transactional source of truth الحالي.'),
      boundary('ai-reports', 'التقارير الذكية', '/admin/ai/reports', 'ai.reports.view', 'تبقى خارج نطاق المعاملات؛ تستخدم عبر بوابة التقارير/التحليل الخارجية عند وجود عقد معتمد.'),
      boundary('ai-alerts', 'التنبيهات الذكية', '/admin/ai/alerts', 'ai.alerts.manage', 'لم يُنشأ مصدر بيانات ai_alerts في Commerce الحالي.'),
      boundary('ai-tasks', 'المهام الذكية', '/admin/ai/tasks', 'ai.tasks.manage', 'لم يُنشأ عقد ai_tasks في Commerce الحالي.'),
      boundary('ai-assistant', 'المساعد الذكي', '/admin/ai/assistant', 'ai.assistant.use', 'المساعد التحليلي ليس جزءًا من transaction core.'),
      boundary('ai-governance', 'حوكمة الذكاء', '/admin/ai/governance', 'ai.view', 'سياسات الذكاء تبقى خارج transactional truth.'),
      boundary('ai-insights', 'التوصيات والتنبؤات', '/admin/ai/insights', 'ai.insights.view', 'تحليلات/تنبؤات خارج Commerce core.'),
      boundary('ai-prompts', 'مكتبة الأوامر', '/admin/ai/prompts', 'ai.prompts.manage', 'ليست ضمن نطاق Commerce الحالي.'),
      boundary('ai-models', 'إدارة النماذج', '/admin/ai/models', 'ai.models.manage', 'إدارة النماذج ليست وظيفة Commerce transactional.'),
      boundary('ai-settings', 'إعدادات الذكاء', '/admin/ai/settings', 'ai.settings.manage', 'غير موجودة كعقد canonical في Commerce.'),
      boundary('ai-audit', 'تدقيق الذكاء', '/admin/ai/audit', 'ai.audit.view', 'غير موجود كمسار تدقيقي مستقل في Commerce الحالي.'),
      boundary('ai-executive', 'المؤشرات التنفيذية الذكية', '/admin/ai/executive', 'ai.executive.view', 'اللوحة التنفيذية الحالية تشغل مؤشرات Commerce مباشرة، وليست ai_* snapshots.'),
    ],
  },
  {
    id: 'reports-governance',
    label: 'التقارير والحوكمة',
    path: '/admin/reports',
    icon: '▥',
    items: [
      boundary('reports', 'التقارير التشغيلية', '/admin/reports', 'reports.view', 'التقارير المتقدمة خارج Commerce؛ لا يتم تحويل قاعدة المعاملات إلى BI core.'),
      live('architecture', 'معمارية وشجرة النظام', '/admin/architecture', 'architecture.view', '#admin-governance', ['view']),
      live('notifications', 'مراسلة/إشعارات العملاء', '/admin/notifications', 'notifications.view', '#admin-notifications', ['view', 'create', 'edit']),
      live('audit', 'سجل العمليات', '/admin/audit', 'audit.view', '#admin-governance', ['view', 'export']),
      boundary('errors', 'سجل الأخطاء', '/admin/errors', 'errors.view', 'تسجيل الأخطاء التشغيلي يجب أن يبنى فوق العقد الحالي؛ لا يوجد workspace مستقل في هذه النسخة.'),
      boundary('health', 'صحة النظام', '/admin/health', 'health.view', 'فحوص صحة النظام المتقدمة ليست exposed كمساحة مستقلة حاليًا.'),
      live('queues', 'الأحداث والطوابير / Outbox', '/admin/queues', 'errors.view', '#admin-governance', ['view']),
    ],
  },
  {
    id: 'users-security',
    label: 'المستخدمون والأمان',
    path: '/admin/users',
    icon: '♙',
    items: [
      live('staff-access', 'الموظفون والصلاحيات', '/admin/users', 'users.manage', '#admin-access', ['view', 'edit']),
      boundary('invites', 'روابط الدعوة', '/admin/invites', 'invites.manage', 'دعوات العملاء موجودة ضمن دليل العملاء؛ صفحة مستقلة لم تعتمد كعقد منفصل.'),
    ],
  },
  {
    id: 'settings-integrations',
    label: 'الإعدادات والتكاملات',
    path: '/admin/settings',
    icon: '⚙',
    items: [
      live('customer-settings', 'إعدادات العميل', '/admin/settings', 'settings.manage', '#admin-settings', ['view', 'edit']),
      boundary('appearance', 'المظهر', '/admin/appearance', 'appearance.manage', 'المظهر المميز جزء من CSS/واجهة Commerce الحالية وليس إعدادات theme persisted مستقلة.'),
      boundary('onyx', 'Onyx Pro', '/admin/onyx', 'onyx.view', 'تكامل خارجي boundary؛ لا يصبح مصدر الحقيقة التشغيلي.'),
      boundary('restore', 'استعادة النظام', '/admin/restore', 'settings.manage', 'نقاط الاستعادة المتقدمة ليست عقدًا قائمًا في schema الحالي.'),
    ],
  },
  {
    id: 'developer-tools',
    label: 'أدوات المطور',
    path: '/admin/dev-ai',
    icon: '⌁',
    items: [
      boundary('dev-ai', 'Developer AI', '/admin/dev-ai', 'devai.view', 'خارج المنتج التشغيلي Commerce.'),
      boundary('patches', 'Patches', '/admin/dev-ai/patches', 'devai.view', 'ساحة هندسية خارج runtime التجاري.'),
      boundary('dev-audit', 'Audit', '/admin/dev-ai/audit', 'devai.view', 'خارج runtime التجاري.'),
      boundary('dev-settings', 'إعدادات المطور', '/admin/dev-ai/settings', 'devai.view', 'خارج runtime التجاري.'),
    ],
  },
];

export const AGHBARI_ADMIN_LIVE_ITEMS = AGHBARI_ADMIN_STRUCTURE.flatMap((group) =>
  group.items.filter((item) => item.status === 'live'),
);

export const AGHBARI_ADMIN_BOUNDARY_ITEMS = AGHBARI_ADMIN_STRUCTURE.flatMap((group) =>
  group.items.filter((item) => item.status !== 'live'),
);

export function getAdminStructureForRole(role: string) {
  return AGHBARI_ADMIN_STRUCTURE
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => roleCan(role, item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}


export const AGHBARI_ADMIN_PATH_TARGETS = Object.fromEntries(
  AGHBARI_ADMIN_LIVE_ITEMS
    .filter((item) => item.target)
    .map((item) => [item.path, item.target as string]),
) as Record<string, string>;

export function adminTargetForPath(pathname: string) {
  if (pathname === '/admin' || pathname === '/admin/') return '#admin-dashboard';
  return AGHBARI_ADMIN_PATH_TARGETS[pathname] ?? '#admin-dashboard';
}
