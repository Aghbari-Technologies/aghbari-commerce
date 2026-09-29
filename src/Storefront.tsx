import { useEffect, useMemo, useState } from 'react';
import type { CatalogItem } from './services/catalog';
import { getCatalog, getProductImageUrls } from './services/catalog';
import { getCategories, type CategoryOption } from './services/categories';
import { getCart, removeCartItem, setCartItem, type CartItem } from './services/cart';
import { formatMoney } from './domain/pricing';

interface StorefrontProps {
  onLogin: () => void;
  signedIn?: boolean;
}

type StoreProduct = CatalogItem & { imageUrl?: string };

function money(value: number | null | undefined, currency = 'YER') {
  if (value == null || value <= 0) return null;
  return `${formatMoney(Number(value))} ${currency === 'YER' ? 'ر.ي' : currency}`;
}

function statusLabel(value: number) {
  return value > 0 ? 'متوفر' : 'نفد المخزون';
}

export default function Storefront({ onLogin, signedIn = false }: StorefrontProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.authorized_price ?? 0) * item.quantity, 0), [cart]);

  const selectedCategory = useMemo(() => categories.find(item => item.id === categoryId)?.name ?? '', [categories, categoryId]);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      void Promise.all([
        getCategories(),
        getCatalog(query, categoryId, 18, 0),
        getCart(),
      ]).then(async ([categoryRows, productRows, cartRows]) => {
        const imageMap = await getProductImageUrls(productRows.map(item => item.image_path));
        if (cancelled) return;
        setCategories(categoryRows);
        setProducts(productRows.map(item => ({
          ...item,
          imageUrl: item.image_path ? imageMap.get(item.image_path) : undefined,
        })));
        setCart(cartRows);
      }).catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'تعذر تحميل كتالوج المتجر.');
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    }, 220);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [signedIn, query, categoryId]);

  function clearSearch() {
    setQuery('');
  }

  async function addToCart(product: StoreProduct) {
    if (!signedIn) {
      onLogin();
      return;
    }
    if (product.available_quantity <= 0 || !product.authorized_price) {
      setNotice(product.available_quantity <= 0 ? 'هذا الصنف غير متوفر حاليًا.' : 'السعر غير متاح لهذا الحساب.');
      return;
    }
    const current = cart.find(item => item.product_id === product.id)?.quantity ?? 0;
    const next = Math.min(current + 1, product.available_quantity);
    setBusyId(product.id);
    try {
      await setCartItem(product.id, next);
      setCart(await getCart());
      setCartOpen(true);
      setNotice(`تمت إضافة «${product.name}» إلى السلة.`);
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : 'تعذر إضافة الصنف إلى السلة.');
    } finally {
      setBusyId(null);
    }
  }

  async function changeCart(productId: string, quantity: number) {
    setCartLoading(true);
    try {
      if (quantity <= 0) await removeCartItem(productId);
      else await setCartItem(productId, quantity);
      setCart(await getCart());
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : 'تعذر تحديث السلة.');
    } finally {
      setCartLoading(false);
    }
  }

  function goTo(section: string) {
    if (!signedIn) {
      onLogin();
      return;
    }
    window.location.hash = `#${section}`;
  }

  const previewProducts = products.slice(0, 4);

  return (
    <div className="storefront-live" dir="rtl">
      <div className="storefront-live-topbar">
        <span>الأغبري B2B</span>
        <strong>{signedIn ? 'متجر مؤسستك • كتالوج حي وأسعار مرتبطة بحسابك' : 'متجر التجارة بالجملة • ابدأ التصفح ثم ادخل إلى حسابك'}</strong>
        <button type="button" onClick={() => signedIn ? goTo('account') : onLogin()}>{signedIn ? 'حسابي ↗' : 'دخول الحساب ↗'}</button>
      </div>

      <header className="storefront-live-header">
        <button type="button" className="storefront-live-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="الأغبري">
          <span className="storefront-live-logo">أ</span>
          <span><strong>الأغبري</strong><small>Aghbari Commerce</small></span>
        </button>

        <nav aria-label="تنقل المتجر" className="storefront-live-nav">
          <button type="button" className="active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>الرئيسية</button>
          <button type="button" onClick={() => document.getElementById('storefront-live-catalog')?.scrollIntoView({ behavior: 'smooth' })}>المنتجات</button>
          <button type="button" onClick={() => document.getElementById('storefront-live-categories')?.scrollIntoView({ behavior: 'smooth' })}>التصنيفات</button>
          <button type="button" onClick={() => goTo('orders')}>طلباتي</button>
        </nav>

        <form className="storefront-live-search" onSubmit={(e) => { e.preventDefault(); document.getElementById('storefront-live-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن منتج أو SKU أو باركود..." aria-label="البحث في متجر الأغبري" />
          {query && <button type="button" aria-label="مسح البحث" onClick={clearSearch}>×</button>}
          <button type="submit">بحث</button>
        </form>

        <div className="storefront-live-actions">
          <button type="button" onClick={() => signedIn ? goTo('saved') : onLogin()} aria-label="المفضلة">
            <span>♡</span><b>{signedIn ? 'المفضلة' : 'حساب'}</b><i>{signedIn ? '↗' : '↗'}</i>
          </button>
          <button type="button" className="cart" onClick={() => signedIn ? setCartOpen(true) : onLogin()} aria-label="السلة">
            <span>🛒</span><b>السلة</b><i>{cartCount}</i>
          </button>
        </div>
      </header>

      <main>
        <section className="storefront-live-hero">
          <div className="storefront-live-hero-copy">
            <span className="storefront-live-kicker">AGHBARI COMMERCE · ONLINE STORE</span>
            <h1>تجارة الجملة<br /><em>بشكل متجر حقيقي.</em></h1>
            <p>منتجاتك، أسعارك، مخزونك، سلتك وطلباتك في تجربة بيع واضحة، مستقلة تمامًا عن مركز التشغيل الداخلي.</p>
            <div className="storefront-live-hero-actions">
              <button type="button" className="primary" onClick={() => document.getElementById('storefront-live-catalog')?.scrollIntoView({ behavior: 'smooth' })}>{signedIn ? 'تصفح المنتجات' : 'ابدأ التسوق'} <span>←</span></button>
              <button type="button" className="secondary" onClick={() => signedIn ? setCartOpen(true) : onLogin()}>السلة <span>↗</span></button>
              <button type="button" className="ghost" onClick={() => signedIn ? goTo('orders') : onLogin()}>طلباتي <span>↗</span></button>
            </div>
            <div className="storefront-live-proof">
              <span><b>✓</b> أسعار مصرح بها</span>
              <span><b>✓</b> مخزون حي</span>
              <span><b>✓</b> شراء آمن</span>
            </div>
          </div>

          <div className="storefront-live-hero-ui" aria-label="معاينة واجهة المتجر">
            <div className="storefront-live-ui-window">
              <div className="storefront-live-ui-head"><strong>الأغبري</strong><span>{signedIn ? 'متجر مؤسستك' : 'معاينة المتجر'}</span></div>
              <div className="storefront-live-ui-search"><span>⌕</span><span>{query || 'ابحث في الكتالوج...'}</span></div>
              <div className="storefront-live-ui-tabs"><span className="active">الكل</span><span>الأكثر صلة</span><span>{categories[0]?.name || 'تصنيفات'}</span></div>
              <div className="storefront-live-ui-products">
                {previewProducts.length ? previewProducts.map(product => (
                  <button type="button" key={product.id} onClick={() => setSelected(product)}>
                    <div>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>{product.name.slice(0, 1)}</span>}</div>
                    <strong>{product.name}</strong>
                    <small>{money(product.authorized_price, product.currency) || 'حسب الحساب'}</small>
                  </button>
                )) : (
                  <>
                    <div className="placeholder"><span>أ</span><strong>كتالوج مؤسستك</strong><small>{signedIn ? 'جارٍ تحميل المنتجات...' : 'بعد تسجيل الدخول'}</small></div>
                    <div className="placeholder"><span>🛒</span><strong>السلة</strong><small>{signedIn ? `${cartCount} وحدة حالية` : 'جاهزة للشراء'}</small></div>
                  </>
                )}
              </div>
              <div className="storefront-live-ui-bottom"><span>السلة</span><strong>{cartCount.toLocaleString('ar-YE')} وحدة</strong><button type="button" onClick={() => signedIn ? setCartOpen(true) : onLogin()}>فتح السلة</button></div>
            </div>
            <div className="storefront-live-float one"><small>الحساب</small><strong>{signedIn ? 'مصرّح' : 'B2B'}</strong><span>{signedIn ? 'الأسعار حسب مؤسستك' : 'الدخول يفتح الكتالوج'}</span></div>
            <div className="storefront-live-float two"><small>الشراء</small><strong>4 خطوات</strong><span>تصفح → سلة → Checkout → طلب</span></div>
          </div>
        </section>

        <section className="storefront-live-benefits">
          <article><b>01</b><div><strong>كتالوج واضح</strong><span>صور، وصف، وحدة، SKU، مخزون وسعر الحساب.</span></div></article>
          <article><b>02</b><div><strong>شراء أسرع</strong><span>بحث مباشر وتصنيفات وطلب سريع من نفس المسار.</span></div></article>
          <article><b>03</b><div><strong>سلة حقيقية</strong><span>الكميات تحفظ في Commerce وتبقى مرتبطة بالحساب.</span></div></article>
          <article><b>04</b><div><strong>متابعة كاملة</strong><span>طلبات، محفوظات، حساب ومالية من بوابة العميل.</span></div></article>
        </section>

        <section id="storefront-live-categories" className="storefront-live-section">
          <div className="storefront-live-section-head">
            <div><span className="storefront-live-kicker">SHOP BY CATEGORY</span><h2>اختر القسم الذي تحتاجه</h2><p>التصنيفات الحقيقية تظهر للحساب المصرح فقط.</p></div>
            {signedIn && <button type="button" className="storefront-live-link" onClick={() => { setCategoryId(null); document.getElementById('storefront-live-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>عرض الكتالوج الكامل ↗</button>}
          </div>
          <div className="storefront-live-category-grid">
            <button type="button" className={!categoryId ? 'active' : ''} onClick={() => { if (!signedIn) { onLogin(); return; } setCategoryId(null); }}>
              <span>⌂</span><strong>كل المنتجات</strong><small>{signedIn ? 'الكتالوج الكامل' : 'بعد الدخول'}</small>
            </button>
            {categories.slice(0, 8).map(category => (
              <button type="button" className={categoryId === category.id ? 'active' : ''} key={category.id} onClick={() => { if (!signedIn) { onLogin(); return; } setCategoryId(category.id); }}>
                <span>◫</span><strong>{category.name}</strong><small>عرض الأصناف</small>
              </button>
            ))}
            {!signedIn && <div className="storefront-live-category-lock"><strong>التصنيفات الخاصة بمؤسستك</strong><span>الدخول يعرض الأقسام والمنتجات المصرح بها فقط.</span><button type="button" onClick={onLogin}>دخول وفتح المتجر ↗</button></div>}
          </div>
        </section>

        <section id="storefront-live-catalog" className="storefront-live-section">
          <div className="storefront-live-section-head">
            <div><span className="storefront-live-kicker">LIVE CATALOG</span><h2>{selectedCategory || 'منتجات الأغبري'}</h2><p>{signedIn ? 'المحتوى من كتالوج الحساب الحالي، وليس بيانات تجريبية.' : 'ادخل بحسابك لعرض الكتالوج الحقيقي.'}</p></div>
            <div className="storefront-live-counter">{signedIn ? (loading ? 'جارٍ التحميل…' : `${products.length.toLocaleString('ar-YE')} صنف`) : 'B2B'}</div>
          </div>

          {error && <div className="storefront-live-error" role="alert"><strong>تعذر تحميل المتجر</strong><span>{error}</span><button type="button" onClick={() => setQuery(q => q)}>إعادة المحاولة</button></div>}

          {signedIn ? (
            loading && products.length === 0 ? (
              <div className="storefront-live-grid storefront-live-skeleton" role="status" aria-label="جارٍ تحميل المنتجات">{Array.from({ length: 8 }).map((_, i) => <article key={i}><i/><div><i/><i/><i/></div></article>)}</div>
            ) : products.length ? (
              <div className="storefront-live-grid">
                {products.map(product => {
                  const price = money(product.authorized_price, product.currency);
                  const available = product.available_quantity > 0;
                  return <article className="storefront-live-product" key={product.id}>
                    <div className="storefront-live-product-media">
                      <button type="button" onClick={() => setSelected(product)} aria-label={`تفاصيل ${product.name}`}>
                        {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>{product.name.slice(0, 1)}</span>}
                      </button>
                      <span className={available ? 'stock' : 'stock out'}>{statusLabel(product.available_quantity)}</span>
                      <button type="button" className="heart" onClick={() => { goTo('saved'); }} aria-label="حفظ الصنف">♡</button>
                    </div>
                    <div className="storefront-live-product-body">
                      <small>{product.sku} · {product.unit}</small>
                      <h3>{product.name}</h3>
                      <p>{product.description || 'صنف من كتالوج الأغبري.'}</p>
                      <div className="facts"><span>المتاح <b>{product.available_quantity.toLocaleString('ar-YE')}</b></span><span>الحساب <b>{price || 'حسب الحساب'}</b></span></div>
                      <div className="storefront-live-product-footer">
                        <strong>{price || 'السعر حسب الحساب'}</strong>
                        <button type="button" disabled={!available || !price || busyId === product.id} onClick={() => void addToCart(product)}>{busyId === product.id ? '...' : 'أضف للسلة'}</button>
                      </div>
                      <button type="button" className="details" onClick={() => setSelected(product)}>عرض التفاصيل ↗</button>
                    </div>
                  </article>;
                })}
              </div>
            ) : (
              <div className="storefront-live-empty"><strong>لا توجد منتجات مطابقة.</strong><span>جرّب تغيير البحث أو التصنيف.</span><button type="button" onClick={() => { setQuery(''); setCategoryId(null); }}>عرض الكتالوج</button></div>
            )
          ) : (
            <div className="storefront-live-gated">
              <div className="storefront-live-gated-icon">أ</div>
              <div><span className="storefront-live-kicker">YOUR STORE</span><h3>الكتالوج الحقيقي جاهز بعد الدخول</h3><p>حتى تبقى الأسعار والمخزون مرتبطة بالمؤسسة الصحيحة، لا نعرض بيانات تجريبية في المتجر.</p><button type="button" className="primary" onClick={onLogin}>دخول وبدء الشراء ↗</button></div>
            </div>
          )}
        </section>

        <section className="storefront-live-journey">
          <div><span className="storefront-live-kicker">SHOPPING FLOW</span><h2>المتجر لا ينتهي عند صفحة المنتجات.</h2><p>كل المسارات التالية موجودة في الأغبري وتبقى مرتبطة بالحساب نفسه.</p></div>
          <div className="storefront-live-journey-grid">
            <button type="button" onClick={() => signedIn ? goTo('saved') : onLogin()}><span>♡</span><strong>المحفوظات</strong><small>مفضلة وأصناف للعودة السريعة.</small></button>
            <button type="button" onClick={() => signedIn ? goTo('orders') : onLogin()}><span>🧾</span><strong>طلباتي</strong><small>التتبع والسجل وإعادة الطلب.</small></button>
            <button type="button" onClick={() => signedIn ? goTo('templates') : onLogin()}><span>▤</span><strong>القوالب</strong><small>طلبات متكررة جاهزة للتطبيق.</small></button>
            <button type="button" onClick={() => signedIn ? goTo('finance') : onLogin()}><span>◫</span><strong>المركز المالي</strong><small>الائتمان والحركات المتاحة للحساب.</small></button>
          </div>
        </section>
      </main>

      <footer className="storefront-live-footer">
        <div><span className="storefront-live-logo">أ</span><div><strong>الأغبري</strong><small>Aghbari Commerce · B2B</small></div></div>
        <div><b>المتجر</b><button type="button" onClick={() => document.getElementById('storefront-live-catalog')?.scrollIntoView({ behavior: 'smooth' })}>المنتجات</button><button type="button" onClick={() => document.getElementById('storefront-live-categories')?.scrollIntoView({ behavior: 'smooth' })}>التصنيفات</button></div>
        <div><b>الحساب</b><button type="button" onClick={() => goTo('orders')}>الطلبات</button><button type="button" onClick={() => goTo('account')}>حسابي</button></div>
        <div><b>السلة</b><button type="button" onClick={() => signedIn ? setCartOpen(true) : onLogin()}>السلة ({cartCount})</button><small>{isOnlineLabel(signedIn)}</small></div>
      </footer>

      <div className="storefront-live-mobile-dock">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>⌂</span>الرئيسية</button>
        <button type="button" onClick={() => document.getElementById('storefront-live-catalog')?.scrollIntoView({ behavior: 'smooth' })}><span>▦</span>المنتجات</button>
        <button type="button" onClick={() => signedIn ? setCartOpen(true) : onLogin()}><span>🛒</span>السلة<b>{cartCount}</b></button>
        <button type="button" onClick={() => signedIn ? goTo('account') : onLogin()}><span>♙</span>حسابي</button>
      </div>

      {notice && <div className="storefront-live-toast" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')}>×</button></div>}

      {selected && <div className="storefront-live-backdrop" onClick={() => setSelected(null)}>
        <section className="storefront-live-modal" role="dialog" aria-modal="true" aria-labelledby="storefront-live-product-title" onClick={e => e.stopPropagation()}>
          <button type="button" className="close" onClick={() => setSelected(null)} aria-label="إغلاق">×</button>
          <div className="media">{selected.imageUrl ? <img src={selected.imageUrl} alt="" /> : <span>{selected.name.slice(0, 1)}</span>}</div>
          <div className="copy"><span className="storefront-live-kicker">{selected.sku}</span><h2 id="storefront-live-product-title">{selected.name}</h2><p>{selected.description || 'معلومات الصنف من كتالوج الأغبري.'}</p><div className="modal-facts"><span>الوحدة <b>{selected.unit}</b></span><span>المتاح <b>{selected.available_quantity.toLocaleString('ar-YE')}</b></span></div><strong className="modal-price">{money(selected.authorized_price, selected.currency) || 'السعر حسب الحساب'}</strong><button type="button" className="primary" disabled={!selected.available_quantity || !selected.authorized_price} onClick={async () => { await addToCart(selected); setSelected(null); }}>أضف للسلة ↗</button></div>
        </section>
      </div>}

      {cartOpen && signedIn && <div className="storefront-live-backdrop" onClick={() => setCartOpen(false)}>
        <aside className="storefront-live-cart" role="dialog" aria-modal="true" aria-labelledby="storefront-live-cart-title" onClick={e => e.stopPropagation()}>
          <div className="cart-head"><div><span className="storefront-live-kicker">YOUR CART</span><h2 id="storefront-live-cart-title">سلة الشراء <b>{cartCount}</b></h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="إغلاق">×</button></div>
          {cart.length ? <div className="cart-lines">{cart.map(line => <article key={line.product_id}><div><strong>{line.name}</strong><small>{line.sku} · {line.unit}</small></div><div className="qty"><button type="button" disabled={cartLoading} onClick={() => void changeCart(line.product_id, line.quantity - 1)}>−</button><span>{line.quantity}</span><button type="button" disabled={cartLoading} onClick={() => void changeCart(line.product_id, line.quantity + 1)}>+</button></div><b>{money((line.authorized_price ?? 0) * line.quantity, line.currency) || '—'}</b></article>)}</div> : <div className="cart-empty"><strong>السلة فارغة.</strong><span>أضف المنتجات التي تحتاجها من الكتالوج.</span></div>}
          <footer><span>الإجمالي</span><strong>{money(cartTotal, cart[0]?.currency ?? 'YER') || '0 ر.ي'}</strong><button type="button" disabled={!cart.length} onClick={() => { setCartOpen(false); window.location.hash = '#catalog'; }}>المتابعة إلى Checkout ↗</button></footer>
        </aside>
      </div>}
    </div>
  );
}

function isOnlineLabel(signedIn: boolean) {
  if (!signedIn) return 'الدخول مطلوب لعرض الخدمة';
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'وضع عدم الاتصال';
  return 'الخدمة متصلة';
}
