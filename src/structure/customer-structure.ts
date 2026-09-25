export type CustomerStructureStatus = 'live';

export interface CustomerStructureItem {
  id: string;
  label: string;
  section: 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications';
  status: CustomerStructureStatus;
  description: string;
}

export const AGHBARI_CUSTOMER_STRUCTURE: CustomerStructureItem[] = [
  { id: 'store', label: 'المتجر / الكتالوج', section: 'catalog', status: 'live', description: 'اكتشاف الأصناف، البحث، التصنيف، الأسعار، المخزون والطلب السريع.' },
  { id: 'categories', label: 'التصنيفات', section: 'catalog', status: 'live', description: 'تصفية الكتالوج حسب التصنيف.' },
  { id: 'search', label: 'البحث', section: 'catalog', status: 'live', description: 'بحث بالاسم أو SKU أو باركود.' },
  { id: 'product-detail', label: 'تفاصيل الصنف', section: 'catalog', status: 'live', description: 'تفاصيل الصنف والسعر والمخزون والإضافة للسلة.' },
  { id: 'cart', label: 'السلة', section: 'catalog', status: 'live', description: 'تعديل الكميات، اعتماد الكمية، الحفظ كمسحة والدفع.' },
  { id: 'checkout', label: 'إتمام الطلب', section: 'orders', status: 'live', description: 'التحقق ثم الإرسال عبر أمر idempotent.' },
  { id: 'order-history', label: 'سجل الطلبات', section: 'orders', status: 'live', description: 'بحث، فلترة، صفحات، تفاصيل، تتبع وإعادة الطلب.' },
  { id: 'order-detail', label: 'تفاصيل/تتبع الطلب', section: 'orders', status: 'live', description: 'خط زمني وتفاصيل الأصناف والإعادة.' },
  { id: 'templates', label: 'المسحات الجاهزة', section: 'templates', status: 'live', description: 'حفظ وإعادة تطبيق الطلبات الدورية.' },
  { id: 'quick-order', label: 'الطلب السريع', section: 'catalog', status: 'live', description: 'SKU أو باركود مع حدود تحقق قبل RPC.' },
  { id: 'account', label: 'حساب التاجر', section: 'account', status: 'live', description: 'السياق والاتصال والمنظمة والمستودع والتعافي.' },
  { id: 'profile', label: 'الهوية والجلسة', section: 'account', status: 'live', description: 'هوية العميل والجلسة والصلاحية التشغيلية.' },
  { id: 'notifications', label: 'الإشعارات', section: 'notifications', status: 'live', description: 'إشعارات مرتبطة بسياق العميل.' },
  { id: 'offline', label: 'العمل دون اتصال / الشبكة الضعيفة', section: 'account', status: 'live', description: 'تعديل السلة محليًا مع مزامنة bounded؛ الخادم هو المرجع النهائي.' },
  { id: 'invitations', label: 'الدعوات', section: 'account', status: 'live', description: 'قبول دعوة العميل ضمن تدفق InvitationAcceptance.' },
  { id: 'finance', label: 'المركز المالي', section: 'finance', status: 'live', description: 'الحد الائتماني، الرصيد، الحركات والتصدير.' },
];
