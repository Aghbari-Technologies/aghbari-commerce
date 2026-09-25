import { useCallback, useEffect, useMemo, useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import readXlsxFile from './lib/read-excel-file-browser';
import type { CartLine, Product, OrderStatus } from './domain/types';
import { calculateClientPreviewTotal } from './domain/order';
import { formatMoney } from './domain/pricing';
import { getCatalog, getProductImageUrls, type CatalogItem } from './services/catalog';
import { getCategories, type CategoryOption } from './services/categories';
import { getCart, removeCartItem, setCartItem } from './services/cart';
import { createOrder } from './services/orders';
import { getCustomerOrders, getCustomerOrderDetail, type CustomerOrderDetail, type CustomerOrderSummary } from './services/customerOrders';
import { applyOrderTemplate, createOrderTemplate, deleteOrderTemplate, getOrderTemplates, type OrderTemplate } from './services/orderTemplates';
import { getSession, signIn, signOut } from './services/auth';
import { supabase } from './lib/supabase';
import AdminPanel from './AdminPanel';
import ClientControlPanel from './ClientControlPanel';
import NotificationPanel from './NotificationPanel';
import OfflineRecoveryPanel from './OfflineRecoveryPanel';
import CustomerOrdersPanel from './CustomerOrdersPanel';
import RecordDetailDrawer from './RecordDetailDrawer';
import './styles.css';
import './customer-portal-v3.css';
import './ui-polish.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
const STAFF_ROLES = new Set<UserRole>(['owner', 'admin', 'sales', 'warehouse']);
const STATUS_LABELS: Record<OrderStatus, string> = { draft: 'مسودة', pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي' };
const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
const UNIT_OPTIONS = ['حبة', 'كرتون', 'طن'];

type PriceTier = { min_quantity: number; unit_price: number; currency: string };
type Finance = { currency: string; creditLimit: number; outstanding: number; available: number; entries: Array<{ id: string; reference?: string; description: string; debit: number; credit: number; due_date?: string; status: string; created_at: string }> };
import { DEFAULT_CUSTOMER_PORTAL_CONFIG, firstEnabledPaymentMethod, isPaymentMethodEnabled, validateCheckoutPolicy, type ClientUiConfig, type PaymentMethod } from './domain/customerPolicy';

function mapCatalogItem(item: CatalogItem, categoryName: string, imageUrl?: string): Product & { authorizedPrice?: number } { return { id: item.id, sku: item.sku, name: item.name, unit: item.unit, category: categoryName, description: item.description ?? undefined, availableQuantity: item.available_quantity, status: item.status === 'active' ? 'active' : 'inactive', imageUrl, authorizedPrice: item.authorized_price ?? undefined }; }
function currencyLabel(currency = 'YER') { return currency === 'YER' ? 'ر.ي' : currency; }
function statusIndex(status: OrderStatus) { return STATUS_STEPS.indexOf(status); }

export default function App() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false); const [signedIn, setSignedIn] = useState(false); const [role, setRole] = useState<UserRole>('viewer'); const [userId, setUserId] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false); const [authError, setAuthError] = useState<string | null>(null);
  const [query, setQuery] = useState(''); const [catalogSearch, setCatalogSearch] = useState(''); const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]); const [products, setProducts] = useState<Product[]>([]); const [serverPrices, setServerPrices] = useState<Record<string, number>>({}); const [priceTiers, setPriceTiers] = useState<Record<string, PriceTier[]>>({});
  const [catalogLoading, setCatalogLoading] = useState(false); const [catalogPage, setCatalogPage] = useState(1); const [catalogHasNext, setCatalogHasNext] = useState(false); const [cart, setCart] = useState<CartLine[]>([]); const [checkoutKey, setCheckoutKey] = useState<string | null>(null); const [warehouseId, setWarehouseId] = useState<string | null>(null); const [warehouseLabel, setWarehouseLabel] = useState('الفرع الرئيسي'); const [customerId, setCustomerId] = useState<string | null>(null); const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('تاجر الأغبري'); const [customerTier, setCustomerTier] = useState('wholesale'); const [orders, setOrders] = useState<CustomerOrderSummary[]>([]); const [financePage, setFinancePage] = useState(1); const [ordersLoading, setOrdersLoading] = useState(false); const [ordersError, setOrdersError] = useState<string | null>(null); const [selectedOrderDetail, setSelectedOrderDetail] = useState<CustomerOrderDetail | null>(null); const [orderDetailBusy, setOrderDetailBusy] = useState(false);
  const [finance, setFinance] = useState<Finance | null>(null); const [financeLoading, setFinanceLoading] = useState(false); const [templates, setTemplates] = useState<OrderTemplate[]>([]); const [templateName, setTemplateName] = useState('');
  const [quickOrderOpen, setQuickOrderOpen] = useState(false); const [cartOpen, setCartOpen] = useState(false); const [section, setSection] = useState<'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications'>('catalog'); const [uiConfig, setUiConfig] = useState<ClientUiConfig>(DEFAULT_CUSTOMER_PORTAL_CONFIG); const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit'); const [confirmedLines, setConfirmedLines] = useState<Record<string, boolean>>({});
  const [runtimeError, setRuntimeError] = useState<string | null>(null); const [customerNotice, setCustomerNotice] = useState<string | null>(null); const [orderBusy, setOrderBusy] = useState(false); const [orderResult, setOrderResult] = useState<string | null>(null); const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine); const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); const [detailQuantity, setDetailQuantity] = useState(1); const searchInputRef = useRef<HTMLInputElement>(null);

  const loadIdentity = useCallback(async (userId: string) => {
    if (!supabase) return;
    setUserId(userId);
    const { data: profile, error } = await supabase.from('profiles').select('customer_id, role, organization_id').eq('id', userId).single();
    if (error) throw error;
    setCustomerId(profile.customer_id); setOrganizationId(profile.organization_id ?? null); setRole((profile.role as UserRole) ?? 'viewer');
    if (profile.customer_id) {
      const { data: customer } = await supabase.from('customers').select('name,tier').eq('id', profile.customer_id).maybeSingle();
      if (customer) { setCustomerName(customer.name); setCustomerTier(String(customer.tier ?? 'wholesale')); }
      try { setTemplates(await getOrderTemplates()); } catch (error) { setTemplates([]); setRuntimeError(error instanceof Error ? error.message : 'تعذر تحميل الطلبات المحفوظة.'); }
    }
    if (profile.organization_id) {
      const { data: ui } = await supabase.from('client_ui_settings').select('config').eq('organization_id', profile.organization_id).maybeSingle();
      if (ui?.config) setUiConfig({ ...DEFAULT_CUSTOMER_PORTAL_CONFIG, ...(ui.config as Partial<ClientUiConfig>) }); else setUiConfig(DEFAULT_CUSTOMER_PORTAL_CONFIG);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getSession().then(async (currentSession) => { if (cancelled) return; setSignedIn(Boolean(currentSession)); setSessionReady(true); if (currentSession) await loadIdentity(currentSession.user.id); }).catch((error) => { if (!cancelled) { setSessionReady(true); setAuthError(error instanceof Error ? error.message : 'تعذر قراءة جلسة الدخول.'); } });
    const listener = supabase?.auth.onAuthStateChange((event, nextSession) => { if (cancelled) return; setSignedIn(Boolean(nextSession)); if (nextSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) void loadIdentity(nextSession.user.id).catch((error) => setAuthError(error instanceof Error ? error.message : 'تعذر تحميل هوية الحساب.')); else if (!nextSession) { setCustomerId(null); setOrganizationId(null); setRole('viewer'); setProducts([]); setCart([]); setOrders([]); setTemplates([]); setFinance(null); setConfirmedLines({}); setUiConfig(DEFAULT_CUSTOMER_PORTAL_CONFIG); } });
    return () => { cancelled = true; listener?.data.subscription.unsubscribe(); };
  }, [loadIdentity]);
  useEffect(() => { const on = () => setIsOnline(true); const off = () => setIsOnline(false); window.addEventListener('online', on); window.addEventListener('offline', off); return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); }; }, []);
  useEffect(() => {
    if (STAFF_ROLES.has(role)) return;
    const allowed = new Set(['catalog','orders','finance','templates','account','notifications']);
    const readHash = () => { const value = window.location.hash.replace(/^#/, ''); if (allowed.has(value)) setSection(value as typeof section); };
    readHash();
    const onNavigate = () => readHash();
    window.addEventListener('hashchange', onNavigate);
    window.addEventListener('popstate', onNavigate);
    return () => { window.removeEventListener('hashchange', onNavigate); window.removeEventListener('popstate', onNavigate); };
  }, [role]);
  useEffect(() => { if (STAFF_ROLES.has(role)) return; const hash = section; if (window.location.hash.replace(/^#/, '') !== hash) window.history.pushState(null, '', '#' + hash); }, [role, section]);
  useEffect(() => { if (!signedIn || !uiConfig.showSearch) return; const timer = window.setTimeout(() => setCatalogSearch(query.trim()), 220); return () => window.clearTimeout(timer); }, [query, signedIn, uiConfig.showSearch]);
  useEffect(() => { setCatalogPage(1); }, [catalogSearch, categoryId]);
  useEffect(() => { setFinancePage(1); }, [customerId]);
  useEffect(() => { if (!signedIn || !uiConfig.showSearch) return; const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInputRef.current?.focus(); searchInputRef.current?.select(); } if (event.key === 'Escape' && document.activeElement === searchInputRef.current) searchInputRef.current?.blur(); }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [signedIn, uiConfig.showSearch]);
  useEffect(() => { if (!signedIn) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key !== 'Escape') return; if (selectedProduct) { setSelectedProduct(null); return; } if (quickOrderOpen) { setQuickOrderOpen(false); return; } if (cartOpen) setCartOpen(false); }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [signedIn, selectedProduct, quickOrderOpen, cartOpen]);

  useEffect(() => {
    if (!signedIn || !supabase || !isOnline || STAFF_ROLES.has(role)) return; let cancelled = false;
    async function loadRuntime() {
      setCatalogLoading(true); setRuntimeError(null);
      try {
        const [{ data: warehouse, error: warehouseError }, items, savedCart, categories] = await Promise.all([
          supabase!.from('warehouses').select('id,name').eq('is_active', true).order('created_at').limit(1).maybeSingle(), getCatalog(catalogSearch, categoryId, 25, (catalogPage - 1) * 24), getCart(), getCategories()
        ]);
        if (warehouseError) throw warehouseError; if (!warehouse?.id) throw new Error('لا يوجد مستودع تشغيلي نشط.'); if (cancelled) return;
        const categoryMap = new Map(categories.map((item) => [item.id, item.name])); const imageUrls = await getProductImageUrls(items.map((item) => item.image_path));
        const mapped = items.map((item) => mapCatalogItem(item, categoryMap.get(item.category_id ?? '') ?? 'أصناف', item.image_path ? imageUrls.get(item.image_path) : undefined));
        setWarehouseId(warehouse.id); setWarehouseLabel(String(warehouse.name ?? 'الفرع الرئيسي')); setCategoryOptions(categories); setProducts(mapped.slice(0, 24)); setCatalogHasNext(items.length > 24); setServerPrices(Object.fromEntries(items.slice(0, 24).map((item) => [item.id, item.authorized_price ?? 0])));
        setCart(savedCart.map((item) => ({ product: mapped.find((product) => product.id === item.product_id) ?? { id: item.product_id, sku: item.sku, name: item.name, unit: item.unit, category: 'أصناف', availableQuantity: 0, status: 'active' }, quantity: item.quantity, unitPrice: item.authorized_price ?? 0 }))); setConfirmedLines(Object.fromEntries(savedCart.map((item) => [item.product_id, false])));
        if (customerId && items.length) { const { data: tiers } = await supabase.from('customer_price_tiers').select('product_id,min_quantity,unit_price,currency').eq('customer_id', customerId).in('product_id', items.map((item) => item.id)).order('min_quantity'); const grouped: Record<string, PriceTier[]> = {}; for (const row of tiers ?? []) (grouped[row.product_id] ??= []).push({ min_quantity: Number(row.min_quantity), unit_price: Number(row.unit_price), currency: row.currency }); if (!cancelled) setPriceTiers(grouped); }
      } catch (error) { if (!cancelled) setRuntimeError(error instanceof Error ? error.message : 'تعذر تحميل بيانات المتجر.'); }
      finally { if (!cancelled) setCatalogLoading(false); }
    }
    void loadRuntime(); return () => { cancelled = true; };
  }, [catalogSearch, categoryId, catalogPage, signedIn, isOnline, customerId, role]);

  useEffect(() => {
    const next = firstEnabledPaymentMethod(uiConfig);
    if (next && !isPaymentMethodEnabled(uiConfig, paymentMethod)) setPaymentMethod(next);
    if (!next) setRuntimeError('لا توجد وسيلة دفع متاحة لهذا المتجر.');
  }, [uiConfig, paymentMethod]);

  useEffect(() => {
    if (!signedIn || !supabase || !organizationId || STAFF_ROLES.has(role)) return;
    let cancelled = false;
    const applyConfig = (value: unknown) => {
      const config = (value && typeof value === 'object' ? value : {}) as Partial<ClientUiConfig>;
      if (!cancelled) setUiConfig((current) => ({ ...current, ...config }));
    };
    const channel = supabase.channel(`aghbari-client-ui-${organizationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_ui_settings', filter: `organization_id=eq.${organizationId}` }, (payload) => applyConfig((payload.new as { config?: unknown }).config))
      .subscribe();
    const refresh = window.setInterval(() => {
      void supabase.from('client_ui_settings').select('config').eq('organization_id', organizationId).maybeSingle()
        .then(({ data }) => { if (data?.config) applyConfig(data.config); });
    }, 60000);
    return () => { cancelled = true; window.clearInterval(refresh); void supabase.removeChannel(channel); };
  }, [signedIn, organizationId, role]);

  useEffect(() => { if (!signedIn || !isOnline || STAFF_ROLES.has(role)) return; let cancelled = false; setOrdersLoading(true); setOrdersError(null); void getCustomerOrders(30).then((items) => { if (!cancelled) setOrders(items); }).catch((error) => { if (!cancelled) setOrdersError(error instanceof Error ? error.message : 'تعذر تحميل الطلبات.'); }).finally(() => { if (!cancelled) setOrdersLoading(false); }); return () => { cancelled = true; }; }, [signedIn, isOnline, role, orderResult]);
  useEffect(() => { if (!signedIn || !customerId || !supabase || STAFF_ROLES.has(role)) return; let cancelled = false; setFinanceLoading(true); void (async () => { try { const [{ data: account, error: accountError }, { data: entries, error: entriesError }] = await Promise.all([supabase!.from('customer_credit_accounts').select('currency,credit_limit,outstanding_balance,available_credit').eq('customer_id', customerId).maybeSingle(), supabase!.from('customer_ledger_entries').select('id,reference,description,debit,credit,due_date,status,created_at').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(50)]); if (accountError || entriesError) throw accountError ?? entriesError; if (!cancelled) setFinance(account ? { currency: account.currency, creditLimit: Number(account.credit_limit), outstanding: Number(account.outstanding_balance), available: Number(account.available_credit), entries: (entries ?? []).map((e) => ({ ...e, debit: Number(e.debit), credit: Number(e.credit) })) } : null); } catch (error) { if (!cancelled) { setFinance(null); setRuntimeError(error instanceof Error ? `المركز المالي: ${error.message}` : 'تعذر تحميل المركز المالي.'); } } finally { if (!cancelled) setFinanceLoading(false); } })(); return () => { cancelled = true; }; }, [signedIn, customerId, role]);

  const categories = useMemo(() => [{ id: null, name: 'الكل' }, ...categoryOptions], [categoryOptions]);
  const priceFor = (product: Product) => serverPrices[product.id] ?? 0; const total = calculateClientPreviewTotal(cart); const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  function nextTier(product: Product, quantity: number) { return (priceTiers[product.id] ?? []).filter((tier) => tier.min_quantity > quantity).sort((a, b) => a.min_quantity - b.min_quantity)[0]; }
  function effectivePrice(product: Product, quantity = 1) { const tiers = priceTiers[product.id] ?? []; return [...tiers].sort((a, b) => b.min_quantity - a.min_quantity).find((tier) => quantity >= tier.min_quantity)?.unit_price ?? priceFor(product); }
  function savingHint(product: Product) { const quantity = cart.find((line) => line.product.id === product.id)?.quantity ?? 1; const tier = nextTier(product, quantity); return tier ? `أضف ${tier.min_quantity - quantity} ${product.unit} للوصول إلى ${formatMoney(tier.unit_price)} ${currencyLabel(tier.currency)}` : 'أنت على أفضل سعر متاح لحسابك'; }
  async function handleLogin(event: FormEvent) { event.preventDefault(); setAuthBusy(true); setAuthError(null); try { const session = await signIn(email.trim(), password); if (!session) throw new Error('تعذر إنشاء جلسة دخول صالحة.'); await loadIdentity(session.user.id); setSignedIn(true); setSessionReady(true); setPassword(''); } catch (error) { setSignedIn(false); setAuthError(error instanceof Error ? error.message : 'تعذر تسجيل الدخول.'); } finally { setAuthBusy(false); } }
  async function handleSignOut() { try { await signOut(); } finally { setUserId(null); setProducts([]); setCart([]); setOrders([]); setCustomerId(null); setRole('viewer'); setTemplates([]); setFinance(null); setUiConfig(DEFAULT_CUSTOMER_PORTAL_CONFIG); } }
  async function addToCart(product: Product, quantity = 1) { const price = effectivePrice(product, quantity); if (price <= 0 || product.availableQuantity < quantity || !isOnline) return; const existing = cart.find((line) => line.product.id === product.id); const next = Math.min((existing?.quantity ?? 0) + quantity, product.availableQuantity); try { await setCartItem(product.id, next); setCart((current) => existing ? current.map((line) => line.product.id === product.id ? { ...line, quantity: next, unitPrice: effectivePrice(product, next) } : line) : [...current, { product, quantity: next, unitPrice: price }]); setConfirmedLines((current) => ({ ...current, [product.id]: false })); setCartOpen(true); setRuntimeError(null); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحديث السلة.'); } }
  async function updateQuantity(id: string, quantity: number) { const line = cart.find((item) => item.product.id === id); if (!line) return; const next = Math.max(0, Math.min(quantity, line.product.availableQuantity)); try { if (!next) { await removeCartItem(id); setCart((c) => c.filter((item) => item.product.id !== id)); setConfirmedLines((current) => { const nextState = { ...current }; delete nextState[id]; return nextState; }); } else { await setCartItem(id, next); setCart((c) => c.map((item) => item.product.id === id ? { ...item, quantity: next, unitPrice: effectivePrice(item.product, next) } : item)); setConfirmedLines((current) => ({ ...current, [id]: false })); } } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحديث السلة.'); } }
  async function clearCart() { if (!cart.length || orderBusy) return; try { await Promise.all(cart.map((line) => removeCartItem(line.product.id))); setCart([]); setConfirmedLines({}); setRuntimeError(null); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تفريغ السلة بالكامل.'); } }
  function openProductDetail(product: Product) { setSelectedProduct(product); setDetailQuantity(Math.max(1, Math.min(cart.find((line) => line.product.id === product.id)?.quantity ?? 1, Math.max(product.availableQuantity, 1)))); }
  async function addFromProductDetail() { if (!selectedProduct) return; await addToCart(selectedProduct, detailQuantity); setSelectedProduct(null); }
  async function resolveQuickOrderIdentifier(identifier: string, quantity: number) {
    const normalized = identifier.trim();
    if (!normalized || quantity < 1 || !isOnline) return;
    const local = products.find(product => product.sku.toLocaleLowerCase() === normalized.toLocaleLowerCase());
    if (local) { await addToCart(local, quantity); return; }
    if (!warehouseId) { setRuntimeError('لا يوجد مستودع تشغيلي متاح للحساب الحالي.'); return; }
    try {
      const matches = await getCatalog(normalized, null, 6, 0, warehouseId);
      const exact = matches.find(item => item.sku.toLocaleLowerCase() === normalized.toLocaleLowerCase() || (item.barcode ?? '').toLocaleLowerCase() === normalized.toLocaleLowerCase());
      if (!exact) throw new Error('لم يتم العثور على SKU أو باركود مطابق بدقة.');
      const categoryName = categoryOptions.find(category => category.id === exact.category_id)?.name ?? 'أصناف';
      const imageUrls = exact.image_path ? await getProductImageUrls([exact.image_path]) : new Map<string,string>();
      const mapped = mapCatalogItem(exact, categoryName, exact.image_path ? imageUrls.get(exact.image_path) : undefined);
      setProducts(current => current.some(product => product.id === mapped.id) ? current.map(product => product.id === mapped.id ? mapped : product) : [mapped, ...current]);
      setServerPrices(current => ({ ...current, [mapped.id]: exact.authorized_price ?? 0 }));
      await addToCart(mapped, quantity);
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : 'تعذر العثور على الصنف المطلوب.');
    }
  }
  async function submitOrder() {
    if (!isOnline) { setRuntimeError('إرسال الطلب يحتاج اتصالًا بالإنترنت.'); return; }
    if (!customerId || !warehouseId || !cart.length || orderBusy) return;
    const policyError = validateCheckoutPolicy({
      config: uiConfig,
      paymentMethod,
      total,
      lineProductIds: cart.map((line) => line.product.id),
      confirmedProductIds: new Set(Object.entries(confirmedLines).filter(([, confirmed]) => confirmed).map(([id]) => id)),
    });
    if (policyError) { setRuntimeError(policyError); setCartOpen(true); return; }
    setOrderBusy(true); setRuntimeError(null);
    const idempotencyKey = checkoutKey ?? crypto.randomUUID();
    setCheckoutKey(idempotencyKey);
    try {
      const result = await createOrder(
        { customerId, idempotencyKey, lines: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })) },
        warehouseId,
        { paymentMethod },
      );
      setCart([]); setConfirmedLines({}); setCheckoutKey(null); setCartOpen(false);
      setOrderResult(`تم إرسال الطلب #${result.order_number} بنجاح.`); setSection('orders');
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : 'تعذر إرسال الطلب.');
    } finally { setOrderBusy(false); }
  }
  async function openOrderDetail(order: CustomerOrderSummary) { setOrderDetailBusy(true); setRuntimeError(null); try { setSelectedOrderDetail(await getCustomerOrderDetail(order.id)); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تحميل تفاصيل الطلب.'); } finally { setOrderDetailBusy(false); } }
  async function reorder(order: CustomerOrderSummary) { if (!supabase || !isOnline) return; try { const { data: items, error } = await supabase.from('order_items').select('product_id,quantity').eq('order_id', order.id); if (error) throw error; let added = 0; for (const item of items ?? []) { const product = products.find((candidate) => candidate.id === item.product_id); if (product) { await addToCart(product, Math.min(Number(item.quantity), product.availableQuantity)); added++; } } setRuntimeError(added ? `تمت إعادة إضافة ${added} أصناف من الطلب #${order.order_number}.` : 'تعذر العثور على أصناف الطلب في الكتالوج الحالي.'); if (added) setSection('catalog'); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر إعادة الطلب.'); } }
  async function saveTemplate() { if (!customerId || !cart.length || !templateName.trim()) return; try { const created = await createOrderTemplate({ name: templateName.trim(), branchLabel: warehouseLabel, lines: cart.map((line) => ({ productId: line.product.id, sku: line.product.sku, name: line.product.name, unit: line.product.unit, quantity: line.quantity })) }); setTemplates((current) => [created, ...current.filter((item) => item.id !== created.id)].slice(0, 100)); setTemplateName(''); setRuntimeError(null); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر حفظ الطلب المتكرر.'); } }
  async function applyTemplate(template: OrderTemplate) { try { if (!warehouseId) throw new Error('لا يوجد مستودع نشط متاح للحساب الحالي.'); await applyOrderTemplate(template.id, warehouseId); const savedCart = await getCart(); const mapped = savedCart.map((item) => ({ product: products.find((product) => product.id === item.product_id) ?? { id: item.product_id, sku: item.sku, name: item.name, unit: item.unit, category: 'أصناف', availableQuantity: 0, status: 'active' }, quantity: item.quantity, unitPrice: item.authorized_price ?? 0 })); setCart(mapped); setSection('catalog'); setRuntimeError(null); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر تطبيق الطلب المحفوظ.'); } }
  function downloadStatement() { if (!finance) return; const rows = [['المرجع','البيان','مدين','دائن','الاستحقاق','الحالة'], ...finance.entries.map((e) => [e.reference ?? '-', e.description, String(e.debit), String(e.credit), e.due_date ?? '-', e.status])]; const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `aghbari-statement-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url); }
  async function importExcel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (!warehouseId) throw new Error('لا يوجد مستودع تشغيلي متاح للحساب الحالي.');
      const rows = await readXlsxFile(file);
      if (rows.length > 101) throw new Error('ملف Excel يتجاوز الحد التشغيلي البالغ 100 صف بيانات.');
      const header = rows[0]?.map((x) => String(x ?? '').trim().toLowerCase()) ?? [];
      const identifierIndex = header.findIndex((x) => ['sku','barcode','الكود','كود الصنف','الباركود'].includes(x));
      const qtyIndex = header.findIndex((x) => ['quantity','qty','الكمية'].includes(x));
      if (identifierIndex < 0 || qtyIndex < 0) throw new Error('ملف Excel يجب أن يحتوي على عمود SKU/الباركود وعمود الكمية.');
      let added = 0; const unresolved: string[] = [];
      for (const row of rows.slice(1, 101)) {
        const identifier = String(row[identifierIndex] ?? '').trim(); const quantity = Number(row[qtyIndex]);
        if (!identifier || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) continue;
        let product = products.find((item) => item.sku.toLocaleLowerCase() === identifier.toLocaleLowerCase());
        if (!product) {
          const matches = await getCatalog(identifier, null, 4, 0, warehouseId);
          const exact = matches.find((item) => item.sku.toLocaleLowerCase() === identifier.toLocaleLowerCase() || (item.barcode ?? '').toLocaleLowerCase() === identifier.toLocaleLowerCase());
          if (exact) {
            const categoryName = categoryOptions.find((category) => category.id === exact.category_id)?.name ?? 'أصناف';
            const imageUrls = exact.image_path ? await getProductImageUrls([exact.image_path]) : new Map<string,string>();
            product = mapCatalogItem(exact, categoryName, exact.image_path ? imageUrls.get(exact.image_path) : undefined);
            setProducts((current) => current.some((item) => item.id === product!.id) ? current : [product!, ...current].slice(0, 24));
            setServerPrices((current) => ({ ...current, [product!.id]: exact.authorized_price ?? 0 }));
          }
        }
        if (product) {
          const boundedQuantity = Math.min(quantity, Math.max(0, product.availableQuantity));
          if (boundedQuantity > 0) { await addToCart(product, boundedQuantity); added++; }
        } else unresolved.push(identifier);
      }
      if (added > 0) {
        setCustomerNotice(unresolved.length ? `تمت مطابقة ${added} أصناف عبر الكتالوج الكانوني. لم تتم مطابقة: ${unresolved.slice(0, 5).join('،')}${unresolved.length > 5 ? ' …' : ''}.` : `تمت مطابقة ${added} أصناف وإضافتها إلى السلة عبر الكتالوج الكانوني.`);
        setRuntimeError(unresolved.length ? `تعذر مطابقة ${unresolved.length} من صفوف Excel.` : null);
      } else { setCustomerNotice(null); setRuntimeError('لم تتم مطابقة أي صنف صالح في الملف.'); }
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر قراءة ملف Excel.'); }
  }

  if (!sessionReady) return <div className="auth-shell"><div className="auth-card"><span className="eyebrow">بوابة الأغبري</span><h1>جارٍ التحقق…</h1><p>يتم التحقق من الجلسة قبل عرض بيانات المتجر.</p></div></div>;
  if (!signedIn) return <div className="auth-shell"><form className="auth-card" onSubmit={handleLogin}><span className="eyebrow">بوابة الأغبري التجارية</span><h1>دخول التاجر</h1><p>الوصول إلى الكتالوج والأسعار والطلبات المصرح بها لحسابك.</p><label>البريد الإلكتروني<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>كلمة المرور<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>{authError && <div className="error-banner">{authError}</div>}<button className="checkout" disabled={authBusy}>{authBusy ? 'جارٍ الدخول…' : 'دخول آمن'}</button></form></div>;
  if (STAFF_ROLES.has(role)) return <div className="app-shell"><AdminPanel role={role}/><ClientControlPanel role={role}/></div>;

  return <div className="customer-app" dir="rtl">
    <header className="customer-topbar"><div className="customer-brand"><span className="brand-mark">أ</span><div><strong>بوابة الأغبري التجارية</strong><small>منصة الجملة والطلبات الذكية</small></div></div>{uiConfig.showSearch ? <label className="global-search"><span aria-hidden="true">⌕</span><input ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن المنتج، SKU أو الباركود..." aria-label="بحث المنتج"/><kbd>Ctrl K</kbd></label> : <div/>}<div className="customer-actions"><button onClick={() => setSection('orders')} className="icon-action">طلباتي</button><button onClick={() => setCartOpen(true)} className="cart-action">السلة <b>{cartCount}</b></button><button onClick={() => void handleSignOut()} className="signout">خروج</button></div></header>
    {!isOnline && <div className="offline-banner">أنت دون اتصال. يمكن تعديل السلة محليًا، أما إرسال الطلب فيحتاج اتصالًا.</div>}
    <main className="customer-main">
      <section className="customer-welcome"><div><span className="eyebrow">مرحبًا، {customerName}</span><h1>احتياج متجرك<br/><em>جاهز للطلب.</em></h1><p>أسعار الجملة والمخزون والخصومات المصرح بها لحسابك في مكان واحد.</p><div className="welcome-actions">{uiConfig.showQuickOrder && <button onClick={() => setQuickOrderOpen(true)}>⚡ طلب سريع</button>}{uiConfig.showTemplates && <button className="secondary" onClick={() => setSection('templates')}>↻ إعادة طلب محفوظ</button>}</div></div>{uiConfig.showCredit && <div className="credit-mini"><span>المتاح الائتماني</span><strong>{finance ? formatMoney(finance.available) : '—'}</strong><small>{finance ? `من حد ${formatMoney(finance.creditLimit)} ${currencyLabel(finance.currency)}` : 'المعلومات المالية ستظهر بعد مزامنة المركز المالي'}</small></div>}</section>
      {orderResult && <div className="success" role="status" aria-live="polite">{orderResult}<button type="button" className="ghost" onClick={() => setOrderResult(null)}>إخفاء</button></div>}{customerNotice && <div className="success" role="status" aria-live="polite">{customerNotice}<button type="button" className="ghost" onClick={() => setCustomerNotice(null)}>إخفاء</button></div>}{runtimeError && <div className="error-banner" role="alert">{runtimeError}</div>}
      <section className="customer-nav"><button className={section === 'catalog' ? 'nav-pill active' : 'nav-pill'} onClick={() => setSection('catalog')}>الكتالوج</button><button className={section === 'orders' ? 'nav-pill active' : 'nav-pill'} onClick={() => setSection('orders')}>طلباتي <span>{orders.length}</span></button>{uiConfig.showTemplates && <button className={section === 'templates' ? 'nav-pill active' : 'nav-pill'} onClick={() => setSection('templates')}>المحفوظة</button>}<button className={section === 'account' ? 'nav-pill active' : 'nav-pill'} onClick={() => setSection('account')}>الحساب</button><button className={section === 'notifications' ? 'nav-pill active' : 'nav-pill'} onClick={() => setSection('notifications')}>التنبيهات</button>{uiConfig.showCredit && <button className={section === 'finance' ? 'nav-pill active' : 'nav-pill'} onClick={() => setSection('finance')}>المركز المالي</button>}</section>
      {section === 'catalog' && <><section className="catalog-toolbar"><div><h2>الكتالوج السريع</h2><p>ابحث بالاسم أو SKU أو الباركود، ثم أضف الكمية مباشرة.</p></div><div className="toolbar-actions">{uiConfig.showExcel && <label className="upload-button">رفع Excel<input type="file" accept=".xlsx,.xls" onChange={importExcel} hidden/></label>}{uiConfig.showQuickOrder && <button onClick={() => setQuickOrderOpen(true)}>طلب سريع</button>}</div></section>{uiConfig.showCategories && <div className="category-strip">{categories.map((item) => <button key={item.id ?? 'all'} className={item.id === categoryId ? 'category-chip active' : 'category-chip'} onClick={() => setCategoryId(item.id)}>{item.name}</button>)}</div>}<section className="product-grid" aria-busy={catalogLoading}>{catalogLoading && <div className="empty-state">جارٍ تحميل الكتالوج…</div>}{!catalogLoading && products.map((product) => { const price = effectivePrice(product); const tier = nextTier(product, 1); return <article className="b2b-product-card" key={product.id}><button type="button" className="product-card-hitarea" aria-label={`عرض تفاصيل ${product.name}`} onClick={() => openProductDetail(product)}><span className="sr-only">عرض تفاصيل المنتج</span></button><div className="product-visual">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy"/> : <span>{product.name.slice(0,1)}</span>}{uiConfig.showInventory && <span className={product.availableQuantity > 20 ? 'stock-badge good' : product.availableQuantity > 0 ? 'stock-badge low' : 'stock-badge out'}>{product.availableQuantity > 20 ? 'متوفر' : product.availableQuantity > 0 ? 'مخزون منخفض' : 'غير متوفر'}</span>}</div><div className="b2b-product-info"><div className="sku-row"><span>{product.category}</span><code>{product.sku}</code></div><h3>{product.name}</h3><p>{product.description ?? 'توريد جملة مباشر من مخزون الأغبري.'}</p><button type="button" className="product-detail-link" onClick={() => openProductDetail(product)}>التفاصيل الكاملة ←</button><div className="unit-row">{UNIT_OPTIONS.map((unit) => <span key={unit} className={product.unit === unit ? 'unit-tag active' : 'unit-tag'}>{unit}</span>)}</div><div className="price-row"><div><small>سعر حسابك</small><strong>{price > 0 ? `${formatMoney(price)} ${currencyLabel()}` : 'غير متاح'}</strong></div><button disabled={price <= 0 || product.availableQuantity < 1 || !isOnline} onClick={() => void addToCart(product)}>+ إضافة</button></div>{uiConfig.showTieredPricing && (priceTiers[product.id]?.length ?? 0) > 0 && <div className="tier-list" aria-label="شرائح الأسعار">{(priceTiers[product.id] ?? []).slice(0, 4).map((item) => <span key={item.min_quantity}>{item.min_quantity}+ · {formatMoney(item.unit_price)} {currencyLabel(item.currency)}</span>)}</div>}{uiConfig.showSavingsCalculator && tier && <div className="tier-hint">✦ {savingHint(product)}</div>}</div></article>; })}{!catalogLoading && !products.length && <div className="empty-state">لا توجد أصناف مطابقة للبحث الحالي.</div>}</section><div className="catalog-pagination" aria-label="صفحات الكتالوج"><span>صفحة {catalogPage}{catalogHasNext ? '' : ' · الأخيرة'}</span><div><button type="button" className="ghost" onClick={() => setCatalogPage((page) => Math.max(1, page - 1))} disabled={catalogLoading || catalogPage === 1}>السابق</button><button type="button" className="ghost" onClick={() => setCatalogPage((page) => page + 1)} disabled={catalogLoading || !catalogHasNext}>التالي</button></div></div></>}
      {section === 'orders' && <CustomerOrdersPanel orders={orders} loading={ordersLoading} detailBusy={orderDetailBusy} productsCount={products.length} onOpenDetail={(order) => void openOrderDetail(order)} onReorder={(order) => void reorder(order)} onReload={() => { void getCustomerOrders(30).then(setOrders).catch((error) => setOrdersError(error instanceof Error ? error.message : 'تعذر تحميل الطلبات.')); }} />}
      {selectedOrderDetail && <RecordDetailDrawer eyebrow="Customer Orders" title={`طلب #${selectedOrderDetail.order_number}`} summary={`${selectedOrderDetail.statusLabel} · ${selectedOrderDetail.total.toLocaleString('ar-YE')} ${currencyLabel(selectedOrderDetail.currency)}`} fields={[{label:'الحالة',value:selectedOrderDetail.statusLabel},{label:'رقم الطلب',value:selectedOrderDetail.order_number},{label:'التاريخ',value:new Date(selectedOrderDetail.created_at).toLocaleString('ar-YE')},{label:'الإجمالي',value:`${selectedOrderDetail.total.toLocaleString('ar-YE')} ${currencyLabel(selectedOrderDetail.currency)}`},{label:'عدد الأصناف',value:selectedOrderDetail.items.length},{label:'المعرّف',value:selectedOrderDetail.id},{label:'التتبع',value:<div className="record-detail-timeline">{selectedOrderDetail.timeline.map(step=><div className={step.active?'is-active':''} key={step.status}><span>{step.active?'✓':'•'}</span><strong>{step.label}</strong></div>)}</div>,wide:true},{label:'الأصناف',value:<div className="record-detail-lines">{selectedOrderDetail.items.map(item=><div key={item.id}><span>{item.name} · {item.sku}</span><strong>{item.quantity} {item.unit} · {item.line_total.toLocaleString('ar-YE')} {currencyLabel(item.currency)}</strong></div>)}</div>,wide:true}]} onClose={()=>setSelectedOrderDetail(null)} />}
      {section === 'templates' && uiConfig.showTemplates && <section className="content-card"><div className="section-title"><div><span className="eyebrow">طلباتك المتكررة</span><h2>الطلبات المحفوظة</h2></div><button onClick={() => setSection('catalog')}>+ أنشئ من السلة</button></div>{templates.length ? <div className="template-grid">{templates.map((template) => <article className="template-card" key={template.id}><span className="template-icon">▦</span><h3>{template.name}</h3><small>{template.lines.length} أصناف · {template.branchLabel}</small><div><button onClick={() => void applyTemplate(template)}>إعادة الطلب</button><button className="ghost" onClick={() => { void (async () => { try { await deleteOrderTemplate(template.id); setTemplates((current) => current.filter((item) => item.id !== template.id)); setRuntimeError(null); } catch (error) { setRuntimeError(error instanceof Error ? error.message : 'تعذر حذف الطلب المحفوظ.'); } })(); }}>حذف</button></div></article>)}</div> : <div className="empty-state">لا توجد طلبات محفوظة. أضف أصنافًا إلى السلة ثم احفظها كقائمة إعادة طلب.</div>}<div className="template-save"><input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="اسم قائمة إعادة الطلب"/><button disabled={!templateName.trim() || !cart.length} onClick={() => void saveTemplate()}>حفظ السلة كقائمة</button></div></section>}
      {section === 'account' && <section className="content-card customer-account-surface"><div className="section-title"><div><span className="eyebrow">الحساب</span><h2>ملف التاجر والتشغيل</h2><p>معلومات الحساب والاختصارات المرتبطة بالسياق الحالي.</p></div><span>{isOnline ? 'متصل' : 'دون اتصال'}</span></div><div className="account-summary-grid"><article><small>اسم الحساب</small><strong>{customerName}</strong><span>حساب B2B</span></article><article><small>الفئة</small><strong>{customerTier === 'wholesale' ? 'جملة' : customerTier}</strong><span>تحدد قواعد التسعير</span></article><article><small>الطلبات</small><strong>{orders.length.toLocaleString('ar')}</strong><span>سجل الحساب المحمل</span></article><article><small>السلة</small><strong>{cartCount.toLocaleString('ar')}</strong><span>وحدات حالية</span></article></div><div className="account-shortcuts"><button type="button" onClick={() => setSection('catalog')}>العودة للكتالوج</button><button type="button" onClick={() => setCartOpen(true)}>فتح السلة ({cartCount})</button><button type="button" onClick={() => setSection('orders')}>متابعة الطلبات ({orders.length})</button>{uiConfig.showCredit && <button type="button" onClick={() => setSection('finance')}>المركز المالي</button>}</div><div className="customer-section-context"><div><span className="eyebrow">مركز الاسترداد</span><strong>المزامنة المحلية</strong><small>أي تعارضات أو فشل نهائي تظهر أسفل الحساب.</small></div></div><OfflineRecoveryPanel userId={userId}/></section>}
      {section === 'notifications' && <NotificationPanel audience="customer" />}
      {section === 'finance' && uiConfig.showCredit && <section className="content-card"><div className="section-title"><div><span className="eyebrow">الثقة المالية</span><h2>المركز المالي</h2></div><button onClick={downloadStatement} disabled={!finance}>تنزيل الكشف</button></div>{financeLoading ? <div className="empty-state">جارٍ تحميل المركز المالي…</div> : <>{finance ? <><div className="finance-grid"><div><small>الحد الائتماني</small><strong>{formatMoney(finance.creditLimit)} {currencyLabel(finance.currency)}</strong></div><div><small>الرصيد المستحق</small><strong>{formatMoney(finance.outstanding)} {currencyLabel(finance.currency)}</strong></div><div><small>المتاح للشراء</small><strong>{formatMoney(finance.available)} {currencyLabel(finance.currency)}</strong></div></div><div className="ledger-table">{finance.entries.slice((financePage - 1) * 10, financePage * 10).map((entry) => <div className="ledger-row" key={entry.id}><span>{entry.reference ?? '—'}</span><strong>{entry.description}</strong><span>{entry.debit ? `مدين ${formatMoney(entry.debit)}` : `دائن ${formatMoney(entry.credit)}`}</span><span>{entry.due_date ?? '—'}</span><span className={`status status-${entry.status}`}>{entry.status === 'overdue' ? 'متأخر' : entry.status === 'paid' ? 'مسدد' : 'مفتوح'}</span></div>)}</div><div className="directory-pagination" aria-label="صفحات كشف الحساب"><span>صفحة {financePage} / {Math.max(1, Math.ceil(finance.entries.length / 10))} · {finance.entries.length} حركة</span><div><button type="button" className="ghost" onClick={() => setFinancePage((page) => Math.max(1, page - 1))} disabled={financePage === 1}>السابق</button><button type="button" className="ghost" onClick={() => setFinancePage((page) => Math.min(Math.max(1, Math.ceil(finance.entries.length / 10)), page + 1))} disabled={financePage >= Math.max(1, Math.ceil(finance.entries.length / 10))}>التالي</button></div></div></> : <div className="empty-state">لا توجد بيانات مركز مالي متاحة لحسابك حاليًا.</div>}</>}</section>}
    </main>
    {quickOrderOpen && uiConfig.showQuickOrder && <div className="modal-backdrop" onClick={() => setQuickOrderOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-label="الطلب السريع" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Quick Order</span><h2>الطلب السريع</h2></div><button onClick={() => setQuickOrderOpen(false)}>×</button></div><p>أدخل SKU والكمية لإضافة أصناف كثيرة بسرعة.</p><QuickOrderEditor products={products} onAdd={addToCart} onResolveIdentifier={resolveQuickOrderIdentifier} onClose={() => setQuickOrderOpen(false)}/></section></div>}
    {selectedProduct && <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}><section className="modal product-detail-modal" role="dialog" aria-modal="true" aria-label={`تفاصيل ${selectedProduct.name}`} onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">تفاصيل المنتج</span><h2>{selectedProduct.name}</h2></div><button type="button" aria-label="إغلاق التفاصيل" onClick={() => setSelectedProduct(null)}>×</button></div><div className="product-detail-shell"><div className="product-detail-visual">{selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt="" /> : <span>{selectedProduct.name.slice(0,1)}</span>}<div className={selectedProduct.availableQuantity > 20 ? 'stock-badge good' : selectedProduct.availableQuantity > 0 ? 'stock-badge low' : 'stock-badge out'}>{selectedProduct.availableQuantity > 20 ? 'متوفر' : selectedProduct.availableQuantity > 0 ? `متبقي ${selectedProduct.availableQuantity}` : 'غير متوفر'}</div></div><div className="product-detail-copy"><div className="product-detail-meta"><span>{selectedProduct.category}</span><code>{selectedProduct.sku}</code></div><p>{selectedProduct.description ?? 'توريد جملة مباشر من مخزون الأغبري.'}</p><div className="product-detail-facts"><div><small>الوحدة</small><strong>{selectedProduct.unit}</strong></div><div><small>سعر الحساب</small><strong>{priceFor(selectedProduct) > 0 ? `${formatMoney(effectivePrice(selectedProduct, detailQuantity))} ${currencyLabel()}` : 'غير متاح'}</strong></div><div><small>المتاح</small><strong>{selectedProduct.availableQuantity.toLocaleString('ar')}</strong></div><div><small>الطلب الحالي</small><strong>{cart.find((line) => line.product.id === selectedProduct.id)?.quantity ?? 0}</strong></div></div>{uiConfig.showTieredPricing && (priceTiers[selectedProduct.id]?.length ?? 0) > 0 && <div className="detail-tier-list"><strong>شرائح السعر المصرح بها</strong>{(priceTiers[selectedProduct.id] ?? []).map((tier) => <span key={tier.min_quantity}>{tier.min_quantity}+ · {formatMoney(tier.unit_price)} {currencyLabel(tier.currency)}</span>)}</div>}<div className="detail-quantity"><label>الكمية<input type="number" min="1" max={Math.max(1, selectedProduct.availableQuantity)} step="1" value={detailQuantity} onChange={(e) => setDetailQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, selectedProduct.availableQuantity)))} disabled={selectedProduct.availableQuantity < 1} /></label><div><small>الإجمالي التقريبي</small><strong>{formatMoney(effectivePrice(selectedProduct, detailQuantity) * detailQuantity)} {currencyLabel()}</strong></div></div><button className="checkout" type="button" disabled={!isOnline || selectedProduct.availableQuantity < 1 || priceFor(selectedProduct) <= 0} onClick={() => void addFromProductDetail()}>{selectedProduct.availableQuantity < 1 ? 'غير متوفر' : 'إضافة إلى السلة'}</button></div></div></section></div>}
{cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="سلة الشراء" onClick={(e) => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">سلة الشراء</span><h2>{cartCount} وحدة</h2><small>{cart.length} أصناف · {isOnline ? 'متاحة للمزامنة' : 'محلية حتى عودة الاتصال'}</small></div><div className="drawer-head-actions"><button className="ghost" type="button" onClick={() => void clearCart()} disabled={!cart.length || orderBusy}>تفريغ</button><button type="button" aria-label="إغلاق السلة" onClick={() => setCartOpen(false)}>×</button></div></div>{!cart.length ? <div className="empty-state">السلة فارغة.</div> : <>{cart.map((line) => <div className="drawer-line" key={line.product.id}><div><strong>{line.product.name}</strong><small>{formatMoney(line.unitPrice)} / {line.product.unit}</small></div><div className="quantity"><button onClick={() => void updateQuantity(line.product.id, line.quantity - 1)}>−</button><span>{line.quantity}</span><button onClick={() => void updateQuantity(line.product.id, line.quantity + 1)}>+</button></div><strong>{formatMoney(line.unitPrice * line.quantity)}</strong></div>)}<div className="drawer-total"><span>الإجمالي</span><strong>{formatMoney(total)} ر.ي</strong></div>
{uiConfig.showPaymentMethods && <div className="checkout-block"><strong>طريقة الدفع</strong><div className="payment-methods" role="radiogroup" aria-label="طريقة الدفع">
{([['credit','آجل / ائتمان',uiConfig.paymentOnCredit],['cash','نقدي',uiConfig.paymentCash],['transfer','حوالة',uiConfig.paymentTransfer]] as Array<[PaymentMethod,string,boolean]>).filter(([, , enabled]) => enabled).map(([method,label]) => <label className="payment-option" key={method}><input type="radio" name="payment-method" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)}/><span>{label}</span></label>)}
</div></div>}
{uiConfig.requireQuantityConfirmation && <div className="checkout-block"><strong>تأكيد الكميات</strong><div className="quantity-confirmation-list">
{cart.map((line) => <label className="quantity-confirmation" key={line.product.id}><input type="checkbox" checked={Boolean(confirmedLines[line.product.id])} onChange={(e) => setConfirmedLines((current) => ({ ...current, [line.product.id]: e.target.checked }))}/><span>أؤكد طلب <b>{line.quantity}</b> من {line.product.name}</span></label>)}
</div></div>}{uiConfig.showTemplates && <label className="template-inline"><input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="اسم قائمة إعادة الطلب (اختياري)"/><button disabled={!templateName.trim()} onClick={() => void saveTemplate()}>حفظ</button></label>}<div className="checkout-readiness" aria-live="polite"><div><span>الأصناف المؤكدة</span><strong>{Object.values(confirmedLines).filter(Boolean).length} / {cart.length}</strong></div><div><span>الحالة الشبكية</span><strong>{isOnline ? 'متصل' : 'دون اتصال'}</strong></div><div><span>طريقة الدفع</span><strong>{paymentMethod === 'credit' ? 'ائتمان' : paymentMethod === 'cash' ? 'نقدي' : paymentMethod === 'transfer' ? 'حوالة' : 'بطاقة'}</strong></div></div><button className="checkout" disabled={orderBusy || !customerId || !warehouseId || !isOnline} onClick={() => void submitOrder()}>{orderBusy ? 'جارٍ اعتماد الطلب…' : 'تأكيد وإرسال الطلب'}</button></>}</aside></div>}
    <footer className="customer-footer"><span>بوابة الأغبري التجارية</span><span>حساب {customerTier === 'wholesale' ? 'جملة' : customerTier}</span><span>{isOnline ? '● متصل' : '○ دون اتصال'}</span></footer>
  </div>;
}

function QuickOrderEditor({ products, onAdd, onResolveIdentifier, onClose }: { products: Product[]; onAdd: (product: Product, quantity?: number) => Promise<void>; onResolveIdentifier: (identifier: string, quantity: number) => Promise<void>; onClose: () => void }) {
  const [rows, setRows] = useState([{ sku: '', quantity: 1 }]); const [busyIndex, setBusyIndex] = useState<number | null>(null);
  async function resolve(index: number) { const row = rows[index]; if (!row.sku.trim() || !Number.isSafeInteger(row.quantity) || row.quantity < 1 || row.quantity > 100000) return; setBusyIndex(index); try { await onResolveIdentifier(row.sku, row.quantity); } finally { setBusyIndex(null); } }
  const canAddRow = rows.length < 100;
  return <div className="quick-editor" aria-label="محرر الطلب السريع">{rows.map((row, index) => <div className="quick-row" key={index}>
    <label><span className="sr-only">SKU أو باركود للسطر {index + 1}</span><input value={row.sku} onChange={(e) => setRows((current) => current.map((item, i) => i === index ? { ...item, sku: e.target.value } : item))} placeholder="SKU أو باركود"/></label>
    <label><span className="sr-only">الكمية للسطر {index + 1}</span><input type="number" min="1" max="100000" value={row.quantity} onChange={(e) => setRows((current) => current.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))}/></label>
    <button type="button" disabled={busyIndex===index || !row.sku.trim() || !Number.isSafeInteger(row.quantity) || row.quantity < 1 || row.quantity > 100000} onClick={() => void resolve(index)}>{busyIndex===index?'جارٍ البحث…':'إضافة'}</button>
    {rows.length > 1 && <button type="button" className="ghost quick-row-remove" onClick={() => setRows((current) => current.filter((_, i) => i !== index))} disabled={busyIndex !== null}>حذف</button>}
  </div>)}<div className="quick-actions"><button type="button" className="ghost" onClick={() => canAddRow && setRows((current) => [...current, { sku: '', quantity: 1 }])} disabled={!canAddRow}>+ سطر {rows.length}/100</button><button type="button" onClick={onClose}>تم</button></div></div>;
}