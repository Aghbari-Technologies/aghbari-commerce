import { useMemo, useState, type ReactNode } from 'react';
import type { Product, CartLine } from './domain/types';

export type StorefrontProduct = Product & { authorizedPrice?: number; priceCurrency?: string };
export type StorefrontCategory = { id: string; name: string };

type StorefrontProps = {
  signedIn: boolean;
  customerName: string;
  organizationName: string;
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  cart: CartLine[];
  cartTotal: number;
  favoriteIds: string[];
  compareIds: string[];
  ordersCount: number;
  latestOrderNumber?: number;
  availableCreditText?: string;
  financeReady: boolean;
  showCredit: boolean;
  showTemplates: boolean;
  isOnline: boolean;
  onLogin: () => void;
  onNavigate: (section: 'home'|'catalog'|'saved'|'orders'|'finance'|'templates'|'account'|'notifications') => void;
  onOpenCart: () => void;
  onOpenCheckout: () => void;
  onAddProduct: (product: Product) => Promise<boolean>;
  onOpenProduct: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
  onOpenQuickOrder: () => void;
  onOpenPricing: () => void;
  onSearchCatalog: (query: string) => void;
  onSelectCategory: (id: string | null) => void;
  onOpenAdmin?: () => void;
};

function money(value: number | null | undefined, currency = 'YER') {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return `${new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 0 }).format(value)} ${currency === 'YER' ? 'ر.ي' : currency}`;
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="store-icon" aria-hidden="true">{children}</span>;
}

function ProductCard(props: {
  product: StorefrontProduct;
  favorite: boolean;
  compared: boolean;
  busy: boolean;
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
  onFavorite: (id: string) => void;
  onCompare: (id: string) => void;
}) {
  const { product, favorite, compared, busy, onAdd, onOpen, onFavorite, onCompare } = props;
  const price = money(product.authorizedPrice, product.priceCurrency);
  const available = product.status === 'active' && product.availableQuantity > 0;
  return (
    <article className="store-product-card">
      <div className="store-product-media">
        <button type="button" className="store-product-image" onClick={() => onOpen(product)} aria-label={`تفاصيل ${product.name}`}>
          {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>{product.name.slice(0, 1)}</span>}
        </button>
        <div className="store-product-badges">
          <span className={available ? 'stock-ok' : 'stock-out'}>{available ? 'متوفر' : 'غير متوفر'}</span>
          {price && <span>سعر الحساب</span>}
        </div>
        <button type="button" className={favorite ? 'store-heart active' : 'store-heart'} onClick={() => onFavorite(product.id)} aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}>{favorite ? '♥' : '♡'}</button>
      </div>
      <div className="store-product-body">
        <small>{product.category || 'أصناف'} · {product.sku}</small>
        <h3>{product.name}</h3>
        <p>{product.description || 'معلومات الصنف من كتالوج الأغبري.'}</p>
        <div className="store-product-facts">
          <span>الوحدة <b>{product.unit}</b></span>
          <span>المتاح <b>{product.availableQuantity.toLocaleString('ar-YE')}</b></span>
        </div>
        <div className="store-product-price-row">
          <div>{price ? <strong>{price}</strong> : <em>السعر حسب الحساب</em>}</div>
          <button type="button" disabled={!available || !price || busy} onClick={() => onAdd(product)}>{busy ? 'جارٍ الإضافة…' : 'أضف للسلة'}</button>
        </div>
        <div className="store-product-links">
          <button type="button" onClick={() => onOpen(product)}>التفاصيل ↗</button>
          <button type="button" className={compared ? 'active' : ''} onClick={() => onCompare(product.id)}>{compared ? 'في المقارنة' : 'قارن'}</button>
        </div>
      </div>
    </article>
  );
}

