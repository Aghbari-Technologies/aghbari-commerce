import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from './domain/types';

export type CustomerHomeSection = 'catalog' | 'saved' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications';

interface CustomerHomeWorkspaceProps {
  customerName: string;
  organizationName: string;
  warehouseName: string;
  productsOnPage: number;
  ordersCount: number;
  latestOrderNumber?: number;
  latestOrderStatus?: string;
  latestOrderDate?: string;
  cartCount: number;
  cartLines: number;
  availableCreditText: string;
  financeReady: boolean;
  templatesCount: number;
  favoritesCount: number;
  recentCount: number;
  unreadNotifications: number;
  showCredit: boolean;
  showTemplates: boolean;
  isOnline: boolean;
  offlineSyncing: boolean;
  onNavigate: (section: CustomerHomeSection) => void;
  onOpenCart: () => void;
  featuredProducts?: Array<Product & { authorizedPrice?: number; priceCurrency?: string }>;
  categories?: Array<{ id: string; name: string }>;
  onOpenProduct?: (product: Product) => void;
  onAddProduct?: (product: Product) => Promise<boolean>;
  onSelectCategory?: (id: string) => void;
  hasLatestOrder?: boolean;
  onReorderLatest?: () => Promise<void>;
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
  latestOrderStatus,
  latestOrderDate,
  cartCount,
  cartLines,
  availableCreditText,
  financeReady,
  templatesCount,
  favoritesCount,
  recentCount,
  unreadNotifications,
  showCredit,
  showTemplates,
  isOnline,
  offlineSyncing,
  onNavigate,
  onOpenCart,
  featuredProducts = [],
  categories = [],
  onOpenProduct,
  onAddProduct,
  onSelectCategory,
  hasLatestOrder = false,
  onReorderLatest,
}: CustomerHomeWorkspaceProps) {
  const [reorderingLatest, setReorderingLatest] = useState(false);
  async function repeatLatestOrder() {
    if (!onReorderLatest || !hasLatestOrder || reorderingLatest) return;
    setReorderingLatest(true);
    try { await onReorderLatest(); } finally { setReorderingLatest(false); }
  }
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  async function addFeaturedProduct(product: Product) {
    if (!onAddProduct || addingProductId || product.availableQuantity < 1) return;
    setAddingProductId(product.id);
    try {
      const added = await onAddProduct(product);
      if (added) {
        setAddedProductId(product.id);
        window.setTimeout(() => setAddedProductId((current) => current === product.id ? null : current), 1400);
      }
    } finally {
      setAddingProductId(null);
    }
  }
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

      <section className="customer-home-command-deck" aria-label="مركز القرار السريع">
        <div className="customer-home-command-card customer-home-command-primary">
          <span className="command-kicker">الخطوة التالية</span>
          <strong>{cartCount ? 'السلة جاهزة للمراجعة' : latestOrderNumber ? 'ابدأ طلبك التالي' : 'ابدأ أول طلب تجاري'}</strong>
          <small>{cartCount ? cartCount.toLocaleString('ar-YE') + ' وحدة ضمن السلة الحالية' : 'انتقل مباشرة إلى الكتالوج واختصر وقت إعادة البحث.'}</small>
          <button type="button" onClick={() => cartCount ? onOpenCart() : onNavigate('catalog')}>{cartCount ? 'مراجعة السلة' : 'فتح الكتالوج'} ↗</button>
        </div>
        <div className="customer-home-command-card customer-home-command-repeat">
          <span className="command-kicker">آخر طلب</span>
          <strong>{latestOrderNumber ? '#' + latestOrderNumber : 'لا يوجد طلب سابق'}</strong>
          <small>{latestOrderStatus ? 'الحالة: ' + latestOrderStatus : latestOrderDate ? new Date(latestOrderDate).toLocaleDateString('ar-YE') : 'سيظهر هنا بعد أول إرسال ناجح.'}</small>
          <div className="customer-home-repeat-actions">
            <button type="button" onClick={() => void repeatLatestOrder()} disabled={!hasLatestOrder || reorderingLatest}>{reorderingLatest ? 'جارٍ تجهيز السلة…' : 'إعادة الطلب'}</button>
            <button type="button" className="ghost" onClick={() => onNavigate('orders')}>السجل ↗</button>
          </div>
        </div>
        <div className="customer-home-command-card">
          <span className="command-kicker">الحساب</span>
          <strong>{financeReady && showCredit ? availableCreditText : organizationName || 'حساب الأغبري'}</strong>
          <small>{showCredit ? (financeReady ? 'رصيد متاح من الحساب المصرح.' : 'بيانات الائتمان بانتظار التحميل.') : 'السياق التجاري والهوية محفوظان للحساب.'}</small>
          <button type="button" onClick={() => onNavigate(showCredit ? 'finance' : 'account')}>{showCredit ? 'فتح المركز المالي' : 'فتح الحساب'} ↗</button>
        </div>
      </section>
      <section className="customer-home-merchandising" aria-label="مساحة الشراء السريع">
        <div className="customer-home-merchandising-head">
          <div>
            <span className="eyebrow">متجر الأغبري</span>
            <h3>ابدأ من الأصناف الجاهزة للطلب</h3>
            <p>معاينة حقيقية من الكتالوج الحالي للحساب، مع الأسعار المصرح بها فقط.</p>
          </div>
          <button type="button" className="ghost" onClick={() => onNavigate('catalog')}>فتح الكتالوج الكامل ↗</button>
        </div>
        {featuredProducts.length ? (
          <div className="customer-home-product-strip">
            {featuredProducts.slice(0, 6).map((product) => (
              <article className="customer-home-product-card" key={product.id}>
                <button type="button" className="customer-home-product-visual" onClick={() => onOpenProduct?.(product)} aria-label={'فتح تفاصيل ' + product.name}>
                  {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span aria-hidden="true">{product.name.slice(0, 1)}</span>}
                  <i className={product.availableQuantity > 0 ? 'in-stock' : 'out-stock'}>{product.availableQuantity > 0 ? 'متوفر' : 'غير متوفر'}</i>
                </button>
                <div className="customer-home-product-copy">
                  <small>{product.sku} · {product.unit}</small>
                  <strong>{product.name}</strong>
                  <span>{product.availableQuantity > 0 ? 'متاح ' + product.availableQuantity.toLocaleString('ar-YE') : 'غير متاح حاليًا'}</span>
                  <div>
                    {Number(product.authorizedPrice ?? 0) > 0
                      ? <b>{new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 0 }).format(Number(product.authorizedPrice))} ر.ي</b>
                      : <em>السعر حسب حسابك</em>}
                    <div className="customer-home-product-actions">
                      <button type="button" onClick={() => void addFeaturedProduct(product)} disabled={!onAddProduct || product.availableQuantity < 1 || addingProductId !== null}>{addedProductId === product.id ? '✓ تمت الإضافة' : addingProductId === product.id ? 'جارٍ الإضافة…' : 'إضافة للسلة'}</button>
                      <button type="button" onClick={() => onOpenProduct?.(product)}>التفاصيل</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="customer-home-merchandising-empty">
            <strong>الكتالوج في انتظار التحميل</strong>
            <span>عند توفر اتصال وبيانات أصناف صالحة ستظهر هنا معاينة شراء حقيقية.</span>
            <button type="button" onClick={() => onNavigate('catalog')}>فتح الكتالوج</button>
          </div>
        )}
        {categories.length > 0 && (
          <div className="customer-home-category-strip" aria-label="تصنيفات سريعة">
            <span>تصفح حسب التصنيف</span>
            <div>{categories.slice(0, 8).map((category) => <button type="button" key={category.id} onClick={() => { onSelectCategory?.(category.id); onNavigate('catalog'); }}>{category.name} <small>↗</small></button>)}</div>
          </div>
        )}
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
          <button type="button" className="portal-quick-item" onClick={() => onNavigate('saved')}>
            <span aria-hidden="true">♡</span>
            <div><strong>المحفوظات والمفضلة</strong><small>{favoritesCount.toLocaleString('ar-YE')} مفضلة · {recentCount.toLocaleString('ar-YE')} شوهدت مؤخرًا</small></div>
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
            <div><strong>الإشعارات</strong><small>{unreadNotifications>0?`${unreadNotifications.toLocaleString('ar-YE')} غير مقروء`:'لا توجد إشعارات غير مقروءة'}</small></div>
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
