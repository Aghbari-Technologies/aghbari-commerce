type OperationalTruthStripProps = {
  isOnline: boolean;
  customerTier: string;
  warehouseLabel: string;
};

function tierLabel(tier: string) {
  if (tier === 'wholesale') return 'جملة';
  if (tier === 'retail') return 'تجزئة';
  if (tier === 'distributor') return 'موزع';
  return tier;
}

export default function OperationalTruthStrip({
  isOnline,
  customerTier,
  warehouseLabel,
}: OperationalTruthStripProps) {
  return (
    <section className="operational-truth-strip" aria-label="مصادر البيانات وحالة الثقة">
      <div className="truth-status">
        <span className={isOnline ? 'truth-dot online' : 'truth-dot offline'} aria-hidden="true" />
        <div>
          <strong>{isOnline ? 'متصل بالمصدر الخادمي' : 'وضع اتصال محدود'}</strong>
          <small>{isOnline ? 'الأسعار والمخزون تُقرأ من Commerce مباشرة.' : 'البيانات المعروضة من cache محلي محدود وليست مصدر الحقيقة.'}</small>
        </div>
      </div>
      <div className="truth-item">
        <span>السعر</span>
        <strong>قائمة الحساب المصرح بها · {tierLabel(customerTier)}</strong>
      </div>
      <div className="truth-item">
        <span>المخزون</span>
        <strong>{isOnline ? `رصيد المستودع · ${warehouseLabel}` : 'نسخة محلية للعرض فقط'}</strong>
      </div>
      <div className="truth-item">
        <span>المعاملات</span>
        <strong>الخادم هو صاحب القرار النهائي</strong>
      </div>
    </section>
  );
}
