import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CartLine, Product } from './domain/types';
import { calculateClientPreviewTotal } from './domain/order';
import { formatMoney } from './domain/pricing';
import { getCatalog, type CatalogItem } from './services/catalog';
import { clearCart, getCart, setCartItem } from './services/cart';
import { createOrder } from './services/orders';
import { getSession, signIn, signOut } from './services/auth';
import { requireSupabase, supabase } from './lib/supabase';
import './styles.css';

function mapCatalogItem(item: CatalogItem): Product & { authorizedPrice?: number } {
  return {
    id: item.id, sku: item.sku, name: item.name, unit: item.unit,
    category: item.category_id ?? 'أصناف', description: item.description ?? undefined,
    availableQuantity: item.available_quantity, status: item.status === 'active' ? 'active' : 'inactive',
    imageUrl: item.image_path ?? undefined, authorizedPrice: item.authorized_price ?? undefined
  };
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('الكل');
  const [products, setProducts] = useState<Product[]>([]);
  const [serverPrices, setServerPrices] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSession().then(async (currentSession) => {
      if (cancelled) return;
      setSignedIn(Boolean(currentSession)); setSessionReady(true);
      if (!currentSession || !supabase) return;
      const { data: profile, error } = await supabase.from('profiles').select('customer_id').eq('id', currentSession.user.id).single();
      if (error) { setAuthError('تعذر ربط الحساب بملف العميل.'); return; }
      setCustomerId(profile.customer_id);
    }).catch((error) => {
      if (!cancelled) { setSessionReady(true); setAuthError(error instanceof Error ? error.message : 'تعذر قراءة جلسة الدخول.'); }
    });
    const listener = supabase?.auth.onAuthStateChange((_event, nextSession) => setSignedIn(Boolean(nextSession)));
    return () => { cancelled = true; listener?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!signedIn || !supabase) return;
    let cancelled = false;
    async function loadRuntime() {
      setRuntimeError(null);
      try {
        const [{ data: warehouse, error: warehouseError }, items, savedCart] = await Promise.all([
          supabase.from('warehouses').select('id').eq('is_active', true).order('created_at').limit(1).maybeSingle(),
          getCatalog(query, null, 100, 0),
          getCart()
        ]);
        if (warehouseError) throw warehouseError;
        if (!warehouse?.id) throw new Error('لا يوجد مستودع تشغيلي نشط.');
        if (cancelled) return;
        setWarehouseId(warehouse.id);
        const mapped = items.map(mapCatalogItem);
        setProducts(mapped);
        setServerPrices(Object.fromEntries(items.map((item) => [item.id, item.authorized_price ?? 0])));
        setCart(savedCart.map((item) => ({
          product: mapped.find((product) => product.id === item.product_id) ?? {
            id: item.product_id, sku: item.sku, name: item.name, unit: item.unit, category: 'أصناف', availableQuantity: 0, status: 'active'
          }, quantity: item.quantity, unitPrice: item.authorized_price ?? 0
        })));
      } catch (error) {
        if (!cancelled) setRuntimeError(error instanceof Error ? error.message : 'تعذر تحميل بيانات المتجر.');
      }
    }
    void loadRuntime();
    return () => { cancelled = true; };
  }, [query, signedIn]);

  const categories = useMemo(() => ['الكل', ...new Set(products.map((product) => product.category))], [products]);
  const filtered = useMemo(() => products.filter((product) =>
    (product.name.includes(query) || product.sku.toLowerCase().includes(query.toLowerCase())) &&
    (category === 'الكل' || product.category === category)
  ), [category, products, query]);
  const priceFor = (product: Product) => serverPrices[product.id] ?? 0;
  const total = calculateClientPreviewTotal(cart);

  async function handleLogin(event: FormEvent) {
    event.preventDefault(); setAuthBusy(true); setAuthError(null);
    try {
      await signIn(email, password); setPassword('');
      const current = await getSession();
      if (current && supabase) {
        const { data: profile } = await supabase.from('profiles').select('customer_id').eq('id', current.user.id).single();
        setCustomerId(profile?.customer_id ?? null);
      }
    } catch (error) { setAuthError(error instanceof Error ? error.message : 'تعذر تسجيل الدخول.'); }
    finally { setAuthBusy(false); }
  }

  async function handleSignOut() {
    await signOut();
    setProducts([]); setCart([]); setCustomerId(null); setWarehouseId(null); setOrderResult(null);
  }

  async function addToCart(product: Product) {
    const price = priceFor(product);
    if (price <= 0 || product.availableQuantity < 1) return;
    const existing = cart.find((line) => line.product.id === product.id);
    const quantity = Math.min((existing?.quantity ?? 0) + 1, product.availableQuantity);
    try {
      await setCartItem(product.id, quantity);
      setCart((current) => existing
        ? current.map((line) => line.product.id === product.id ? { ...line, quantity } : line)
        : [...current, { product, quantity, unitPrice: price }]);
      setOrderResult(null);
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحديث السلة.'); }
  }

  async function updateQuantity(id: string, quantity: number) {
    const line = cart.find((item) => item.product.id === id);
    if (!line) return;
    const next = Math.max(0, Math.min(quantity, line.product.availableQuantity));
    try {
      if (next === 0) {
        await requireSupabase().rpc('remove_cart_item', { p_product_id: id });
        setCart((current) => current.filter((item) => item.product.id !== id));
      } else {
        await setCartItem(id, next);
        setCart((current) => current.map((item) => item.product.id === id ? { ...item, quantity: next } : item));
      }
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحديث الكمية.'); }
  }

  async function submitOrder() {
    if (!customerId || !warehouseId || !cart.length || orderBusy) return;
    setOrderBusy(true); setOrderResult(null); setRuntimeError(null);
    try {
      const result = await createOrder({ customerId, idempotencyKey: crypto.randomUUID(), lines: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })) }, warehouseId);
      await clearCart(); setCart([]);
      setOrderResult(result ? `تم إرسال الطلب رقم ${result.order_number} بنجاح.` : 'تم إرسال الطلب بنجاح.');
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر إرسال الطلب. لم يتم اعتماد أي سعر من العميل.'); }
    finally { setOrderBusy(false); }
  }

  if (!sessionReady) return <div className="auth-shell"><div className="auth-card"><span className="eyebrow">الأغبري</span><h1>جارٍ التحقق من الجلسة</h1><p>يتم التحقق من الهوية قبل عرض بيانات المتجر.</p></div></div>;
  if (!signedIn) return <div className="auth-shell"><form className="auth-card" onSubmit={handleLogin}>
    <span className="eyebrow">بوابة الأغبري التجارية</span><h1>تسجيل الدخول</h1><p>ادخل بحسابك للوصول إلى الكتالوج والأسعار المصرح بها.</p>
    <label>البريد الإلكتروني<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
    <label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
    {authError && <div className="error-banner" role="alert">{authError}</div>}
    <button className="checkout" disabled={authBusy}>{authBusy ? 'جارٍ الدخول…' : 'دخول آمن'}</button>
  </form></div>;

  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">أ</span><div><strong>بوابة الأغبري</strong><small>للتجارة والجملة</small></div></div><nav aria-label="التنقل الرئيسي"><a className="active" href="#catalog">المنتجات</a><a href="#orders">طلباتي</a><a href="#account">حسابي</a></nav><button className="cart-button" onClick={() => document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' })}>السلة <b>{cart.length}</b></button><button className="signout" onClick={() => void handleSignOut()}>خروج</button></header>
    <main><section className="hero" id="catalog"><div><span className="eyebrow">تجارة جملة أسرع</span><h1>اطلب احتياج متجرك<br/>بخطوات بسيطة.</h1><p>الكتالوج والسعر والمخزون تأتي من الخادم بعد التحقق من هوية العميل وتصنيفه.</p></div><div className="hero-card"><span>حالة الخدمة</span><strong>{runtimeError ? 'يحتاج انتباهًا' : 'متصل'}</strong><small>{runtimeError ?? 'الأسعار المعروضة هي السعر الفعّال المصرح به لحسابك.'}</small></div></section>
      {runtimeError && <div className="error-banner" role="alert">{runtimeError}</div>}<section className="toolbar"><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو SKU..." aria-label="بحث المنتجات"/></label><div className="chips">{categories.map((item) => <button key={item} className={item === category ? 'chip selected' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div></section>
      <section className="catalog-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-image" aria-hidden="true">{product.name.slice(0, 1)}</div><div className="product-meta"><span>{product.category}</span><code>{product.sku}</code></div><h2>{product.name}</h2><p className="unit">الوحدة: {product.unit} · المتاح: {product.availableQuantity}</p><div className="product-footer"><strong>{priceFor(product) ? formatMoney(priceFor(product)) : 'السعر غير متاح'}</strong><button disabled={!priceFor(product) || product.availableQuantity < 1} onClick={() => void addToCart(product)}>أضف للسلة</button></div></article>)}{!filtered.length && <div className="empty">لا توجد أصناف متاحة لعرضها.</div>}</section>
      <section className="cart-panel" id="cart"><div className="section-heading"><div><span className="eyebrow">طلبك الحالي</span><h2>السلة</h2></div><span>{cart.length} أصناف</span></div>{!cart.length ? <div className="cart-empty">السلة فارغة. أضف الأصناف التي تريد طلبها.</div> : <><div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.product.id}><div><strong>{line.product.name}</strong><small>{formatMoney(line.unitPrice)} / {line.product.unit}</small></div><div className="quantity"><button onClick={() => void updateQuantity(line.product.id, line.quantity - 1)} aria-label="إنقاص">−</button><span>{line.quantity}</span><button onClick={() => void updateQuantity(line.product.id, line.quantity + 1)} aria-label="زيادة">+</button></div><strong>{formatMoney(line.unitPrice * line.quantity)}</strong></div>)}</div><div className="cart-total"><span>الإجمالي التقديري</span><strong>{formatMoney(total)}</strong></div><button className="checkout" disabled={orderBusy || !warehouseId || !customerId} onClick={() => void submitOrder()}>{orderBusy ? 'جارٍ اعتماد الطلب…' : 'إرسال الطلب'}</button>{orderResult && <div className="success" role="status">{orderResult}</div>}</>}</section></main><footer>بوابة الأغبري · النظام التشغيلي للتجارة</footer></div>;
}
