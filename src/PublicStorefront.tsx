import { useEffect, useMemo, useState } from 'react';
import type { CatalogItem } from './services/catalog';
import { getCatalog, getCatalogProductById, getProductImageUrls } from './services/catalog';
import { getCategories, type CategoryOption } from './services/categories';
import { getCart, setCartItem, removeCartItem, type CartItem } from './services/cart';
import { formatMoney } from './domain/pricing';

type SurfaceRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer' | 'customer';

type StoreProduct = CatalogItem & { imageUrl?: string };

type PublicStorefrontProps = {
  role: SurfaceRole;
  customerId: string | null;
  warehouseId: string | null;
  customerName: string;
};

const PAGE_SIZE = 18;

function money(value: number | null, currency = 'YER') {
  if (value == null || value <= 0) return null;
  return `${formatMoney(value)} ${currency === 'YER' ? 'ر.ي' : currency}`;
}

function canShop(role: SurfaceRole, customerId: string | null) {
  return role === 'customer' && Boolean(customerId);
}

export default function PublicStorefront({ role, customerId, warehouseId, customerName }: PublicStorefrontProps) {
  const shopper = canShop(role, customerId);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<StoreProduct | null>(null);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, line) => sum + (line.authorized_price ?? 0) * line.quantity, 0), [cart]);

  async function loadCatalog(nextPage = page, reset = false) {
    setLoading(true);
    setError('');
    try {
      const rows = await getCatalog(query, categoryId, PAGE_SIZE, nextPage * PAGE_SIZE, warehouseId ?? undefined);
      const imageMap = await getProductImageUrls(rows.map((row) => row.image_path));
      const mapped = rows.map((row) => ({ ...row, imageUrl: row.image_path ? imageMap.get(row.image_path) : undefined }));
      setProducts((current) => reset ? mapped : [...current, ...mapped]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل المتجر.');
      if (reset) setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [categoryRows] = await Promise.all([getCategories(), shopper ? getCart() : Promise.resolve([])]);
        if (!active) return;
        setCategories(categoryRows);
        if (shopper) setCart(await getCart());
      } catch {
        if (active && shopper) setCart([]);
      }
    })();
    return () => { active = false; };
  }, [shopper]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCatalog(0, true); }, 120);
    return () => window.clearTimeout(timer);
  }, [query, categoryId, warehouseId]);

  async function add(product: StoreProduct, quantity = 1) {
    if (!shopper) {
      setNotice('لإضافة المنتجات وإتمام الطلب، ادخل بحساب عميل مصرح.');
      return;
    }
    if (product.available_quantity < 1 || !product.authorized_price) {
      setNotice(product.available_quantity < 1 ? 'هذا المنتج غير متوفر حاليًا.' : 'السعر غير متاح لحسابك.');
      return;
    }
    const current = cart.find((line) => line.product_id === product.id)?.quantity ?? 0;
    const next = Math.min(current + quantity, product.available_quantity);
    setBusyProductId(product.id);
    try {
      await setCartItem(product.id, next);
      const fresh = await getCart();
      setCart(fresh);
      setNotice(`تمت إضافة «${product.name}» إلى السلة.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'تعذر تحديث السلة.');
    } finally {
      setBusyProductId(null);
    }
  }

  async function changeCart(productId: string, quantity: number) {
    try {
      if (quantity <= 0) await removeCartItem(productId);
      else await setCartItem(productId, quantity);
      setCart(await getCart());
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'تعذر تحديث السلة.');
    }
  }

  function openPortal() {
    window.location.hash = shopper ? '#home' : '';
  }

  async function openSharedProduct() {
    const raw = window.location.hash.startsWith('#catalog-product-')
      ? decodeURIComponent(window.location.hash.replace('#catalog-product-', ''))
      : '';
    if (!raw) return;
    try {
      setLoadingImages(true);
      const item = await getCatalogProductById(raw, warehouseId ?? undefined);
      if (!item) return;
      const images = await getProductImageUrls([item.image_path]);
      setSelected({ ...item, imageUrl: item.image_path ? images.get(item.image_path) : undefined });
    } catch {
      // Invalid/stale public deep-link is intentionally ignored.
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    void openSharedProduct();
  }, [warehouseId]);

  return (
    <div className="public-storefront" dir="rtl">
      <header className="store-header">
        <button type="button" className="store-brand" onClick={() => { window.location.hash = '#store'; }}>
          <span className="store-logo" aria-hidden="true">أ</span>
          <span><strong>الأغبري</strong><small>سوق التجارة بالجملة</small></span>
        </button>
        <nav className="store-nav" aria-label="التنقل الرئيسي">
          <button type="button" className="active" onClick={() => { setCategoryId(null); setPage(0); }}>الرئيسية</button>
          <button type="button" onClick={() => { document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>المنتجات</button>
          <button type="button" onClick={() => shopper ? (window.location.hash = '#orders') : undefined}>طلباتي</button>
          <button type="button" onClick={openPortal}>{shopper ? 'حسابي' : 'تسجيل الدخول'}</button>
        </nav>
        <div className="store-header-actions">
          <span className="store-account-chip">{shopper ? `مرحبًا، ${customerName}` : 'تصفح المتجر'}</span>
          <button type="button" className="store-cart-button" onClick={() => document.getElementById('store-cart')?.scrollIntoView({ behavior: 'smooth' })}>
            السلة <b>{cartCount || 0}</b>
          </button>
          <button type="button" className="store-admin-link" onClick={() => { window.location.hash = '#admin-dashboard'; }}>
            لوحة التشغيل
          </button>
        </div>
      </header>

      <main className="store-main">
        <section className="store-hero" aria-labelledby="store-title">
          <div className="store-hero-copy">
            <span className="store-eyebrow">AGHBARI COMMERCE · B2B STOREFRONT</span>
            <h1 id="store-title">كل ما يحتاجه متجرك، في مكان واحد.</h1>
            <p>تصفح الكتالوج، اكتشف الأصناف بسرعة، راجع السعر المصرح لحسابك، وأرسل طلبك من تجربة شراء مخصصة للتجارة بالجملة.</p>
            <div className="store-hero-actions">
              <button type="button" onClick={() => document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth' })}>تصفح المنتجات ↗</button>
              <button type="button" className="ghost" onClick={() => shopper ? (window.location.hash = '#orders') : setNotice('سجّل الدخول أولًا لمتابعة طلباتك.')}>{shopper ? 'متابعة طلباتي' : 'دخول العميل'}</button>
            </div>
            <div className="store-trust-row">
              <span><b>✓</b> أسعار حسب الصلاحية</span>
              <span><b>✓</b> مخزون مرتبط بالمستودع</span>
              <span><b>✓</b> طلبات مباشرة وآمنة</span>
            </div>
          </div>
          <div className="store-hero-panel">
            <span>واجهة الشراء</span>
            <strong>{products.length.toLocaleString('ar-YE')}</strong>
            <small>صنف في الصفحة الحالية</small>
            <div className="store-hero-mini-grid">
              <div><span>الفئات</span><b>{categories.length.toLocaleString('ar-YE')}</b></div>
              <div><span>السلة</span><b>{cartCount.toLocaleString('ar-YE')}</b></div>
              <div><span>الحساب</span><b>{shopper ? 'مصرح' : 'زائر'}</b></div>
            </div>
          </div>
        </section>

        <section className="store-category-bar" aria-label="التصنيفات">
          <div><span>تسوق حسب التصنيف</span><button type="button" className={!categoryId ? 'active' : ''} onClick={() => setCategoryId(null)}>الكل</button></div>
          <div className="store-category-scroll">
            {categories.map((category) => (
              <button key={category.id} type="button" className={categoryId === category.id ? 'active' : ''} onClick={() => { setCategoryId(category.id); setPage(0); }}>{category.name}</button>
            ))}
          </div>
        </section>

        <section className="store-toolbar">
          <div>
            <span className="store-eyebrow">كتالوج الأغبري</span>
            <h2>منتجات جاهزة للطلب</h2>
          </div>
          <label className="store-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="ابحث باسم المنتج أو SKU أو الباركود..." aria-label="البحث في منتجات المتجر" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="مسح البحث">×</button>}
          </label>
        </section>

        <section id="store-catalog" className="store-catalog-section">
          <div className="store-catalog-heading">
            <div><strong>{query ? `نتائج البحث عن «${query}»` : categoryId ? (categories.find((c) => c.id === categoryId)?.name ?? 'تصنيف') : 'كل المنتجات'}</strong><small>{loading ? 'جارٍ التحميل…' : `${products.length.toLocaleString('ar-YE')} منتج معروض`}</small></div>
            {!shopper && <span className="store-visitor-note">المشاهدة مفتوحة، أما الأسعار والشراء فتتطلب حسابًا مصرحًا.</span>}
          </div>

          {error && <div className="store-error" role="alert"><strong>تعذر تحميل الكتالوج</strong><span>{error}</span><button type="button" onClick={() => void loadCatalog(0, true)}>إعادة المحاولة</button></div>}

          {loading && !products.length ? (
            <div className="store-product-grid store-skeleton-grid" aria-label="جارٍ تحميل المنتجات" role="status">
              {Array.from({ length: 8 }).map((_, index) => <article key={index}><i/><div><i/><i/><i/></div></article>)}
            </div>
          ) : products.length ? (
            <div className="store-product-grid">
              {products.map((product) => {
                const price = money(product.authorized_price, product.currency);
                return (
                  <article className="store-product-card" key={product.id}>
                    <button type="button" className="store-product-image" onClick={() => setSelected(product)} aria-label={`فتح تفاصيل ${product.name}`}>
                      {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span aria-hidden="true">{product.name.slice(0, 1)}</span>}
                      <i className={product.available_quantity > 0 ? 'in-stock' : 'out-stock'}>{product.available_quantity > 0 ? 'متوفر' : 'نفد المخزون'}</i>
                    </button>
                    <div className="store-product-body">
                      <small>{product.sku} · {product.unit}</small>
                      <h3>{product.name}</h3>
                      <p>{product.description || 'منتج تجاري من كتالوج الأغبري.'}</p>
                      <div className="store-product-meta"><span>المتاح</span><b>{product.available_quantity.toLocaleString('ar-YE')}</b></div>
                      <div className="store-product-footer">
                        <div>{price ? <strong>{price}</strong> : <em>{shopper ? 'السعر حسب الحساب' : 'سجّل الدخول لرؤية السعر'}</em>}</div>
                        <button type="button" onClick={() => void add(product)} disabled={!shopper || product.available_quantity < 1 || !price || busyProductId === product.id}>
                          {busyProductId === product.id ? 'جارٍ الإضافة…' : 'أضف للسلة'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="store-empty"><strong>لا توجد منتجات مطابقة.</strong><span>جرّب تغيير البحث أو التصنيف.</span><button type="button" onClick={() => { setQuery(''); setCategoryId(null); }}>عرض كل المنتجات</button></div>
          )}

          <div className="store-pagination">
            <button type="button" disabled={page === 0 || loading} onClick={() => { const next = Math.max(0, page - 1); setPage(next); void loadCatalog(next, true); }}>السابق</button>
            <span>صفحة {(page + 1).toLocaleString('ar-YE')}</span>
            <button type="button" disabled={!hasMore || loading} onClick={() => { const next = page + 1; setPage(next); void loadCatalog(next, true); }}>التالي</button>
          </div>
        </section>

        <section id="store-cart" className="store-cart-section">
          <div>
            <span className="store-eyebrow">السلة</span>
            <h2>طلبك الحالي</h2>
            <p>{shopper ? 'عدّل الكميات وراجع الإجمالي قبل الانتقال إلى إتمام الطلب.' : 'السلة متاحة بعد تسجيل الدخول بحساب عميل مصرح.'}</p>
          </div>
          <div className="store-cart-card">
            {shopper && cart.length ? cart.map((line) => (
              <article key={line.product_id}>
                <div><strong>{line.name}</strong><small>{line.sku} · {line.unit}</small></div>
                <div className="store-quantity">
                  <button type="button" onClick={() => void changeCart(line.product_id, line.quantity - 1)}>−</button>
                  <span>{line.quantity.toLocaleString('ar-YE')}</span>
                  <button type="button" onClick={() => void changeCart(line.product_id, line.quantity + 1)}>+</button>
                </div>
                <b>{money((line.authorized_price ?? 0) * line.quantity, line.currency) ?? '—'}</b>
              </article>
            )) : <div className="store-cart-empty"><strong>{shopper ? 'السلة فارغة' : 'ابدأ من حسابك التجاري'}</strong><span>{shopper ? 'أضف المنتجات التي تحتاجها من الكتالوج.' : 'سجّل الدخول بحساب العميل للوصول إلى السلة والأسعار والطلبات.'}</span></div>}
            <footer>
              <span>الإجمالي</span>
              <strong>{money(cartTotal, cart[0]?.currency ?? 'YER') ?? '0 ر.ي'}</strong>
              <button type="button" disabled={!shopper || !cart.length} onClick={() => { window.location.hash = '#checkout'; }}>المتابعة إلى إتمام الطلب ↗</button>
            </footer>
          </div>
        </section>
      </main>

      {notice && <div className="store-toast" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')}>×</button></div>}

      {selected && <div className="store-modal-backdrop" onClick={() => setSelected(null)}>
        <section className="store-product-modal" role="dialog" aria-modal="true" aria-labelledby="store-product-title" onClick={(event) => event.stopPropagation()}>
          <button className="store-modal-close" type="button" onClick={() => setSelected(null)} aria-label="إغلاق">×</button>
          <div className="store-modal-media">{selected.imageUrl ? <img src={selected.imageUrl} alt="" /> : <span>{selected.name.slice(0, 1)}</span>}</div>
          <div className="store-modal-copy">
            <span className="store-eyebrow">{selected.sku}</span>
            <h2 id="store-product-title">{selected.name}</h2>
            <p>{selected.description || 'معلومات المنتج مأخوذة من كتالوج الأغبري المصرح به.'}</p>
            <div className="store-modal-facts"><div><span>الوحدة</span><b>{selected.unit}</b></div><div><span>المتاح</span><b>{selected.available_quantity.toLocaleString('ar-YE')}</b></div></div>
            <div className="store-modal-price">{money(selected.authorized_price, selected.currency) || (shopper ? 'السعر حسب حسابك' : 'سجّل الدخول لرؤية السعر')}</div>
            <button type="button" className="store-modal-primary" disabled={!shopper || selected.available_quantity < 1 || !selected.authorized_price || loadingImages} onClick={async () => { await add(selected); setSelected(null); }}>أضف للسلة</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
