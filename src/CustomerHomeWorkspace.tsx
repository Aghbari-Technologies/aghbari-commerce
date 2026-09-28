import type { ReactNode } from 'react';

export type CustomerHomeSection = 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications';

interface CustomerHomeWorkspaceProps {
  customerName: string;
  organizationName: string;
  warehouseName: string;
  productsOnPage: number;
  ordersCount: number;
  latestOrderNumber?: number;
  cartCount: number;
  cartLines: number;
  availableCreditText: string;
  financeReady: boolean;
  templatesCount: number;
  showCredit: boolean;
  showTemplates: boolean;
  isOnline: boolean;
  offlineSyncing: boolean;
  onNavigate: (section: CustomerHomeSection) => void;
  onOpenCart: () => void;
}

function HomeStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="customer-overview-card">
      <span className="overview-icon" aria-hidden="true">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{hint}</em>
      </div>
    </article>
  );
}

export default function CustomerHomeWorkspace({
  customerName,
  organizationName,
  warehouseName,
  productsOnPage,
  ordersCount,
  latestOrderNumber,
  cartCount,
  cartLines,
  availableCreditText,
  financeReady,
  templatesCount,
  showCredit,
  showTemplates,
  isOnline,
  offlineSyncing,
  onNavigate,
  onOpenCart,
}: CustomerHomeWorkspaceProps) {
  return (
    <section id="customer-home" className="customer-home-workspace" aria-labelledby="customer-home-title">
      <section className="hero-card customer-home-hero">
        <div>
          <span className="eyebrow">مساحة التاجر</span>
          <h2 id="customer-home-title">مرحبًا {customerName}</h2>
          <p>
            ملخص تشغيلي لحسابك في الأغبري. أكمل من هنا إلى الكتالوج أو الطلبات أو الحساب دون تغيير مصدر الحقيقة.
          </p>
          <div className="customer-home-context" aria-label="سياق الحساب">
            {organizationName && <span><small>الشركة</small><strong>{organizationName}</strong></span>}
            {warehouseName && <span><small>المستودع</small><strong>{warehouseName}</strong></span>}
          </div>
        </div>
        <div className="hero-stat">
          <strong>{productsOnPage.toLocaleString('ar-YE')}</strong>
          <span>صنف متاح في آخر تحميل</span>
        </div>
      </section>

      <section className="customer-overview-strip" aria-label="ملخص تشغيل حساب التاجر">
        {showCredit && (
          <HomeStat
            icon="◫"
            label="المتاح للشراء"
            value={financeReady ? availableCreditText : '—'}
            hint={financeReady ? 'من حساب الائتمان المصرح' : 'بانتظار بيانات الحساب'}
          />
        )}
        <HomeStat
          icon="🧾"
          label="الطلبات"
          value={ordersCount.toLocaleString('ar-YE')}
          hint={latestOrderNumber ? `آخر طلب #${latestOrderNumber}` : 'لا توجد طلبات بعد'}
        />
        <HomeStat
          icon="▣"
          label="السلة الحالية"
          value={cartCount.toLocaleString('ar-YE')}
          hint={cartLines ? `${cartLines} أصناف جاهزة للمراجعة` : 'السلة فارغة'}
        />
        <HomeStat
          icon={isOnline ? '●' : '○'}
          label="حالة الاتصال"
          value={isOnline ? 'متصل' : 'غير متصل'}
          hint={offlineSyncing ? 'تتم المزامنة الآمنة الآن' : isOnline ? 'الخدمة الأساسية متاحة' : 'البيانات المخزنة للعرض فقط'}
        />
      </section>

      <section className="portal-quick-actions customer-home-actions" aria-label="إجراءات سريعة">
        <div className="portal-quick-lead">
          <span className="eyebrow">تشغيل سريع</span>
          <strong>من الملخص إلى الإجراء التالي</strong>
          <small>اختر الإجراء المطلوب مع إبقاء الصلاحيات والمصدر الحقيقي على الخادم.</small>
        </div>
        <div className="portal-quick-grid">
          <button type="button" className="portal-quick-item primary" onClick={() => onNavigate('catalog')}>
            <span aria-hidden="true">▣</span>
            <div><strong>ابدأ الشراء</strong><small>افتح الكتالوج والأسعار والمخزون</small></div>
            <b>↗</b>
          </button>
          <button type="button" className="portal-quick-item" onClick={() => onOpenCart()}>
            <span aria-hidden="true">🛒</span>
            <div><strong>راجع السلة</strong><small>{cartCount ? `${cartCount.toLocaleString('ar-YE')} وحدة في السلة` : 'السلة فارغة'}</small></div>
            <b>↗</b>
          </button>
          <button type="button" className="portal-quick-item" onClick={() => onNavigate('orders')}>
            <span aria-hidden="true">🧾</span>
            <div><strong>تابع الطلبات</strong><small>{ordersCount ? `${ordersCount.toLocaleString('ar-YE')} طلب في السجل` : 'لا توجد طلبات بعد'}</small></div>
            <b>↗</b>
          </button>
          {showTemplates && (
            <button type="button" className="portal-quick-item" onClick={() => onNavigate('templates')}>
              <span aria-hidden="true">▤</span>
              <div><strong>القوالب الجاهزة</strong><small>{templatesCount.toLocaleString('ar-YE')} قالب محفوظ</small></div>
              <b>↗</b>
            </button>
          )}
          {showCredit && (
            <button type="button" className="portal-quick-item" onClick={() => onNavigate('finance')}>
              <span aria-hidden="true">◫</span>
              <div><strong>المركز المالي</strong><small>{financeReady ? availableCreditText : 'فتح المستندات المالية'}</small></div>
              <b>↗</b>
            </button>
          )}
          <button type="button" className="portal-quick-item" onClick={() => onNavigate('account')}>
            <span aria-hidden="true">♙</span>
            <div><strong>الحساب والشركة</strong><small>الهوية والعناوين والإعدادات</small></div>
            <b>↗</b>
          </button>
          <button type="button" className="portal-quick-item" onClick={() => onNavigate('notifications')}>
            <span aria-hidden="true">🔔</span>
            <div><strong>الإشعارات</strong><small>التنبيهات المرتبطة بالحساب</small></div>
            <b>↗</b>
          </button>
        </div>
      </section>

      <section className="content-card customer-home-trust" aria-label="حالة مصدر البيانات">
        <div className="section-title">
          <div>
            <span className="eyebrow">مصدر الحقيقة</span>
            <h3>بياناتك محكومة بالسياق الحالي</h3>
          </div>
          <span className={isOnline ? 'status status-confirmed' : 'status status-pending'}>
            {isOnline ? 'متصل بالخدمة' : 'وضع عدم الاتصال'}
          </span>
        </div>
        <p>
          {isOnline
            ? 'الأسعار والمخزون والطلبات تُقرأ من البيانات المصرح بها للحساب الحالي.'
            : 'هذه الشاشة لا تجعل البيانات المخزنة محليًا مصدرًا للمعاملات؛ استخدم العودة للاتصال قبل الاعتماد النهائي.'}
        </p>
      </section>
    </section>
  );
}