export default function Storefront(props: StorefrontProps) {
  const {
    signedIn, customerName, organizationName, products, categories, cart, cartTotal, favoriteIds, compareIds,
    ordersCount, latestOrderNumber, availableCreditText, financeReady, showCredit, showTemplates, isOnline,
    onLogin, onNavigate, onOpenCart, onOpenCheckout, onAddProduct, onOpenProduct, onToggleFavorite,
    onToggleCompare, onOpenQuickOrder, onOpenPricing, onSearchCatalog, onSelectCategory, onOpenAdmin,
  } = props;

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState(false);

  const visible = useMemo(() => {
    let result = products.filter(p => p.status === 'active');
    const categoryName = categories.find(c => c.id === activeCategory)?.name;
    if (categoryName) result = result.filter(p => p.category === categoryName);
    const needle = query.trim().toLocaleLowerCase();
    if (needle) result = result.filter(p => p.name.toLocaleLowerCase().includes(needle) || p.sku.toLocaleLowerCase().includes(needle) || (p.barcode ?? '').toLocaleLowerCase().includes(needle));
    return result.slice(0, 8);
  }, [activeCategory, categories, products, query]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function add(product: StorefrontProduct) {
    if (busyId) return;
    setBusyId(product.id);
    try { await onAddProduct(product); } finally { setBusyId(null); }
  }

  function doSearch() {
    const value = query.trim();
    if (value) onSearchCatalog(value);
    else onNavigate('catalog');
  }

  function chooseCategory(id: string | null) {
    setActiveCategory(id);
    onSelectCategory(id);
    document.getElementById('store-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="storefront-world" dir="rtl">
      <div className="store-top-notice">
        <span>الأغبري B2B</span>
        <strong>{signedIn ? 'مرحبًا بك في متجر مؤسستك.' : 'واجهة الشراء متاحة؛ الأسعار والشراء يتطلبان حسابًا مصرحًا.'}</strong>
        <button type="button" onClick={() => signedIn ? onNavigate('account') : onLogin()}>{signedIn ? 'حسابي ↗' : 'دخول الحساب ↗'}</button>
      </div>

      <header className="store-main-header">
        <button type="button" className="store-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="الأغبري">
          <span className="store-brand-mark">أ</span>
          <span><strong>الأغبري</strong><small>Aghbari Commerce</small></span>
        </button>
        <nav className="store-main-nav" aria-label="تنقل المتجر">
          <button type="button" className="active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>الرئيسية</button>
          <button type="button" onClick={() => onNavigate('catalog')}>المنتجات</button>
          <button type="button" onClick={() => document.getElementById('store-categories')?.scrollIntoView({ behavior: 'smooth' })}>التصنيفات</button>
          <button type="button" onClick={() => onNavigate('orders')}>الطلبات</button>
        </nav>
        <form className="store-header-search" onSubmit={e => { e.preventDefault(); doSearch(); }}>
          <span>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن منتج، SKU أو باركود" aria-label="البحث في متجر الأغبري" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="مسح البحث">×</button>}
          <button type="submit">بحث</button>
        </form>
        <div className="store-header-actions">
          <button type="button" className="store-header-action" onClick={onOpenPricing}><span>ر.ي</span><small>الأسعار</small></button>
          <button type="button" className="store-header-action" onClick={() => signedIn ? onNavigate('saved') : onLogin()}><span>♡</span><small>المفضلة</small><b>{favoriteIds.length}</b></button>
          <button type="button" className="store-header-cart" onClick={onOpenCart}><span>🛒</span><small>السلة</small><b>{cartCount}</b></button>
        </div>
      </header>

      <main className="store-main">
        <section className="store-hero">
          <div className="store-hero-copy">
            <span className="store-kicker">AGHBARI COMMERCE · STOREFRONT</span>
            <h1>كل ما يحتاجه متجرك،<br /><em>في واجهة شراء واحدة.</em></h1>
            <p>اكتشف أصنافك، افحص السعر المصرح، اختر الكمية، ثم انتقل إلى السلة والطلب دون العودة إلى لوحة التشغيل.</p>
            <div className="store-hero-actions">
              <button type="button" className="primary" onClick={() => onNavigate('catalog')}>ابدأ التسوق <span>←</span></button>
              <button type="button" className="ghost" onClick={onOpenQuickOrder}>طلب سريع <span>↗</span></button>
              <button type="button" className="text" onClick={onOpenPricing}>عرض الأسعار</button>
            </div>
            <div className="store-hero-benefits">
              <span><b>✓</b> أسعار مرتبطة بحسابك</span>
              <span><b>✓</b> مخزون مرتبط بالمستودع</span>
              <span><b>✓</b> طلبات حقيقية</span>
            </div>
          </div>
          <div className="store-hero-demo" aria-label="معاينة تجربة المتجر">
            <div className="store-demo-window">
              <div className="store-demo-head"><span>الأغبري</span><span>متجر الجملة</span></div>
              <div className="store-demo-search"><span>⌕</span><span>{query || 'ابحث عن صنف أو SKU…'}</span></div>
              <div className="store-demo-cats"><span>كل المنتجات</span><span>كتالوج المؤسسة</span><span>طلب سريع</span></div>
              <div className="store-demo-grid">
                {products.slice(0, 2).map(p => <button key={p.id} type="button" onClick={() => onOpenProduct(p)}><div>{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <span>{p.name.slice(0,1)}</span>}</div><strong>{p.name}</strong><small>{money(p.authorizedPrice, p.priceCurrency) || 'حسب الحساب'}</small></button>)}
                {!products.length && <><div className="store-demo-placeholder"><span>أ</span><strong>كتالوجك</strong><small>{signedIn ? 'جارٍ تحميل المنتجات…' : 'سجّل الدخول لفتح الكتالوج'}</small></div><div className="store-demo-placeholder"><span>🛒</span><strong>سلة الشراء</strong><small>من نفس تجربة المتجر</small></div></>}
              </div>
              <div className="store-demo-total"><span>السلة</span><strong>{cartCount.toLocaleString('ar-YE')} وحدة</strong><button type="button" onClick={onOpenCheckout} disabled={!signedIn || cartCount === 0}>إتمام الطلب</button></div>
            </div>
            <div className="store-float-card one"><small>الحساب</small><strong>{signedIn ? 'مصرح' : 'زائر'}</strong><span>{organizationName || 'الأغبري'}</span></div>
            <div className="store-float-card two"><small>الطلبات</small><strong>{ordersCount.toLocaleString('ar-YE')}</strong><span>{latestOrderNumber ? `آخر طلب #${latestOrderNumber}` : 'ابدأ أول طلب'}</span></div>
          </div>
        </section>

        <section className="store-trust-grid" aria-label="مزايا المتجر">
          <article><Icon>✓</Icon><div><strong>كتالوج مؤسسي</strong><small>المنتجات المعروضة من العقد التجاري للحساب.</small></div></article>
          <article><Icon>ر.ي</Icon><div><strong>أسعار واضحة</strong><small>السعر المصرح فقط؛ لا نعرض سعرًا وهميًا للعميل.</small></div></article>
          <article><Icon>↻</Icon><div><strong>شراء متكرر</strong><small>{latestOrderNumber ? `إعادة الطلب من #${latestOrderNumber}` : 'القوالب والطلبات السابقة في الحساب.'}</small></div></article>
          <article><Icon>⌁</Icon><div><strong>متابعة الحساب</strong><small>{showCredit && financeReady ? availableCreditText || 'المركز المالي' : 'الطلبات والحساب والعناوين.'}</small></div></article>
        </section>

        <section id="store-categories" className="store-section">
          <div className="store-section-head">
            <div><span className="store-kicker">SHOP BY CATEGORY</span><h2>استكشف التصنيفات</h2><p>ابدأ من القسم الأقرب لما يحتاجه متجرك.</p></div>
            {categories.length > 6 && <button type="button" className="store-link" onClick={() => setAllCategories(v => !v)}>{allCategories ? 'عرض أقل' : 'عرض الكل'} ↗</button>}
          </div>
          <div className="store-category-grid">
            <button type="button" className={activeCategory === null ? 'active' : ''} onClick={() => chooseCategory(null)}><Icon>⌂</Icon><strong>كل المنتجات</strong><small>الكتالوج الكامل</small></button>
            {categories.slice(0, allCategories ? categories.length : 6).map(c => <button type="button" className={activeCategory === c.id ? 'active' : ''} key={c.id} onClick={() => chooseCategory(c.id)}><Icon>◫</Icon><strong>{c.name}</strong><small>عرض المنتجات</small></button>)}
            {!categories.length && <div className="store-category-empty"><strong>{signedIn ? 'جارٍ تجهيز التصنيفات' : 'تصنيفات المؤسسة تظهر بعد الدخول'}</strong><span>{signedIn ? 'بيانات المتجر الحقيقية قيد التحميل.' : 'لن نضع تصنيفات وهمية داخل متجر الأغبري.'}</span></div>}
          </div>
        </section>

        <section id="store-products" className="store-section">
          <div className="store-section-head store-product-head">
            <div><span className="store-kicker">PRODUCTS</span><h2>{activeCategory ? (categories.find(c => c.id === activeCategory)?.name || 'المنتجات') : 'مختارات من الكتالوج'}</h2><p>{signedIn ? 'أصناف فعلية من كتالوج الحساب الحالي.' : 'سجّل الدخول لعرض أصناف وأسعار حسابك.'}</p></div>
            <div className="store-head-actions"><button type="button" className="store-secondary" onClick={onOpenQuickOrder}>طلب سريع</button><button type="button" className="primary" onClick={() => onNavigate('catalog')}>فتح الكتالوج الكامل</button></div>
          </div>
          {signedIn && visible.length ? <div className="store-product-grid">{visible.map(p => <ProductCard key={p.id} product={p} favorite={favoriteIds.includes(p.id)} compared={compareIds.includes(p.id)} busy={busyId === p.id} onAdd={item => void add(item as StorefrontProduct)} onOpen={onOpenProduct} onFavorite={onToggleFavorite} onCompare={onToggleCompare} />)}</div> : (
            <div className="store-locked">
              <div className="store-locked-mark">أ</div>
              <div><span className="store-kicker">YOUR BUSINESS CATALOG</span><h3>{signedIn ? 'الكتالوج قيد التحميل' : 'افتح متجر مؤسستك'}</h3><p>{signedIn ? 'عند وصول البيانات ستظهر هنا المنتجات والصور والأسعار والمخزون من Commerce.' : 'تجربة المتجر كاملة مرتبطة بالحساب المصرح حتى تبقى الأسعار والمخزون والمعاملات صحيحة.'}</p><button type="button" className="primary" onClick={() => signedIn ? onNavigate('catalog') : onLogin()}>{signedIn ? 'فتح الكتالوج' : 'دخول وبدء التسوق'} ↗</button></div>
            </div>
          )}
        </section>

        <section className="store-journey">
          <div className="store-journey-copy"><span className="store-kicker">SHOPPING FLOW</span><h2>تجربة متجر كاملة من أول نقرة إلى الطلب.</h2><p>المسارات التجارية تظهر للمشتري في مكان واحد، بينما تظل الإدارة والتشغيل منفصلين.</p></div>
          <div className="store-journey-grid">
            <button type="button" onClick={() => onNavigate('catalog')}><span>01</span><strong>اكتشف</strong><small>بحث وتصنيفات وكتالوج.</small></button>
            <button type="button" onClick={() => signedIn && products[0] ? onOpenProduct(products[0]) : onLogin()} disabled={signedIn && !products.length}><span>02</span><strong>راجع</strong><small>تفاصيل الصنف والسعر والكمية.</small></button>
            <button type="button" onClick={onOpenCart}><span>03</span><strong>أضف</strong><small>{cartCount ? `${cartCount.toLocaleString('ar-YE')} وحدة في السلة` : 'ابنِ طلبك الحالي.'}</small></button>
            <button type="button" onClick={onOpenCheckout} disabled={!signedIn || cartCount === 0}><span>04</span><strong>اعتمد</strong><small>Checkout وإنشاء الطلب الحقيقي.</small></button>
          </div>
        </section>

        <section className="store-business-band">
          <div><span className="store-kicker">YOUR BUSINESS SPACE</span><h2>{signedIn ? `مرحبًا ${customerName}` : 'مساحة حسابك التجاري'}</h2><p>{signedIn ? `${organizationName || 'الأغبري'} · ${ordersCount.toLocaleString('ar-YE')} طلب` : 'بعد تسجيل الدخول تظهر طلباتك وقوالبك وحسابك المالي وعناوين التسليم.'}</p></div>
          <div className="store-business-actions">
            {signedIn ? <>
              <button type="button" onClick={() => onNavigate('orders')}>طلباتي ↗</button>
              <button type="button" onClick={() => onNavigate('saved')}>المفضلة <b>{favoriteIds.length}</b></button>
              {showTemplates && <button type="button" onClick={() => onNavigate('templates')}>القوالب ↗</button>}
              {showCredit && <button type="button" onClick={() => onNavigate('finance')}>المركز المالي ↗</button>}
            </> : <button type="button" className="primary" onClick={onLogin}>دخول الحساب ↗</button>}
          </div>
        </section>
      </main>

      <footer className="store-footer">
        <div className="store-footer-brand"><span className="store-brand-mark">أ</span><div><strong>الأغبري</strong><small>Aghbari Commerce · B2B</small></div></div>
        <div><b>المتجر</b><button type="button" onClick={() => onNavigate('catalog')}>المنتجات</button><button type="button" onClick={() => onNavigate('orders')}>الطلبات</button></div>
        <div><b>الحساب</b><button type="button" onClick={() => signedIn ? onNavigate('account') : onLogin()}>حسابي</button><button type="button" onClick={onOpenCart}>السلة</button></div>
        <div><b>الحالة</b><span>{isOnline ? '● متصل' : '○ غير متصل'}</span><small>البيانات التجارية المصرح بها فقط.</small></div>
        {signedIn && onOpenAdmin && <button type="button" className="store-admin-button" onClick={onOpenAdmin}>لوحة التشغيل ↗</button>}
      </footer>

      <div className="store-mobile-dock">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>⌂</span>الرئيسية</button>
        <button type="button" onClick={() => onNavigate('catalog')}><span>▦</span>المنتجات</button>
        <button type="button" onClick={onOpenCart}><span>🛒</span>السلة<b>{cartCount}</b></button>
        <button type="button" onClick={() => signedIn ? onNavigate('account') : onLogin()}><span>♙</span>حسابي</button>
      </div>
    </div>
  );
}
