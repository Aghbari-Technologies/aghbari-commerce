import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CartLine, Product, OrderStatus } from './domain/types';
import { calculateClientPreviewTotal } from './domain/order';
import { formatMoney } from './domain/pricing';
import { getCatalog, getProductImageUrls, type CatalogItem } from './services/catalog';
import { getCategories, type CategoryOption } from './services/categories';
import { getCart, removeCartItem, setCartItem } from './services/cart';
import { createOrder } from './services/orders';
import { getCustomerOrders, type CustomerOrderSummary } from './services/customerOrders';
import { getSession, signIn, signOut } from './services/auth';
import { supabase } from './lib/supabase';
import AdminPanel from './AdminPanel';
import './styles.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
const STAFF_ROLES = new Set<UserRole>(['owner', 'admin', 'sales', 'warehouse']);
const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'مسودة', pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي'
};

function mapCatalogItem(item: CatalogItem, categoryName: string, imageUrl?: string): Product & { authorizedPrice?: number } {
  return { id: item.id, sku: item.sku, name: item.name, unit: item.unit, category: categoryName, description: item.description ?? undefined, availableQuantity: item.available_quantity, status: item.status === 'active' ? 'active' : 'inactive', imageUrl, authorizedPrice: item.authorized_price ?? undefined };
}

