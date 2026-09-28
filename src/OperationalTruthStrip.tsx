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

export function getOperationalTruth(isOnline: boolean, customerTier: string, warehouseLabel: string) {
  return {
    connection: isOnline ? 'متصل بالمصدر الخادمي' : 'وضع اتصال محدود',
    pricingSource: `قائمة الحساب المصرح بها · ${tierLabel(customerTier)}`,
    stockSource: isOnline ? `رصيد المستودع · ${warehouseLabel}` : 'نسخة محلية للعرض فقط',
    authority: 'الخادم هو صاحب القرار النهائي'
  };
}

export default function OperationalTruthStrip({
  isOnline,
  customerTier,
  warehouseLabel,
}: OperationalTruthStripProps) {
  const truth = getOperationalTruth(isOnline, customerTier, warehouseLabel);
  return (
    <section className="operational-truth-strip" aria-label="مصادر البيانات وحالة الثقة">
      <div className="truth-status">
        <span className={isOnline ? 'truth-dot online' : 'truth-dot offline'} aria-hidden="true" />
        <div>
          <strong>{truth.connection}</strong>
          <small>{isOnline ? 'الأسعار والمخزون تُقرأ من Commerce مباشرة.' : 'البيانات المعروضة من cache محلي محدود وليست مصدر الحقيقة.'}</small>
        </div>
      </div>
      <div className="truth-item">
        <span>السعر</span>
        <strong>{truth.pricingSource}</strong>
      </div>
      <div className="truth-item">
        <span>المخزون</span>
        <strong>{truth.stockSource}</strong>
      </div>
      <div className="truth-item">
        <span>المعاملات</span>
        <strong>{truth.authority}</strong>
      </div>
    </section>
  );
}