export default function App() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false); const [signedIn, setSignedIn] = useState(false); const [role, setRole] = useState<UserRole>('viewer');
  const [authBusy, setAuthBusy] = useState(false); const [authError, setAuthError] = useState<string | null>(null);
  const [query, setQuery] = useState(''); const [catalogSearch, setCatalogSearch] = useState(''); const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]); const [products, setProducts] = useState<Product[]>([]); const [serverPrices, setServerPrices] = useState<Record<string, number>>({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]); const [checkoutKey, setCheckoutKey] = useState<string | null>(null); const [warehouseId, setWarehouseId] = useState<string | null>(null); const [customerId, setCustomerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]); const [ordersLoading, setOrdersLoading] = useState(false); const [ordersError, setOrdersError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null); const [orderBusy, setOrderBusy] = useState(false); const [orderResult, setOrderResult] = useState<string | null>(null);

  async function loadIdentity(userId: string) {
    if (!supabase) return;
    const { data: profile, error } = await supabase.from('profiles').select('customer_id, role').eq('id', userId).single();
    if (error) throw error;
    setCustomerId(profile.customer_id); setRole((profile.role as UserRole) ?? 'viewer');
  }

  useEffect(() => {
    let cancelled = false;
    void getSession().then(async (currentSession) => {
      if (cancelled) return;
      setSignedIn(Boolean(currentSession)); setSessionReady(true);
      if (currentSession) await loadIdentity(currentSession.user.id);
    }).catch((error) => {
      if (!cancelled) { setSessionReady(true); setAuthError(error instanceof Error ? error.message : 'تعذر قراءة جلسة الدخول.'); }
    });
    const listener = supabase?.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;
      setSignedIn(Boolean(nextSession));
      if (nextSession) {
        setAuthError(null);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          void loadIdentity(nextSession.user.id).catch((error) => setAuthError(error instanceof Error ? error.message : 'تعذر تحميل هوية الحساب.'));
        }
      } else {
        setCustomerId(null); setRole('viewer'); setOrders([]); setWarehouseId(null); setProducts([]); setCart([]); setServerPrices({}); setCheckoutKey(null);
      }
    });
    return () => { cancelled = true; listener?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    const timer = window.setTimeout(() => setCatalogSearch(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query, signedIn]);

  useEffect(() => {
    if (!signedIn || !supabase) return; let cancelled = false;
    async function loadRuntime() {
      setCatalogLoading(true); setRuntimeError(null);
      try {
        const [{ data: warehouse, error: warehouseError }, items, savedCart, categories] = await Promise.all([
          supabase.from('warehouses').select('id').eq('is_active', true).order('created_at').limit(1).maybeSingle(),
          getCatalog(catalogSearch, categoryId, 100, 0), getCart(), getCategories()
        ]);
        if (warehouseError) throw warehouseError;
        if (!warehouse?.id) throw new Error('لا يوجد مستودع تشغيلي نشط.');
        if (cancelled) return;
        const categoryMap = new Map(categories.map((item) => [item.id, item.name]));
        const imageUrls = await getProductImageUrls(items.map((item) => item.image_path));
        if (cancelled) return;
        setWarehouseId(warehouse.id); setCategoryOptions(categories);
        const mapped = items.map((item) => mapCatalogItem(item, categoryMap.get(item.category_id ?? '') ?? 'أصناف', item.image_path ? imageUrls.get(item.image_path) : undefined));
        setProducts(mapped); setServerPrices(Object.fromEntries(items.map((item) => [item.id, item.authorized_price ?? 0])));
        setCart(savedCart.map((item) => ({ product: mapped.find((product) => product.id === item.product_id) ?? { id: item.product_id, sku: item.sku, name: item.name, unit: item.unit, category: 'أصناف', availableQuantity: 0, status: 'active' }, quantity: item.quantity, unitPrice: item.authorized_price ?? 0 })));
      } catch (error) {
        if (!cancelled) setRuntimeError(error instanceof Error ? error.message : 'تعذر تحميل بيانات المتجر.');
      } finally { if (!cancelled) setCatalogLoading(false); }
    }
    void loadRuntime(); return () => { cancelled = true; };
  }, [catalogSearch, categoryId, signedIn]);

  useEffect(() => {
    if (!signedIn) return; let cancelled = false;
    setOrdersLoading(true); setOrdersError(null);
    void getCustomerOrders(20).then((items) => { if (!cancelled) setOrders(items); }).catch((error) => { if (!cancelled) setOrdersError(error instanceof Error ? error.message : 'تعذر تحميل الطلبات.'); }).finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, [signedIn, orderResult]);

  const categories = useMemo(() => [{ id: null, name: 'الكل' }, ...categoryOptions], [categoryOptions]);
  const priceFor = (product: Product) => serverPrices[product.id] ?? 0;
  const total = calculateClientPreviewTotal(cart);

  async function handleLogin(event: FormEvent) {
    event.preventDefault(); setAuthBusy(true); setAuthError(null);
    try { const session = await signIn(email.trim(), password); if (session) await loadIdentity(session.user.id); setPassword(''); }
    catch (error) { setAuthError(error instanceof Error ? error.message : 'تعذر تسجيل الدخول.'); }
    finally { setAuthBusy(false); }
  }

  async function handleSignOut() {
    try { await signOut(); }
    finally { setProducts([]); setCart([]); setOrders([]); setCustomerId(null); setWarehouseId(null); setRole('viewer'); setCheckoutKey(null); setOrderResult(null); }
  }

  async function addToCart(product: Product) {
    const price = priceFor(product);
    if (price <= 0 || product.availableQuantity < 1) return;
    const existing = cart.find((line) => line.product.id === product.id);
    const quantity = Math.min((existing?.quantity ?? 0) + 1, product.availableQuantity);
    try {
      await setCartItem(product.id, quantity);
      setCart((current) => existing ? current.map((line) => line.product.id === product.id ? { ...line, quantity } : line) : [...current, { product, quantity, unitPrice: price }]);
      setCheckoutKey(null); setOrderResult(null); setRuntimeError(null);
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحديث السلة.'); }
  }

  async function updateQuantity(id: string, quantity: number) {
    const line = cart.find((item) => item.product.id === id); if (!line) return;
    const next = Math.max(0, Math.min(quantity, line.product.availableQuantity));
    try {
      if (next === 0) { await removeCartItem(id); setCart((current) => current.filter((item) => item.product.id !== id)); }
      else { await setCartItem(id, next); setCart((current) => current.map((item) => item.product.id === id ? { ...item, quantity: next } : item)); }
      setCheckoutKey(null); setRuntimeError(null);
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحديث الكمية.'); }
  }

  async function submitOrder() {
    if (!customerId || !warehouseId || !cart.length || orderBusy) return;
    setOrderBusy(true); setOrderResult(null); setRuntimeError(null);
    const idempotencyKey = checkoutKey ?? crypto.randomUUID();
    setCheckoutKey(idempotencyKey);
    try {
      const result = await createOrder({ customerId, idempotencyKey, lines: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })) }, warehouseId);
      setCart([]); setCheckoutKey(null); setOrderResult(result ? `تم إرسال الطلب رقم ${result.order_number} بنجاح.` : 'تم إرسال الطلب بنجاح.');
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر إرسال الطلب. لم يتم اعتماد أي سعر من العميل.'); }
    finally { setOrderBusy(false); }
  }

  if (!sessionReady) return <div className="auth-shell"><div className="auth-card"><span className="eyebrow">الأغبري</span><h1>جارٍ التحقق من الجلسة</h1><p>يتم التحقق من الهوية قبل عرض بيانات المتجر.</p></div></div>;
  if (!signedIn) return <div className="auth-shell"><form className="auth-card" onSubmit={handleLogin}><span className="eyebrow">بوابة الأغبري التجارية</span><h1>تسجيل الدخول</h1><p>ادخل بحسابك للوصول إلى الكتالوج والأسعار المصرح بها.</p><label>البريد الإلكتروني<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{authError && <div className="error-banner" role="alert">{authError}</div>}<button className="checkout" disabled={authBusy}>{authBusy ? 'جارٍ الدخول…' : 'دخول آمن'}</button></form></div>;

  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">أ</span><div><strong>بوابة الأغبري</strong><small>للتجارة والجملة</small></div></div><nav aria-label="التنقل الرئيسي"><a className="active" href="#catalog">المنتجات</a>{STAFF_ROLES.has(role) && <a href="#account">مركز التحكم</a>}<a href="#orders">طلباتي</a></nav><button className="cart-button" aria-label={`السلة، ${cart.length} أصناف`} onClick={() => document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' })}>السلة <b>{cart.length}</b></button><button className="signout" onClick={() => void handleSignOut()}>خروج</button></header>
    <main><section className="hero" id="catalog"><div><span className="eyebrow">تجارة جملة أسرع</span><h1>اطلب احتياج متجرك<br/>بخطوات بسيطة.</h1><p>الكتالوج والسعر والمخزون تأتي من الخادم بعد التحقق من هوية العميل وتصنيفه.</p></div><div className="hero-card"><span>حالة الخدمة</span><strong>{runtimeError ? 'يحتاج انتباهًا' : 'متصل'}</strong><small>{runtimeError ?? 'الأسعار المعروضة هي السعر الفعّال المصرح به لحسابك.'}</small></div></section>
      {runtimeError && <div className="error-banner" role="alert">{runtimeError}</div>}
      <section className="toolbar"><label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو SKU..." aria-label="بحث المنتجات" /></label><div className="chips" aria-label="تصنيف المنتجات">{categories.map((item) => <button key={item.id ?? 'all'} className={item.id === categoryId ? 'chip selected' : 'chip'} onClick={() => setCategoryId(item.id)}>{item.name}</button>)}</div></section>
      <section className="catalog-grid" aria-busy={catalogLoading}>{catalogLoading && <div className="empty">جارٍ تحميل المنتجات…</div>}{!catalogLoading && products.map((product) => <article className="product-card" key={product.id}><div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <span aria-hidden="true">{product.name.slice(0, 1)}</span>}</div><div className="product-meta"><span>{product.category}</span><code>{product.sku}</code></div><h2>{product.name}</h2><p className="unit">الوحدة: {product.unit} · المتاح: {product.availableQuantity}</p><div className="product-footer"><strong>{priceFor(product) ? formatMoney(priceFor(product)) : 'السعر غير متاح'}</strong><button disabled={!priceFor(product) || product.availableQuantity < 1} onClick={() => void addToCart(product)}>أضف للسلة</button></div></article>)}{!catalogLoading && !products.length && <div className="empty">لا توجد أصناف متاحة لعرضها.</div>}</section>
      <section className="cart-panel" id="cart"><div className="section-heading"><div><span className="eyebrow">طلبك الحالي</span><h2>السلة</h2></div><span>{cart.length} أصناف</span></div>{!cart.length ? <div className="cart-empty">السلة فارغة. أضف الأصناف التي تريد طلبها.</div> : <><div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.product.id}><div><strong>{line.product.name}</strong><small>{formatMoney(line.unitPrice)} / {line.product.unit}</small></div><div className="quantity"><button onClick={() => void updateQuantity(line.product.id, line.quantity - 1)} aria-label={`إنقاص ${line.product.name}`}>−</button><span aria-live="polite">{line.quantity}</span><button onClick={() => void updateQuantity(line.product.id, line.quantity + 1)} aria-label={`زيادة ${line.product.name}`}>+</button></div><strong>{formatMoney(line.unitPrice * line.quantity)}</strong></div>)}</div><div className="cart-total"><span>الإجمالي التقديري</span><strong>{formatMoney(total)}</strong></div><button className="checkout" disabled={orderBusy || !warehouseId || !customerId} onClick={() => void submitOrder()}>{orderBusy ? 'جارٍ اعتماد الطلب…' : 'إرسال الطلب'}</button>{orderResult && <div className="success" role="status">{orderResult}</div>}</>}</section>
      <section className="cart-panel" id="orders"><div className="section-heading"><div><span className="eyebrow">المتابعة</span><h2>طلباتي</h2></div><span>{orders.length} طلبات حديثة</span></div>{ordersLoading ? <div className="cart-empty">جارٍ تحميل الطلبات…</div> : ordersError ? <div className="error-banner" role="alert">{ordersError}</div> : !orders.length ? <div className="cart-empty">لا توجد طلبات سابقة بعد.</div> : <div className="cart-lines">{orders.map((order) => <article className="cart-line" key={order.id}><div><strong>طلب #{order.order_number}</strong><small>{new Date(order.created_at).toLocaleString('ar-YE')} · {STATUS_LABELS[order.status]}</small></div><strong>{formatMoney(order.total)} {order.currency}</strong></article>)}</div>}</section>
      {STAFF_ROLES.has(role) && <AdminPanel role={role} />}</main><footer>بوابة الأغبري · النظام التشغيلي للتجارة</footer></div>;
}
