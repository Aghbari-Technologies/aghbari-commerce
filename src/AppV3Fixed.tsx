import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import readXlsxFile from './lib/read-excel-file-browser';
import type { CartLine, Product } from './domain/types';
import { resolveAuthenticatedSurface } from './domain/sessionRoute';
import { normalizePortalAccentColor } from './domain/customerPolicy';
import { calculateClientPreviewTotal, MAX_ORDER_QUANTITY_PER_LINE } from './domain/order';
import { effectiveCatalogPrice, formatMoney } from './domain/pricing';
import { getCatalog, getProductImageUrls, type CatalogItem } from './services/catalog';
import { getCategories, type CategoryOption } from './services/categories';
import { getCart, removeCartItem, setCartItem, syncOfflineCart } from './services/cart';
import { createOrder } from './services/orders';
import { applyQuickOrder } from './services/quickOrder';
import { getCustomerOrderDetail, type CustomerOrderDetail, type CustomerOrderSummary } from './services/customerOrders';
import { friendlyAuthError, getSession, resetPassword, signIn, signOut } from './services/auth';
import { createOrderTemplate, deleteOrderTemplate, getOrderTemplates, applyOrderTemplate, type OrderTemplate } from './services/orderTemplates';
import { filterAndSortTemplates, paginateTemplates, type TemplateViewSort } from './customer-template-view';
import type { CustomerStructureItem } from './structure/customer-structure';
import { supabase } from './lib/supabase';
const AdminPanel = lazy(() => import('./AdminPanel'));
import CustomerHomeWorkspace from './CustomerHomeWorkspace';
import CustomerOrdersPanel from './CustomerOrdersPanel';
import CustomerFinancePanel from './CustomerFinancePanel';
import CustomerAccountWorkspace from './CustomerAccountWorkspace';
import './customer-account-workspace.css';
import './customer-orders.css';
import NotificationPanel from './NotificationPanel';
import OperationalTruthStrip from './OperationalTruthStrip';
import WorkspaceSurfaceRail from './WorkspaceSurfaceRail';
import OperationalLoadingSkeleton from './OperationalLoadingSkeleton';
import './styles.css';
import './customer-portal-v3.css';
import './customer-portal-v3-dynamic.css';
import './customer-account-catalog.css';
import './ui-marketplace-elite.css';
import CustomerCommandPalette from './CustomerCommandPalette';
import ProductCompareTray from './ProductCompareTray';
import CustomerCartReadiness from './CustomerCartReadiness';
import CustomerSavedShelf from './CustomerSavedShelf';
import PwaInstallPrompt from './PwaInstallPrompt';
import { MAX_RECENT_SEARCHES, normalizeSavedIds, pushRecentSearch, pushRecentlyViewed, toggleSavedProduct } from './customer-saved-view';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer' | 'customer';
type PortalSection = 'home' | 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications';
const PORTAL_SECTION_META: Record<PortalSection,{label:string;eyebrow:string;hint:string}> = { home:{label:'الرئيسية',eyebrow:'مساحة التاجر',hint:'ملخص الحساب والوضع التشغيلي والاختصارات إلى الإجراء التالي.'}, catalog:{label:'الكتالوج',eyebrow:'التسوق',hint:'اكتشف الأصناف والأسعار والمخزون ثم أضف الكميات مباشرة.'}, orders:{label:'طلباتي',eyebrow:'المتابعة',hint:'راجع الطلبات الحالية والسجل والتتبع وإعادة الطلب.'}, finance:{label:'المركز المالي',eyebrow:'الثقة المالية',hint:'راجع الرصيد والائتمان والحركات المالية المتاحة لحسابك.'}, templates:{label:'القوالب والطلبات المحفوظة',eyebrow:'طلبات متكررة',hint:'أعد تطبيق طلباتك المحفوظة بضغطة واحدة.'}, account:{label:'حسابي',eyebrow:'سياق الحساب',hint:'الهوية والاتصال والمستودع وحالات الاسترداد.'}, notifications:{label:'الإشعارات',eyebrow:'التشغيل',hint:'تابع التنبيهات المرتبطة بالحساب والطلبات.'} };
function getVisibleCustomerPortalSections(config: { showCredit: boolean; showTemplates: boolean }): PortalSection[] {
  const sections: PortalSection[] = ['home', 'catalog', 'orders'];
  if (config.showCredit) sections.push('finance');
  if (config.showTemplates) sections.push('templates');
  sections.push('account', 'notifications');
  return sections;
}
const PORTAL_SECTIONS = new Set<PortalSection>(['home', 'catalog', 'orders', 'finance', 'templates', 'account', 'notifications']);
const sectionFromHash = (): PortalSection => {
  if (typeof window === 'undefined') return 'home';
  const value = window.location.hash.replace(/^#/, '') as PortalSection;
  return PORTAL_SECTIONS.has(value) ? value : 'home';
};
type PriceTier = { min_quantity: number; unit_price: number; currency: string };
type Finance = { currency: string; creditLimit: number; outstanding: number; available: number; entries: Array<{ id: string; reference?: string; description: string; debit: number; credit: number; due_date?: string; status: string; created_at: string }> };
type ClientUiConfig = {
  accentColor:string; compactMode:boolean;
  showSearch:boolean; showCategories:boolean; showExcel:boolean; showCredit:boolean; showTemplates:boolean; showInventory:boolean; showRetailPrice:boolean; showQuickOrder:boolean;
  requireQuantityConfirmation:boolean; showTieredPricing:boolean; showSavingsCalculator:boolean; showImageSearch:boolean; showVoiceSearch:boolean; showPaymentMethods:boolean;
  paymentOnCredit:boolean; paymentCash:boolean; paymentTransfer:boolean; minOrderValue:number; maxOrderValue:number; maxTemplates:number;
};
const DEFAULT_UI_CONFIG: ClientUiConfig = { accentColor:'#0e91a4', compactMode:false, showSearch:true, showCategories:true, showExcel:true, showCredit:true, showTemplates:true, showInventory:true, showRetailPrice:false, showQuickOrder:true, requireQuantityConfirmation:true, showTieredPricing:true, showSavingsCalculator:true, showImageSearch:false, showVoiceSearch:false, showPaymentMethods:true, paymentOnCredit:true, paymentCash:true, paymentTransfer:true, minOrderValue:0, maxOrderValue:0, maxTemplates:50 };
const PAYMENT_OPTIONS = [{key:'credit' as const,label:'آجل / ائتمان',field:'paymentOnCredit' as const},{key:'cash' as const,label:'نقدي',field:'paymentCash' as const},{key:'transfer' as const,label:'حوالة',field:'paymentTransfer' as const}];
type PricedProduct = Product & { authorizedPrice?: number; priceCurrency?: string };
export type CatalogStockFilter = 'all' | 'available' | 'out';
export type CatalogPriceFilter = 'all' | 'priced' | 'missing';

export function filterCatalogProducts(
  products: readonly PricedProduct[],
  stockFilter: CatalogStockFilter,
  priceFilter: CatalogPriceFilter,
): PricedProduct[] {
  return products.filter((product) => {
    const stockMatch =
      stockFilter === 'all' ||
      (stockFilter === 'available' && product.availableQuantity > 0) ||
      (stockFilter === 'out' && product.availableQuantity <= 0);
    const priceMatch =
      priceFilter === 'all' ||
      (priceFilter === 'priced' && Number(product.authorizedPrice ?? 0) > 0) ||
      (priceFilter === 'missing' && Number(product.authorizedPrice ?? 0) <= 0);
    return stockMatch && priceMatch;
  });
}
export function catalogQuantityError(value: string | number, availableQuantity: number, maxQuantity = MAX_ORDER_QUANTITY_PER_LINE): string | null {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1) return 'الكمية يجب أن تكون عددًا صحيحًا موجبًا.';
  if (quantity > maxQuantity) return `الكمية تتجاوز الحد التشغيلي (${maxQuantity}).`;
  if (quantity > availableQuantity) return `المخزون المتاح ${availableQuantity} فقط.`;
  return null;
}
function mapProduct(item: CatalogItem, categoryName: string, imageUrl?: string): PricedProduct { return { id:item.id, sku:item.sku, name:item.name, unit:item.unit, category:categoryName, description:item.description ?? undefined, availableQuantity:item.available_quantity, status:item.status === 'active' ? 'active' : 'inactive', imageUrl, authorizedPrice:item.authorized_price ?? undefined, priceCurrency:item.currency || undefined }; }
function money(value:number,currency='YER'){return `${formatMoney(value)} ${currency==='YER'?'ر.ي':currency}`;}
type QuickExcelLine = { identifier:string; quantity:number; product:Product|null; error:string|null };
const CATALOG_PAGE_SIZE=24;
type VoiceRecognitionResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type VoiceRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: VoiceRecognitionResult) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};
type VoiceRecognitionConstructor = new () => VoiceRecognition;

export function shouldLoadPortalData(signedIn: boolean, customerId: string | null, online: boolean, hasSupabase: boolean) {
  return signedIn && Boolean(customerId) && online && hasSupabase;
}

export function catalogCacheScope(
  organizationId: string | null,
  customerId: string | null,
  warehouseId: string | null,
  userId: string | null,
) {
  return [organizationId, customerId, warehouseId, userId].filter(Boolean).join(':');
}


export default function AppV3Fixed(){
  const [sessionUserId,setSessionUserId]=useState<string|null>(null); const [email,setEmail]=useState(''); const [showPassword,setShowPassword]=useState(false); const [resetMode,setResetMode]=useState(false); const [resetBusy,setResetBusy]=useState(false); const [resetSent,setResetSent]=useState(false); const [customerPhone,setCustomerPhone]=useState(''); const [password,setPassword]=useState(''); const [signedIn,setSignedIn]=useState(false); const [ready,setReady]=useState(false); const [role,setRole]=useState<UserRole>('viewer'); const [customerId,setCustomerId]=useState<string|null>(null); const [organizationId,setOrganizationId]=useState<string|null>(null); const [organizationName,setOrganizationName]=useState(''); const [warehouseId,setWarehouseId]=useState<string|null>(null); const [warehouseName,setWarehouseName]=useState(''); const [customerName,setCustomerName]=useState('تاجر الأغبري'); const [customerTier,setCustomerTier]=useState('wholesale');
  const [config,setConfig]=useState<ClientUiConfig>(DEFAULT_UI_CONFIG); const [catalogView,setCatalogView]=useState<'grid'|'compact'>('grid'); const [catalogSort,setCatalogSort]=useState<'relevance'|'name'|'stock'|'price-high'|'price-low'>('relevance'); const [catalogStockFilter,setCatalogStockFilter]=useState<CatalogStockFilter>('all'); const [catalogPriceFilter,setCatalogPriceFilter]=useState<CatalogPriceFilter>('all'); const [catalogQuantityDrafts,setCatalogQuantityDrafts]=useState<Record<string,string>>({}); const [catalogFilterOpen,setCatalogFilterOpen]=useState(false); const [pricingOpen,setPricingOpen]=useState(false); const [pricingQuery,setPricingQuery]=useState(''); const [pricingPage,setPricingPage]=useState(0); const [query,setQuery]=useState(''); const [catalogPage,setCatalogPage]=useState(0); const [catalogHasMore,setCatalogHasMore]=useState(false); const [categoryId,setCategoryId]=useState<string|null>(null); const [categories,setCategories]=useState<CategoryOption[]>([]); const [products,setProducts]=useState<PricedProduct[]>([]); const [tiers,setTiers]=useState<Record<string,PriceTier[]>>({}); const [cart,setCart]=useState<CartLine[]>([]); const [cartOpen,setCartOpen]=useState(false); const [checkoutOpen,setCheckoutOpen]=useState(false); const [quickOpen,setQuickOpen]=useState(false); const [excelOpen,setExcelOpen]=useState(false); const [excelRows,setExcelRows]=useState<QuickExcelLine[]>([]); const [excelBusy,setExcelBusy]=useState(false); const [mobileMoreOpen,setMobileMoreOpen]=useState(false); const [section,setSection]=useState<PortalSection>(sectionFromHash()); const [selectedOrder,setSelectedOrder]=useState<CustomerOrderDetail|null>(null); const [orderDetailBusy,setOrderDetailBusy]=useState(false);
  const [customerInvoiceOpenRequest, setCustomerInvoiceOpenRequest] = useState(0); const [invitationOpen, setInvitationOpen] = useState(false); const [compareIds, setCompareIds] = useState<string[]>([]); const [favoriteIds, setFavoriteIds] = useState<string[]>([]); const [recentProductIds, setRecentProductIds] = useState<string[]>([]); const [recentSearches, setRecentSearches] = useState<string[]>([]);
 const [orders,setOrders]=useState<CustomerOrderSummary[]>([]); const [selectedProduct,setSelectedProduct]=useState<PricedProduct|null>(null);
 const [finance,setFinance]=useState<Finance|null>(null); const [templates,setTemplates]=useState<OrderTemplate[]>([]); const [templateName,setTemplateName]=useState('');
 const [templateQuery,setTemplateQuery]=useState(''); const [templateSort,setTemplateSort]=useState<TemplateViewSort>('updated'); const [templatePage,setTemplatePage]=useState(1); const [selectedTemplate,setSelectedTemplate]=useState<OrderTemplate|null>(null); const [deleteTemplateId,setDeleteTemplateId]=useState<string|null>(null);
 const filteredTemplates=useMemo(()=>filterAndSortTemplates(templates,templateQuery,templateSort),[templates,templateQuery,templateSort]);
 const pagedTemplates=useMemo(()=>paginateTemplates(filteredTemplates,templatePage,8),[filteredTemplates,templatePage]); const [confirmed,setConfirmed]=useState<Record<string,boolean>>({}); const [payment,setPayment]=useState<'credit'|'cash'|'transfer'>('credit'); const [loading,setLoading]=useState(false); const [busy,setBusy]=useState(false); const reorderLock=useRef(false); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine); const [offlineSyncing,setOfflineSyncing]=useState(false); const [voiceListening,setVoiceListening]=useState(false); const [checkoutIdempotencyKey,setCheckoutIdempotencyKey]=useState(()=>crypto.randomUUID());
  useEffect(()=>{if(!mobileMoreOpen)return;const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setMobileMoreOpen(false);}};window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown);},[mobileMoreOpen]);
  function startVoiceSearch(){
    const browserWindow=window as typeof window & { SpeechRecognition?: VoiceRecognitionConstructor; webkitSpeechRecognition?: VoiceRecognitionConstructor };
    const Recognition=browserWindow.SpeechRecognition??browserWindow.webkitSpeechRecognition;
    if(!Recognition){setError('البحث الصوتي غير مدعوم في هذا المتصفح. استخدم البحث النصي بدلًا منه.');return;}
    if(voiceListening)return;
    setError('');setMessage('');
    const recognition=new Recognition();
    recognition.lang='ar-YE';recognition.interimResults=false;recognition.maxAlternatives=1;
    recognition.onresult=(event)=>{const transcript=String(event.results?.[0]?.[0]?.transcript??'').trim();if(transcript){setQuery(transcript);setMessage('تم تحويل الصوت إلى نص والبحث في الكتالوج.');}else setError('لم ألتقط عبارة واضحة. حاول مرة أخرى.');};
    recognition.onerror=(event)=>setError(event.error==='not-allowed'?'تم رفض صلاحية الميكروفون. يمكنك استخدام البحث النصي.':'تعذر تنفيذ البحث الصوتي.');
    recognition.onend=()=>setVoiceListening(false);
    setVoiceListening(true);
    try{recognition.start();}catch{setVoiceListening(false);setError('تعذر بدء البحث الصوتي. استخدم البحث النصي.');}
  }
  const loadConfig=useCallback(async(orgId:string)=>{ if(!supabase)return; const {data,error:configError}=await supabase.from('client_ui_settings').select('config').eq('organization_id',orgId).maybeSingle(); if(configError)throw configError; setConfig(data?.config?{...DEFAULT_UI_CONFIG,...(data.config as Partial<ClientUiConfig>)}:DEFAULT_UI_CONFIG); },[]);
  const loadIdentity=useCallback(async(userId:string)=>{if(!supabase)return;const {data,error:profileError}=await supabase.from('profiles').select('customer_id,role,organization_id').eq('id',userId).single();if(profileError)throw profileError;setRole((data?.role as UserRole)??'viewer');setCustomerId(data?.customer_id??null);setOrganizationId(data?.organization_id??null);if(data?.organization_id){await loadConfig(data.organization_id);const [{data:organization,error:organizationError},{data:warehouse,error:warehouseError}]=await Promise.all([supabase.from('organizations').select('name').eq('id',data.organization_id).maybeSingle(),supabase.from('warehouses').select('id,name').eq('organization_id',data.organization_id).eq('is_active',true).order('created_at').limit(1).maybeSingle()]);if(organizationError)throw organizationError;if(warehouseError)throw warehouseError;setOrganizationName(organization?.name??'');setWarehouseId(warehouse?.id??null);setWarehouseName(warehouse?.name??'');}if(data?.customer_id){const {data:customer,error:customerError}=await supabase.from('customers').select('name,tier,phone').eq('id',data.customer_id).maybeSingle();if(customerError)throw customerError;if(customer?.name)setCustomerName(customer.name);if(customer?.phone)setCustomerPhone(String(customer.phone));if(customer?.tier)setCustomerTier(String(customer.tier));setTemplates(await getOrderTemplates());}},[loadConfig]);
  useEffect(()=>{setTemplatePage(1);},[templateQuery,templateSort]);
 useEffect(()=>{if(!customerId||typeof window==='undefined')return;try{const scope='aghbari:'+ (organizationId??'org') + ':' + customerId + ':saved-products';setFavoriteIds(normalizeSavedIds(JSON.parse(window.localStorage.getItem(scope+':favorites')??'[]')));setRecentProductIds(normalizeSavedIds(JSON.parse(window.localStorage.getItem(scope+':recent')??'[]'),12));setRecentSearches(normalizeSavedIds(JSON.parse(window.localStorage.getItem(scope+':searches')??'[]'),MAX_RECENT_SEARCHES));}catch{setFavoriteIds([]);setRecentProductIds([]);setRecentSearches([]);}},[customerId,organizationId]);
 useEffect(()=>{if(!customerId||typeof window==='undefined')return;try{const scope='aghbari:'+ (organizationId??'org') + ':' + customerId + ':saved-products';window.localStorage.setItem(scope+':favorites',JSON.stringify(favoriteIds));window.localStorage.setItem(scope+':recent',JSON.stringify(recentProductIds));window.localStorage.setItem(scope+':searches',JSON.stringify(recentSearches));}catch { /* optional local personalization must never block Commerce */ }},[customerId,organizationId,favoriteIds,recentProductIds,recentSearches]);
 useEffect(()=>{if(templatePage!==pagedTemplates.page)setTemplatePage(pagedTemplates.page);},[templatePage,pagedTemplates.page]);
 useEffect(()=>{
   const root=document.documentElement;
   root.style.setProperty('--aghbari-accent', normalizePortalAccentColor(config.accentColor));
   root.dataset.aghbariDensity=config.compactMode?'compact':'comfortable';
   return()=>{root.style.removeProperty('--aghbari-accent');delete root.dataset.aghbariDensity;};
 },[config.accentColor,config.compactMode]);
 useEffect(()=>{
   const visible=getVisibleCustomerPortalSections(config);
   if(!visible.includes(section) && visible.length) navigate(visible[0]);
 },[config.showCredit,config.showTemplates,section]);
 useEffect(()=>{
   const syncSectionFromUrl=()=>setSection(sectionFromHash());
   window.addEventListener('hashchange',syncSectionFromUrl);
   window.addEventListener('popstate',syncSectionFromUrl);
   syncSectionFromUrl();
   return()=>{window.removeEventListener('hashchange',syncSectionFromUrl);window.removeEventListener('popstate',syncSectionFromUrl);};
 },[]);
 useEffect(()=>{
   const onKeyDown=(event:KeyboardEvent)=>{
     if(event.key!=='Escape')return;
     if(excelOpen&&!excelBusy){setExcelOpen(false);return;}
     if(quickOpen){setQuickOpen(false);return;}
     if(checkoutOpen){setCheckoutOpen(false);return;}     if(invitationOpen){setInvitationOpen(false);return;}
     if(deleteTemplateId){setDeleteTemplateId(null);return;}
     if(selectedTemplate){setSelectedTemplate(null);return;}
     if(selectedOrder){setSelectedOrder(null);return;}
     if(selectedProduct){setSelectedProduct(null);return;}
     if(catalogFilterOpen){setCatalogFilterOpen(false);return;}
     if(cartOpen)setCartOpen(false);
   };
   window.addEventListener('keydown',onKeyDown);
   return()=>window.removeEventListener('keydown',onKeyDown);
 },[cartOpen,checkoutOpen,deleteTemplateId,excelBusy,excelOpen,quickOpen,selectedOrder,selectedProduct,selectedTemplate,catalogFilterOpen]);
 useEffect(()=>{let dead=false;void getSession().then(async s=>{if(dead)return;setSignedIn(Boolean(s));if(s){setEmail(s.user.email??'');setSessionUserId(s.user.id);await loadIdentity(s.user.id);}if(!dead)setReady(true);}).catch(e=>{if(!dead){setReady(true);setError(e instanceof Error?e.message:'تعذر قراءة الجلسة.');}});const sub=supabase?.auth.onAuthStateChange((event,s)=>{if(dead)return;setSignedIn(Boolean(s));if(s&&(event==='SIGNED_IN'||event==='TOKEN_REFRESHED')){setSessionUserId(s.user.id);void loadIdentity(s.user.id);}if(!s){setSessionUserId(null);setCustomerId(null);setCustomerPhone('');setOrganizationId(null);setOrganizationName('');setWarehouseId(null);setWarehouseName('');setRole('viewer');setProducts([]);setCart([]);setFinance(null);setOrders([]);setTemplates([]);setConfig(DEFAULT_UI_CONFIG);}});return()=>{dead=true;sub?.data.subscription.unsubscribe();};},[loadIdentity]);
  useEffect(()=>{if(!signedIn||!organizationId||!online||!supabase)return;const channel=supabase.channel(`b2b-ui-${organizationId}`).on('postgres_changes',{event:'*',schema:'public',table:'client_ui_settings',filter:`organization_id=eq.${organizationId}`},()=>void loadConfig(organizationId));channel.subscribe();const timer=window.setInterval(()=>void loadConfig(organizationId),15000);return()=>{supabase.removeChannel(channel);window.clearInterval(timer);};},[signedIn,organizationId,online,loadConfig]);
  const loadData=useCallback(async()=>{if(!signedIn||!customerId||!supabase)return;setLoading(true);setError('');try{const cacheScope=catalogCacheScope(organizationId,customerId,warehouseId,sessionUserId);if(!online){const items=await getCatalog(query,categoryId,CATALOG_PAGE_SIZE,catalogPage*CATALOG_PAGE_SIZE,warehouseId??undefined,cacheScope);const mapped=items.map(item=>mapProduct(item,'أصناف'));setProducts(mapped);setCatalogHasMore(items.length===CATALOG_PAGE_SIZE);setCategories([]);setTiers({});setOrders([]);setFinance(null);setTemplates([]);setError(items.length?'أنت دون اتصال؛ يعرض التطبيق نسخة كتالوج محفوظة. الأسعار والمخزون المعروضان قديمان وليسا مصدر الحقيقة.':'لا توجد نسخة كتالوج محفوظة لهذا السياق أثناء عدم الاتصال.');return;}const [items,saved,cats]=await Promise.all([getCatalog(query,categoryId,CATALOG_PAGE_SIZE,catalogPage*CATALOG_PAGE_SIZE,warehouseId??undefined,cacheScope),getCart(),getCategories()]);const cmap=new Map(cats.map(c=>[c.id,c.name]));const urls=await getProductImageUrls(items.map(i=>i.image_path));const mapped=items.map(i=>mapProduct(i,cmap.get(i.category_id??'')??'أصناف',i.image_path?urls.get(i.image_path):undefined));setProducts(mapped);setCatalogHasMore(items.length===CATALOG_PAGE_SIZE);setCategories(cats);setCart(saved.map(i=>{const p=mapped.find(x=>x.id===i.product_id)??({id:i.product_id,sku:i.sku,name:i.name,unit:i.unit,category:'أصناف',availableQuantity:0,status:'active',authorizedPrice:i.authorized_price??undefined,priceCurrency:i.currency||undefined} as PricedProduct);return{product:p,quantity:i.quantity,unitPrice:i.authorized_price??0};}));if(items.length){const {data:rows,error:tiersError}=await supabase.from('customer_price_tiers').select('product_id,min_quantity,unit_price,currency').eq('customer_id',customerId).in('product_id',items.map(i=>i.id)).order('min_quantity');if(tiersError)throw tiersError;const grouped:Record<string,PriceTier[]>={};for(const row of rows??[])(grouped[row.product_id]??=[]).push({min_quantity:Number(row.min_quantity),unit_price:Number(row.unit_price),currency:row.currency});setTiers(grouped);}const [{data:orderRows,error:ordersError},{data:account,error:accountError},{data:ledger,error:ledgerError}]=await Promise.all([supabase.from('orders').select('id,order_number,total,currency,status,created_at').eq('customer_id',customerId).order('created_at',{ascending:false}).limit(30),supabase.from('customer_credit_accounts').select('currency,credit_limit,outstanding_balance,available_credit').eq('customer_id',customerId).maybeSingle(),supabase.from('customer_ledger_entries').select('id,reference,description,debit,credit,due_date,status,created_at').eq('customer_id',customerId).order('created_at',{ascending:false}).limit(50)]);if(ordersError||accountError||ledgerError)throw ordersError??accountError??ledgerError;setOrders((orderRows??[]) as CustomerOrderSummary[]);setFinance(account?{currency:account.currency,creditLimit:Number(account.credit_limit),outstanding:Number(account.outstanding_balance),available:Number(account.available_credit),entries:(ledger??[]).map(e=>({...e,debit:Number(e.debit),credit:Number(e.credit)}))}:null);}catch(e){setError(e instanceof Error?e.message:'تعذر تحميل المتجر.');}finally{setLoading(false);}},[signedIn,customerId,organizationId,warehouseId,sessionUserId,query,categoryId,catalogPage,online]);
  useEffect(()=>{setCatalogPage(0);},[query,categoryId,catalogStockFilter,catalogPriceFilter]);
  useEffect(()=>{void loadData();},[loadData]);
  useEffect(()=>{const enabled=PAYMENT_OPTIONS.find(option=>config[option.field]);if(enabled&&!PAYMENT_OPTIONS.some(option=>option.key===payment&&config[option.field]))setPayment(enabled.key);},[config,payment]);
  useEffect(()=>{const handleOffline=()=>setOnline(false);const handleOnline=()=>{setOnline(true);if(!signedIn)return;setOfflineSyncing(true);setError('');void syncOfflineCart().then((result)=>{if(result.processed>0)setMessage(`تمت مزامنة ${result.processed} عملية سلة بعد عودة الاتصال.`);if(result.failed>0)setError(`تعذر مزامنة ${result.failed} عملية سلة مؤقتًا؛ ستبقى في الطابور لإعادة المحاولة الآمنة.`);return loadData();}).catch(e=>setError(e instanceof Error?e.message:'تعذر مزامنة السلة بعد عودة الاتصال.')).finally(()=>setOfflineSyncing(false));};window.addEventListener('online',handleOnline);window.addEventListener('offline',handleOffline);return()=>{window.removeEventListener('online',handleOnline);window.removeEventListener('offline',handleOffline);};},[signedIn,loadData]);

  const total=calculateClientPreviewTotal(cart);const cartCount=cart.reduce((s,l)=>s+l.quantity,0);const categoriesView=useMemo(()=>[{id:null,name:'الكل'},...categories],[categories]);const filteredProducts=useMemo(()=>filterCatalogProducts(products,catalogStockFilter,catalogPriceFilter),[products,catalogStockFilter,catalogPriceFilter]);const visibleProducts=useMemo(()=>{const next=[...filteredProducts];if(catalogSort==='name')next.sort((x,y)=>x.name.localeCompare(y.name,'ar'));if(catalogSort==='stock')next.sort((x,y)=>y.availableQuantity-x.availableQuantity||x.name.localeCompare(y.name,'ar'));if(catalogSort==='price-high')next.sort((x,y)=>Number(y.authorizedPrice??0)-Number(x.authorizedPrice??0)||x.name.localeCompare(y.name,'ar'));if(catalogSort==='price-low')next.sort((x,y)=>Number(x.authorizedPrice??0)-Number(y.authorizedPrice??0)||x.name.localeCompare(y.name,'ar'));return next;},[catalogSort,filteredProducts]);const activeCatalogFilters=Number(catalogStockFilter!=='all')+Number(catalogPriceFilter!=='all'); const pricedProducts=useMemo(()=>[...products].sort((a,b)=>a.name.localeCompare(b.name,'ar')),[products]); const filteredPricingProducts=useMemo(()=>{const needle=pricingQuery.trim().toLocaleLowerCase();return pricedProducts.filter(p=>!needle||p.name.toLocaleLowerCase().includes(needle)||p.sku.toLocaleLowerCase().includes(needle));},[pricedProducts,pricingQuery]); const pricingPageSize=8; const pricingPages=Math.max(1,Math.ceil(filteredPricingProducts.length/pricingPageSize)); const activePricingPage=Math.min(pricingPage,pricingPages-1); useEffect(()=>{setPricingPage(0);},[pricingQuery]);
  function effectivePrice(p:Product,q:number){return effectiveCatalogPrice(tiers[p.id]??[],(p as PricedProduct).authorizedPrice,q);}
  function toggleCompare(productId:string){setCompareIds(current=>{if(current.includes(productId))return current.filter(id=>id!==productId);if(current.length>=3){setError('يمكن مقارنة 3 أصناف فقط في الوقت نفسه.');return current;}return [...current,productId];});}
  function toggleFavorite(productId:string){setFavoriteIds(current=>toggleSavedProduct(current,productId));}
  function recordSearch(){setRecentSearches(current=>pushRecentSearch(current,query));}
  function openProduct(product:PricedProduct){setRecentProductIds(current=>pushRecentlyViewed(current,product.id));setSelectedProduct(product);}
  async function copyProductSku(product:PricedProduct){try{await navigator.clipboard.writeText(product.sku);setMessage('تم نسخ SKU إلى الحافظة.');}catch{setMessage('تعذر النسخ التلقائي؛ SKU ظاهر في تفاصيل الصنف.');}}
  function nextTier(p:Product,q:number){return (tiers[p.id]??[]).filter(x=>x.min_quantity>q).sort((a,b)=>a.min_quantity-b.min_quantity)[0];}
  function setQtyConfirmed(id:string,value:boolean){setConfirmed(c=>({...c,[id]:value}));}
  async function resolveOrderProduct(item: CustomerOrderDetail['items'][number]): Promise<PricedProduct|null> {
    const local = products.find((product) => product.id === item.product_id);
    if (local) return local;
    try {
      const rows = await getCatalog(item.sku, null, 5, 0, warehouseId ?? undefined);
      const exact = rows.find((row) => row.id === item.product_id || row.sku.trim().toLowerCase() === item.sku.trim().toLowerCase());
      if (!exact) return null;
      const categoryName = categories.find((category) => category.id === exact.category_id)?.name ?? 'أصناف';
      const urls = await getProductImageUrls([exact.image_path]);
      return mapProduct(exact, categoryName, exact.image_path ? urls.get(exact.image_path) : undefined);
    } catch {
      return null;
    }
  }
  async function reorderOrderItems(items: CustomerOrderDetail['items']) {
    if (busy || reorderLock.current) return;
    if (!warehouseId) { setError('لا يوجد مستودع تشغيلي متاح لإعادة الطلب.'); return; }
    reorderLock.current = true;
    setBusy(true); setError(''); setMessage('');
    try {
      const resolved = await Promise.all(items.map((item) => resolveOrderProduct(item)));
      const readyLines: Array<{ productId: string; quantity: number }> = [];
      let unavailable = 0;
      for (const [index, product] of resolved.entries()) {
        const item = items[index];
        const currentCartQuantity = cart.find((line) => line.product.id === product?.id)?.quantity ?? 0;
        if (!product || product.status !== 'active' || product.availableQuantity < currentCartQuantity + item.quantity) { unavailable += 1; continue; }
        readyLines.push({ productId: product.id, quantity: item.quantity });
      }
      if (!readyLines.length) {
        setError('لا يمكن إعادة الطلب حاليًا؛ لا توجد أصناف متاحة بالكميات المطلوبة.');
        return;
      }
      await applyQuickOrder({
        idempotencyKey: crypto.randomUUID(),
        warehouseId,
        lines: readyLines
      });
      await loadData();
      setSelectedOrder(null);
      setCartOpen(true);
      navigate('catalog');
      setMessage(unavailable > 0
        ? `تمت إعادة إضافة ${readyLines.length} صنفًا دفعةً واحدة؛ تعذر إضافة ${unavailable} صنف بسبب التوفر أو الصلاحية الحالية.`
        : `تمت إعادة إضافة ${readyLines.length} صنفًا دفعةً واحدة إلى السلة.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر إعادة الطلب.');
    } finally {
      reorderLock.current = false;
      setBusy(false);
    }
  }
  async function openOrderDetail(order:CustomerOrderSummary){setOrderDetailBusy(true);setError('');try{setSelectedOrder(await getCustomerOrderDetail(order.id));}catch(e){setError(e instanceof Error?e.message:'تعذر تحميل تفاصيل الطلب.');}finally{setOrderDetailBusy(false);}}
  async function refreshAccount(){if(!supabase)return;setBusy(true);setError('');try{const session=await getSession();if(!session)throw new Error('انتهت جلسة الحساب. سجّل الدخول مجددًا.');await loadIdentity(session.user.id);await loadData();setMessage('تم تحديث سياق الحساب والبيانات.');}catch(e){setError(e instanceof Error?e.message:'تعذر تحديث سياق الحساب.');}finally{setBusy(false);}}
  function navigate(next:PortalSection):boolean{if(next!==section&&config.requireQuantityConfirmation&&cart.some(l=>!confirmed[l.product.id])){setError('اعتمد كميات السلة أولاً قبل الانتقال إلى قسم آخر.');setCartOpen(true);return false;}setError('');setSection(next);if(typeof window!=='undefined'&&window.location.hash!==('#'+next))window.history.pushState(null,'','#'+next);return true;}
  function focusCustomerSurface(selector:string, focus=false){
    window.setTimeout(()=>{
      const node=document.querySelector(selector) as HTMLElement|null;
      node?.scrollIntoView({behavior:'smooth',block:'center'});
      if(focus && node && 'focus' in node) node.focus();
    },0);
  }
  function clickCustomerTab(selector:string, label:string){
    window.setTimeout(()=>{
      const buttons=[...document.querySelectorAll<HTMLButtonElement>(selector)];
      buttons.find((button)=>button.textContent?.trim()===label)?.click();
    },0);
  }
  function openCustomerCapability(item:CustomerStructureItem){
    if(item.section!=='home' && !navigate(item.section as PortalSection)) return;
    switch(item.id){
      case 'home':
        navigate('home');
        break;
      case 'store':
        focusCustomerSurface('.search-panel');
        break;
      case 'search':
        focusCustomerSurface('.search-panel input[aria-label="البحث في الكتالوج"]',true);
        break;
      case 'categories':
        focusCustomerSurface('.category-row');
        break;
      case 'product-detail':{
        const product=products.find((candidate)=>candidate.status==='active' && candidate.availableQuantity>0)??products[0];
        if(product) setSelectedProduct(product);
        else setMessage('لا توجد أصناف محملة لفتح تفاصيلها الآن.');
        break;
      }
      case 'cart':
        setCartOpen(true);
        break;
      case 'checkout':
        if(!cart.length){setError('السلة فارغة. أضف صنفًا واحدًا على الأقل قبل إتمام الطلب.');setCartOpen(true);break;}
        setCheckoutOpen(true);
        break;
      case 'order-history':
        navigate('orders');
        break;
      case 'order-detail':
        if(orders[0]) void openOrderDetail(orders[0]);
        else setMessage('لا يوجد طلب حالي لفتح تفاصيله.');
        break;
      case 'templates':
        navigate('templates');
        break;
      case 'quick-order':
        setQuickOpen(true);
        break;
      case 'pricing':
        setPricingOpen(true);
        break;
      case 'profile':
        clickCustomerTab('.customer-account-tabs button','الملف الشخصي');
        break;
      case 'company':
        clickCustomerTab('.customer-account-tabs button','الشركة والحساب');
        break;
      case 'addresses':
        clickCustomerTab('.customer-account-tabs button','العناوين');
        break;
      case 'account-settings':
        clickCustomerTab('.customer-account-tabs button','إعدادات الحساب');
        break;
      case 'account':
        focusCustomerSurface('.customer-account-workspace');
        break;
      case 'offline':
        focusCustomerSurface('#offline-recovery-title');
        break;
      case 'invitations':
        setInvitationOpen(true);
        break;
      case 'finance':
        navigate('finance');
        break;
      case 'invoice-history':
        clickCustomerTab('.history-tabs button','الفواتير والمدفوعات');
        break;
      case 'invoice-detail':
        clickCustomerTab('.history-tabs button','الفواتير والمدفوعات');
        setCustomerInvoiceOpenRequest((request) => request + 1);
        break;
      case 'statements':
        clickCustomerTab('.history-tabs button','كشف الحساب');
        break;
      case 'payment-history':
        clickCustomerTab('.history-tabs button','سجل الدفعات');
        break;
      case 'notifications':
        navigate('notifications');
        break;
      default:
        focusCustomerSurface('.customer-section-context');
        break;
    }
  }
  async function add(p:Product,q=1,openCart=true):Promise<boolean>{const price=effectivePrice(p,q);if(price<=0){setError('لا يوجد سعر مصرح به لهذا الصنف.');return false;}if(q<1||q>p.availableQuantity){setError('الكمية المطلوبة غير متاحة.');return false;}const existing=cart.find(l=>l.product.id===p.id);const next=Math.min((existing?.quantity??0)+q,p.availableQuantity);try{await setCartItem(p.id,next);setCart(c=>existing?c.map(l=>l.product.id===p.id?{...l,quantity:next,unitPrice:effectivePrice(p,next)}:l):[...c,{product:p,quantity:next,unitPrice:price}]);setQtyConfirmed(p.id,!config.requireQuantityConfirmation);setCartOpen(openCart);setCatalogQuantityDrafts(c=>({...c,[p.id]:String(next)}));setError('');return true;}catch(e){setError(e instanceof Error?e.message:'تعذر تحديث السلة.');return false;}}
  async function applyCatalogQuantity(p: PricedProduct, raw: string) {
    const issue = catalogQuantityError(raw, p.availableQuantity);
    if (issue) { setError(issue); return; }
    const next = Number(raw);
    const current = cart.find((line) => line.product.id === p.id)?.quantity ?? 0;
    if (next === current) { setCatalogQuantityDrafts((drafts) => ({ ...drafts, [p.id]: String(next) })); setError(''); return; }
    if (next > current) await add(p, next - current, false);
    else await update(p.id, next);
    setCatalogQuantityDrafts((drafts) => ({ ...drafts, [p.id]: String(next) }));
    setError('');
  }
  async function update(id:string,q:number){const line=cart.find(l=>l.product.id===id);if(!line)return;const next=Math.max(0,Math.min(q,line.product.availableQuantity));try{if(!next){await removeCartItem(id);setCart(c=>c.filter(l=>l.product.id!==id));setConfirmed(c=>{const n={...c};delete n[id];return n;});}else{await setCartItem(id,next);setCart(c=>c.map(l=>l.product.id===id?{...l,quantity:next,unitPrice:effectivePrice(l.product,next)}:l));setQtyConfirmed(id,!config.requireQuantityConfirmation);setCatalogQuantityDrafts(c=>({...c,[id]:String(next)}));}}catch(e){setError(e instanceof Error?e.message:'تعذر تحديث الكمية.');}}
  async function submit(){if(!customerId||!cart.length||busy)return;if(!online)return setError('الاتصال بالخادم مطلوب لإرسال الطلب. يمكن مواصلة تعديل السلة دون اتصال، لكن اعتماد وإرسال الطلب مؤجل حتى عودة الاتصال.');if(config.requireQuantityConfirmation&&cart.some(l=>!confirmed[l.product.id]))return setError('يجب اعتماد جميع الكميات قبل إرسال الطلب.');if(config.minOrderValue>0&&total<config.minOrderValue)return setError(`الحد الأدنى للطلب ${money(config.minOrderValue)}.`);if(config.maxOrderValue>0&&total>config.maxOrderValue)return setError(`الحد الأعلى للطلب ${money(config.maxOrderValue)}.`);if(config.showPaymentMethods&&!PAYMENT_OPTIONS.some(x=>x.key===payment&&config[x.field]))return setError('وسيلة الدفع المختارة غير متاحة حاليًا.');setBusy(true);setError('');try{const result=await createOrder({customerId,idempotencyKey:checkoutIdempotencyKey,lines:cart.map(l=>({productId:l.product.id,quantity:l.quantity}))},warehouseId??undefined,{paymentMethod:payment});setCheckoutIdempotencyKey(crypto.randomUUID());setCart([]);setConfirmed({});setCartOpen(false);setCheckoutOpen(false);setMessage(`تم إرسال الطلب #${result.order_number} بنجاح.`);navigate('orders');void loadData();}catch(e){setError(e instanceof Error?e.message:'تعذر إرسال الطلب.');}finally{setBusy(false);}}
  async function saveTemplate(){if(!cart.length||!templateName.trim()||busy)return;setBusy(true);setError('');setMessage('');try{const item=await createOrderTemplate({name:templateName,branchLabel:warehouseName||'المستودع التشغيلي',lines:cart.map(l=>({productId:l.product.id,sku:l.product.sku,name:l.product.name,unit:l.product.unit,quantity:l.quantity}))});setTemplates(current=>[item,...current].slice(0,config.maxTemplates));setTemplateName('');setMessage('تم حفظ القالب في قاعدة البيانات.');}catch(e){setError(e instanceof Error?e.message:'تعذر حفظ القالب.');}finally{setBusy(false);}}
  async function removeTemplate(id:string){if(busy)return;setBusy(true);setError('');setMessage('');try{await deleteOrderTemplate(id);setTemplates(current=>current.filter(item=>item.id!==id));setMessage('تم حذف القالب.');}catch(e){setError(e instanceof Error?e.message:'تعذر حذف القالب.');}finally{setBusy(false);}}
  async function applyTemplate(t:OrderTemplate){if(busy)return;setBusy(true);setError('');setMessage('');try{await applyOrderTemplate(t.id,warehouseId??undefined);const saved=await getCart();setCart(saved.map(i=>{const p=products.find(x=>x.id===i.product_id)??({id:i.product_id,sku:i.sku,name:i.name,unit:i.unit,category:'أصناف',availableQuantity:0,status:'active',authorizedPrice:i.authorized_price??undefined,priceCurrency:i.currency||undefined} as PricedProduct);return{product:p,quantity:i.quantity,unitPrice:i.authorized_price??0};}));setConfirmed({});setCartOpen(true);setMessage('تم تطبيق القالب على السلة عبر العملية الذرية.');navigate('catalog');}catch(e){setError(e instanceof Error?e.message:'تعذر تطبيق القالب.');}finally{setBusy(false);}}
  async function stageQuickExcel(file:File){setExcelBusy(true);setError('');setMessage('');try{const raw=await readXlsxFile(file) as unknown;const rows=Array.isArray(raw)?raw.filter(Array.isArray) as unknown[][]:[];if(!rows.length)throw new Error('ملف Excel فارغ.');if(rows.length>101)throw new Error('ملف الطلب السريع يتجاوز 100 صف.');const first=rows[0]?.map(cell=>String(cell??'').trim().toLowerCase())??[];const hasHeader=first.some(v=>['sku','identifier','product code','الرمز','الصنف','sku/الباركود'].includes(v));const dataRows=rows.slice(hasHeader?1:0);const seen=new Set<string>();const nextRows:QuickExcelLine[]=[];for(const row of dataRows){const identifier=String(row?.[0]??'').trim();const quantity=Number(row?.[1]);if(!identifier&&!row?.[1])continue;let rowError:string|null=null;if(!identifier)rowError='المعرف مطلوب.';else if(seen.has(identifier.toLowerCase()))rowError='العنصر مكرر في الملف.';else if(!Number.isSafeInteger(quantity)||quantity<1)rowError='الكمية يجب أن تكون عددًا صحيحًا موجبًا.';let product:Product|null=null;if(!rowError){seen.add(identifier.toLowerCase());const normalizedIdentifier=identifier.toLowerCase();product=products.find(p=>p.sku.toLowerCase()===normalizedIdentifier)??null;if(!product){const found=await getCatalog(identifier,null,5,0,warehouseId??undefined);const exact=found.find(item=>item.sku.toLowerCase()===normalizedIdentifier||(item.barcode??'').toLowerCase()===normalizedIdentifier);if(exact)product=mapProduct(exact,'أصناف');}if(!product)rowError='المعرف غير موجود أو غير مصرح به لهذا العميل.';else if(product.status!=='active')rowError='الصنف غير نشط.';else if(quantity>product.availableQuantity)rowError=`المخزون المتاح ${product.availableQuantity} فقط.`;else if(quantity>MAX_ORDER_QUANTITY_PER_LINE)rowError=`الكمية تتجاوز الحد التشغيلي (${MAX_ORDER_QUANTITY_PER_LINE}).`;}nextRows.push({identifier,quantity,product,error:rowError});}if(!nextRows.length)throw new Error('لم توجد صفوف صالحة للمعالجة.');setExcelRows(nextRows);setExcelOpen(true);}catch(e){setExcelRows([]);setError(e instanceof Error?e.message:'تعذر تحليل ملف الطلب السريع.');}finally{setExcelBusy(false);}}
  async function confirmQuickExcel(){const invalid=excelRows.filter(row=>row.error||!row.product);if(invalid.length)return setError('يجب إصلاح جميع أخطاء ملف الطلب قبل الاعتماد.');if(!warehouseId)return setError('لا يوجد مستودع نشط متاح للحساب الحالي.');setExcelBusy(true);setError('');setMessage('');try{await applyQuickOrder({idempotencyKey:crypto.randomUUID(),warehouseId,lines:excelRows.map(row=>({productId:row.product!.id,quantity:row.quantity}))});await loadData();setExcelRows([]);setExcelOpen(false);setCartOpen(true);setMessage('تم اعتماد الطلب السريع وإضافة الأصناف إلى السلة وتسجيل العملية.');}catch(e){setError(e instanceof Error?e.message:'تعذر اعتماد الطلب السريع.');}finally{setExcelBusy(false);}}
  async function login(e:FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');try{const s=await signIn(email,password);if(!s)throw new Error('تعذر إنشاء جلسة دخول صالحة.');await loadIdentity(s.user.id);setSignedIn(true);setReady(true);}catch(e){setSignedIn(false);setReady(true);setError(friendlyAuthError(e));}finally{setBusy(false);}}
  async function requestPasswordReset(e:FormEvent){e.preventDefault();if(resetBusy)return;if(!email.trim())return setError('اكتب بريد الحساب أولًا لاستعادة كلمة المرور.');setResetBusy(true);setError('');setMessage('');setResetSent(false);try{await resetPassword(email,window.location.origin);setResetSent(true);setMessage('تم إرسال رابط استعادة كلمة المرور إلى بريد الحساب إن كان مسجلًا.');}catch(e){setError(friendlyAuthError(e));}finally{setResetBusy(false);}}
  async function logout(){await signOut();}
  if(!ready)return <div className="customer-shell"><OperationalLoadingSkeleton variant="app" /></div>;
  if(!signedIn)return <div className="customer-shell auth-shell">
    <div className="auth-experience">
      <aside className="auth-brand-panel" aria-label="تعريف الأغبري">
        <div className="auth-brand-mark">أ</div>
        <div className="eyebrow">AGHBARI · B2B COMMERCE</div>
        <h1>الأغبري</h1>
        <p className="auth-brand-lead">مساحة تجارة الجملة التي تجمع الكتالوج والطلبات والحساب المالي في تجربة واحدة.</p>
        <div className="auth-proof-list">
          <div><b>01</b><span><strong>شراء أسرع</strong><small>بحث، أسعار مصرح بها، وكميات جاهزة للطلب.</small></span></div>
          <div><b>02</b><span><strong>تشغيل واضح</strong><small>متابعة الطلبات والحالات دون شاشات زائدة.</small></span></div>
          <div><b>03</b><span><strong>بيانات موثوقة</strong><small>صلاحيات الحساب والمعاملات تأتي من النظام نفسه.</small></span></div>
        </div>
        <div className="auth-brand-footer"><span>بوابة الأغبري التجارية</span><span>اتصال آمن بالحساب</span></div>
      </aside>
      <main className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-header">
          <div>
            <span className="eyebrow">تسجيل دخول</span>
            <h2 id="auth-title">{resetMode?'استعادة الوصول إلى الحساب':'مرحبًا بك في الأغبري'}</h2>
            <p>{resetMode?'أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل رابط الاستعادة.':'ادخل إلى مساحة العمل الخاصة بمؤسستك وابدأ تنفيذ طلباتك.'}</p>
          </div>
          <span className="auth-status"><i aria-hidden="true"></i> حماية الحساب مفعلة</span>
        </div>
        {!resetMode ? <form className="auth-form" onSubmit={login}>
          <label className="auth-field"><span>البريد الإلكتروني</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" inputMode="email" autoComplete="username" placeholder="name@company.com" required autoFocus /><small>استخدم البريد المرتبط بحساب مؤسستك في الأغبري.</small></label>
          <label className="auth-field"><span>كلمة المرور</span><div className="auth-password-wrap"><input value={password} onChange={e=>setPassword(e.target.value)} type={showPassword?'text':'password'} autoComplete="current-password" placeholder="أدخل كلمة المرور" required /><button type="button" className="auth-password-toggle" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'إخفاء كلمة المرور':'إظهار كلمة المرور'}>{showPassword?'إخفاء':'إظهار'}</button></div></label>
          <div className="auth-form-row"><span>الدخول محكوم بصلاحية حسابك ومؤسستك.</span><button type="button" className="auth-inline-link" onClick={()=>{setResetMode(true);setResetSent(false);setError('');setMessage('');}}>نسيت كلمة المرور؟</button></div>
          <button className="auth-submit" disabled={busy}>{busy?<><span className="auth-spinner" aria-hidden="true"></span> جارٍ التحقق…</>:'دخول إلى بوابة الأغبري'}</button>
        </form> : <form className="auth-form" onSubmit={requestPasswordReset}>
          <label className="auth-field"><span>البريد الإلكتروني</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" required autoFocus /></label>
          <button className="auth-submit" disabled={resetBusy}>{resetBusy?<><span className="auth-spinner" aria-hidden="true"></span> جارٍ إرسال الرابط…</>:'إرسال رابط الاستعادة'}</button>
          <button type="button" className="auth-back-link" onClick={()=>{setResetMode(false);setResetSent(false);setError('');setMessage('');}}>العودة إلى تسجيل الدخول</button>
        </form>}
        {error&&<div className="error-banner auth-feedback" role="alert">{error}</div>}
        {message&&<div className="success auth-feedback" role="status">{message}</div>}
        {resetSent&&<div className="auth-note" role="status"><strong>تحقق من البريد</strong><span>راجع الوارد والمجلد غير المرغوب فيه، ثم افتح رابط الاستعادة.</span></div>}
        {!resetMode&&<div className="auth-help">الحسابات تُنشأ وتُدار ضمن دورة الدعوات والصلاحيات الخاصة بالمؤسسة.</div>}
      </main>
    </div>
  </div>;
  if(resolveAuthenticatedSurface(role,customerId)==='admin')return <><header className="staff-topbar"><strong>الأغبري · مركز التحكم التشغيلي</strong><div><span>الدور: {role==='viewer'?'مشاهد':role}</span><button onClick={()=>void logout()}>خروج</button></div></header><Suspense fallback={<OperationalLoadingSkeleton variant="app" />}><AdminPanel role={role as 'owner'|'admin'|'sales'|'warehouse'|'viewer'} userId={sessionUserId}/></Suspense></>;
  return <div className="customer-shell"><header className="portal-header"><div><span className="eyebrow">B2B ENTERPRISE</span><h1>بوابة الأغبري</h1><small>مرحبًا، {customerName}</small></div><div className="portal-header-search-slot"><div className="portal-global-search" role="search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();if(navigate('catalog'))recordSearch();}}} aria-label="البحث العام في الكتالوج" placeholder="ابحث باسم الصنف أو SKU أو الباركود…" inputMode="search" autoComplete="off"/>{query&&<button type="button" className="global-search-clear" aria-label="مسح البحث" onClick={()=>setQuery('')}>×</button>}<button type="button" className="global-search-submit" onClick={()=>{if(navigate('catalog'))recordSearch();}}>بحث</button><kbd>Enter</kbd></div></div><div className="header-actions"><CustomerCommandPalette products={products} visibleSections={getVisibleCustomerPortalSections(config)} onNavigate={navigate} onOpenCart={()=>setCartOpen(true)} onOpenProduct={(product)=>openProduct(product as PricedProduct)} onOpenQuickOrder={()=>setQuickOpen(true)} onOpenPricing={()=>setPricingOpen(true)} onReorderLatest={async()=>{if(orders[0]){const detail=await getCustomerOrderDetail(orders[0].id);await reorderOrderItems(detail.items);}}} /><span className={`connection ${online?'':'connection-offline'}`} role="status">{online?(offlineSyncing?'↻ مزامنة…':'● متصل'):'○ غير متصل'}</span><button onClick={()=>setCartOpen(true)}>السلة <b>{cartCount}</b></button><button className="ghost" onClick={()=>void logout()}>خروج</button></div></header>
    <OperationalTruthStrip isOnline={online} customerTier={customerTier} warehouseLabel={warehouseName||'المستودع التشغيلي'} />
    <PwaInstallPrompt />
    <WorkspaceSurfaceRail variant="customer" section={section} onSelect={navigate} visibleSections={getVisibleCustomerPortalSections(config)} onOpenCapability={openCustomerCapability} />
    <div className="portal-body"><aside className="portal-nav"><button aria-current={section==='home'?'page':undefined} className={section==='home'?'active':''} onClick={()=>navigate('home')}>الرئيسية</button><button aria-current={section==='catalog'?'page':undefined} className={section==='catalog'?'active':''} onClick={()=>navigate('catalog')}>الكتالوج</button><button aria-current={section==='orders'?'page':undefined} className={section==='orders'?'active':''} onClick={()=>navigate('orders')}>طلباتي</button><button aria-current={section==='account'?'page':undefined} className={section==='account'?'active':''} onClick={()=>navigate('account')}>حسابي</button><button aria-current={section==='notifications'?'page':undefined} className={section==='notifications'?'active':''} onClick={()=>navigate('notifications')}>الإشعارات</button>{config.showTemplates&&<button aria-current={section==='templates'?'page':undefined} className={section==='templates'?'active':''} onClick={()=>navigate('templates')}>القوالب</button>}{config.showCredit&&<button aria-current={section==='finance'?'page':undefined} className={section==='finance'?'active':''} onClick={()=>navigate('finance')}>المركز المالي</button>}</aside><main className="portal-main">
      <section className="customer-section-context" aria-label="سياق القسم الحالي"><div><span className="eyebrow">{PORTAL_SECTION_META[section].eyebrow}</span><strong>{PORTAL_SECTION_META[section].label}</strong><small>{PORTAL_SECTION_META[section].hint}</small></div><div className="customer-context-actions"><button type="button" className="ghost" onClick={()=>setCartOpen(true)}>السلة <b>{cartCount}</b></button>{section!=='catalog'&&<button type="button" className="ghost" onClick={()=>navigate('catalog')}>الكتالوج</button>}</div></section>
      {section==='home'&&<CustomerHomeWorkspace
        customerName={customerName}
        organizationName={organizationName}
        warehouseName={warehouseName}
        productsOnPage={products.length}
        ordersCount={orders.length}
        latestOrderNumber={orders[0]?.order_number}
        latestOrderStatus={orders[0]?.status}
        latestOrderDate={orders[0]?.created_at}
        cartCount={cartCount}
        cartLines={cart.length}
        availableCreditText={finance ? money(finance.available, finance.currency) : '—'}
        financeReady={Boolean(finance)}
        templatesCount={templates.length}
        showCredit={config.showCredit}
        showTemplates={config.showTemplates}
        isOnline={online}
        offlineSyncing={offlineSyncing}
        onNavigate={navigate}
        onOpenCart={()=>setCartOpen(true)}
        featuredProducts={products.slice(0,6)}
        categories={categories}
        onOpenProduct={(product)=>openProduct(product as PricedProduct)}
        onAddProduct={(product)=>add(product, 1, true)}
        onSelectCategory={(id)=>setCategoryId(id)}
        hasLatestOrder={Boolean(orders[0])}
        onReorderLatest={async()=>{if(orders[0]){const detail=await getCustomerOrderDetail(orders[0].id);await reorderOrderItems(detail.items);}}}
      />}
      {section==='catalog'&&<><section className="hero-card customer-catalog-hero" style={{background:'linear-gradient(135deg,#102a43 0%,#243b53 72%,#314f67 100%)',color:'#fff'}}><div><span className="eyebrow" style={{color:'#d9e6f2'}}>تجارة جملة أسرع</span><h2 style={{color:'#fff'}}>احتياج متجرك، في طلب واحد.</h2><p style={{color:'#d9e6f2'}}>ابحث بالاسم أو SKU أو الباركود، راجع شرائح السعر، ثم اعتمد الكميات وأرسل الطلب.</p></div><div className="hero-stat" style={{borderColor:'rgba(255,255,255,.22)'}}><strong style={{color:'#fff'}}>{products.length}</strong><span style={{color:'#d9e6f2'}}>صنف في الصفحة</span></div></section>
      <section className="customer-overview-strip" aria-label="ملخص حساب التاجر">
        <article className="customer-overview-card customer-overview-primary">
          <span className="overview-icon" aria-hidden="true">◫</span>
          <div><small>المتاح للشراء</small><strong>{finance?money(finance.available,finance.currency):'—'}</strong><em>{finance?'من الحد الائتماني':'بانتظار بيانات الحساب'}</em></div>
        </article>
        <article className="customer-overview-card">
          <span className="overview-icon" aria-hidden="true">🧾</span>
          <div><small>الطلبات</small><strong>{orders.length.toLocaleString('ar')}</strong><em>{orders[0]?`آخر طلب #${orders[0].order_number}`:'لا توجد طلبات بعد'}</em></div>
        </article>
        <article className="customer-overview-card">
          <span className="overview-icon" aria-hidden="true">▣</span>
          <div><small>السلة الحالية</small><strong>{cartCount.toLocaleString('ar')}</strong><em>{cart.length?`${cart.length} أصناف جاهزة للمراجعة`:'السلة فارغة'}</em></div>
        </article>
        <article className="customer-overview-card">
          <span className="overview-icon" aria-hidden="true">{online?'●':'○'}</span>
          <div><small>حالة الاتصال</small><strong>{online?'متصل':'غير متصل'}</strong><em>{offlineSyncing?'تتم المزامنة الآمنة الآن':'الخدمة الأساسية'}</em></div>
        </article>
      </section>
      <section className="portal-quick-actions" aria-label="اختصارات بوابة الأغبري">
        <div className="portal-quick-lead"><span className="eyebrow">تشغيل سريع</span><strong>من نفس الشاشة إلى الإجراء التالي</strong><small>ابدأ الطلب، راجع طلباتك، أو افتح حسابك دون فقدان سياق المتجر.</small></div>
        <div className="portal-quick-grid">
          <button type="button" className="portal-quick-item primary" onClick={()=>setCartOpen(true)}><span aria-hidden="true">🛒</span><div><strong>مراجعة السلة</strong><small>{cartCount?cartCount.toLocaleString('ar')+' وحدة في السلة':'السلة فارغة'}</small></div><b>↗</b></button>
          <button type="button" className="portal-quick-item" onClick={()=>navigate('orders')}><span aria-hidden="true">🧾</span><div><strong>آخر الطلبات</strong><small>{orders.length?orders.length.toLocaleString('ar')+' طلب في السجل':'لم تُرسل طلبات بعد'}</small></div><b>↗</b></button>
          {config.showTemplates&&<button type="button" className="portal-quick-item" onClick={()=>navigate('templates')}><span aria-hidden="true">▤</span><div><strong>القوالب المحفوظة</strong><small>{templates.length} قالب محفوظ</small></div><b>↗</b></button>}
          {config.showCredit&&<button type="button" className="portal-quick-item" onClick={()=>navigate('finance')}><span aria-hidden="true">◫</span><div><strong>المركز المالي</strong><small>{finance?money(finance.available,finance.currency):'بيانات الحساب'}</small></div><b>↗</b></button>}
        </div>
      </section>
      {config.showSearch&&<section className="search-panel"><div className="search-input-wrap"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();recordSearch();}}} placeholder="ابحث باسم الصنف، SKU أو الباركود…" aria-label="البحث في الكتالوج"/>{query&&<button type="button" className="search-clear" aria-label="مسح البحث" onClick={()=>setQuery("")}>×</button>}</div><div>{config.showVoiceSearch&&<button type="button" title="البحث الصوتي" aria-pressed={voiceListening} disabled={voiceListening} onClick={startVoiceSearch}>{voiceListening?'● جارٍ الاستماع':'🎙 البحث الصوتي'}</button>}{config.showImageSearch&&<span className="search-capability-disabled" role="note" title="البحث بالصور يحتاج عقد بحث مرئي حقيقي غير موجود في Commerce الحالي.">⌕ البحث بالصور غير متاح حاليًا</span>}{config.showExcel&&<label className="file-button">رفع Excel<input type="file" accept=".xlsx" disabled={excelBusy} onChange={async e=>{const f=e.target.files?.[0];if(f)await stageQuickExcel(f);e.currentTarget.value='';}}/></label>}{config.showQuickOrder&&<button onClick={()=>setQuickOpen(true)}>طلب سريع</button>}</div></section>}
      {recentSearches.length>0&&<div className="recent-searches" aria-label="عمليات البحث الأخيرة"><span>بحث مؤخرًا</span><div>{recentSearches.map(item=><button type="button" key={item} onClick={()=>setQuery(item)}>{item}</button>)}<button type="button" className="clear-recent-searches" onClick={()=>setRecentSearches([])}>مسح</button></div></div>}
      {config.showCategories&&<div className="category-row">{categoriesView.map(c=><button key={c.id??"all"} className={categoryId===c.id?"active":""} onClick={()=>setCategoryId(c.id)}>{c.name}</button>)}</div>}
      <div className="catalog-display-toolbar" aria-label="خيارات عرض الكتالوج"><div><span className="eyebrow">طريقة العرض</span><strong>{visibleProducts.length} صنف</strong></div><div className="catalog-display-controls"><label>الترتيب<select value={catalogSort} onChange={e=>setCatalogSort(e.target.value as typeof catalogSort)}><option value="relevance">الأولوية الحالية</option><option value="name">الاسم</option><option value="stock">الأكثر توفرًا</option><option value="price-high">الأعلى سعرًا</option><option value="price-low">الأقل سعرًا</option></select></label><div className="catalog-view-switch" role="group" aria-label="طريقة عرض المنتجات"><button type="button" className={catalogView==='grid'?'active':''} aria-pressed={catalogView==='grid'} onClick={()=>setCatalogView('grid')}>▦ شبكة</button><button type="button" className={catalogView==='compact'?'active':''} aria-pressed={catalogView==='compact'} onClick={()=>setCatalogView('compact')}>☷ مضغوط</button></div><button type="button" className="catalog-filter-trigger" aria-haspopup="dialog" aria-expanded={pricingOpen} onClick={()=>setPricingOpen(true)}>▤ الأسعار</button><button type="button" className={activeCatalogFilters?'catalog-filter-trigger active':'catalog-filter-trigger'} aria-haspopup="dialog" aria-expanded={catalogFilterOpen} onClick={()=>setCatalogFilterOpen(true)}>⚙ الفلاتر{activeCatalogFilters>0&&<b>{activeCatalogFilters}</b>}</button></div></div>
      <div className="catalog-context-bar" aria-live="polite">
        <span>{loading ? "جارٍ تحميل الكتالوج…" : visibleProducts.length+" نتيجة من "+products.length+" صنف محمل"}</span>
        <span>{categoryId?(categories.find(item=>item.id===categoryId)?.name??"تصنيف محدد"):"كل التصنيفات"}</span>
        {query&&<span>بحث: <b>{query}</b></span>}
        {catalogStockFilter==='available'&&<span>المخزون: <b>متوفر فقط</b></span>}
        {catalogStockFilter==='out'&&<span>المخزون: <b>غير متوفر</b></span>}
        {catalogPriceFilter==='priced'&&<span>السعر: <b>بسعر أساسي مصرح</b></span>}
        {catalogPriceFilter==='missing'&&<span>السعر: <b>بدون سعر أساسي</b></span>}
        {(query||categoryId||activeCatalogFilters>0)&&<button type="button" className="ghost" onClick={()=>{setQuery("");setCategoryId(null);setCatalogStockFilter('all');setCatalogPriceFilter('all');setCatalogPage(0);}}>مسح الفلاتر</button>}
      </div>
      {loading?<div className="catalog-loading-skeleton" aria-label="جارٍ تحميل الكتالوج" role="status">{Array.from({length:6}).map((_,index)=><article key={index}><i/><div><i/><i/><i/></div></article>)}</div>:visibleProducts.length?<> <div className={`product-grid ${catalogView==='compact'?'product-grid-compact':''}`}>{visibleProducts.map(p=>{const q=cart.find(l=>l.product.id===p.id)?.quantity??0;const baseQty=Math.max(1,q);const price=effectivePrice(p,baseQty);const next=nextTier(p,baseQty);return <article className={compareIds.includes(p.id)?"product-card is-compare-selected":"product-card"} key={p.id}>{p.imageUrl?<img src={p.imageUrl} alt={p.name}/>:<div className="product-placeholder">{p.name.slice(0,1)}</div>}<div className="product-body"><span className="sku">{p.sku}</span><h3>{p.name}</h3><small>{p.category} · {p.unit}</small>{config.showInventory&&<span className="stock">{p.availableQuantity>0?`متاح ${p.availableQuantity} ${p.unit}`:'غير متوفر'}</span>}{price>0?<div className="price-row"><strong>{money(price, (p as PricedProduct).priceCurrency ?? 'YER')}</strong>{config.showRetailPrice&&<small>سعر التجزئة متاح حسب الصلاحية</small>}</div>:<div className="price-hidden">السعر حسب حسابك</div>}{config.showTieredPricing&&(tiers[p.id]??[]).length>1&&<div className="tiers">{(tiers[p.id]??[]).map(t=><span key={t.min_quantity}>من {t.min_quantity}: {money(t.unit_price,t.currency)}</span>)}</div>}{config.showSavingsCalculator&&next&&<div className="saving">أضف {next.min_quantity-baseQty} {p.unit} للوصول إلى {money(next.unit_price,next.currency)}</div>}<div className="product-card-actions" aria-label={"إجراءات "+p.name}><div className="product-qty" aria-label={"كمية "+p.name+" في السلة"}><button type="button" aria-label={"تقليل "+p.name} onClick={()=>void update(p.id,q-1)} disabled={q<=0}>−</button><input className="product-qty-input" aria-label={"الكمية المطلوبة لـ "+p.name} type="number" min="1" max={Math.min(p.availableQuantity,MAX_ORDER_QUANTITY_PER_LINE)} placeholder="0" value={catalogQuantityDrafts[p.id] ?? (q>0?String(q):'')} onChange={e=>setCatalogQuantityDrafts(c=>({...c,[p.id]:e.target.value}))} onBlur={()=>void applyCatalogQuantity(p,catalogQuantityDrafts[p.id] ?? '')} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void applyCatalogQuantity(p,catalogQuantityDrafts[p.id] ?? '')}}} /><button type="button" aria-label={"زيادة "+p.name} onClick={()=>{if(q===0){void add(p)}else{void update(p.id,q+1)}}} disabled={p.availableQuantity<1||price<=0||q>=Math.min(p.availableQuantity,MAX_ORDER_QUANTITY_PER_LINE)}>+</button></div>{q>0&&<span className="in-cart-label">في السلة</span>}</div><div className="product-card-secondary-actions"><div className="product-card-secondary-actions"><button className="ghost" onClick={()=>openProduct(p)}>التفاصيل</button><button type="button" className={favoriteIds.includes(p.id)?"catalog-favorite active":"catalog-favorite"} aria-pressed={favoriteIds.includes(p.id)} aria-label={favoriteIds.includes(p.id)?"إزالة من المفضلة":"إضافة إلى المفضلة"} onClick={()=>toggleFavorite(p.id)}>{favoriteIds.includes(p.id)?"♥":"♡"}</button></div><button type="button" className={compareIds.includes(p.id)?"compare-toggle active":"compare-toggle"} aria-pressed={compareIds.includes(p.id)} onClick={()=>toggleCompare(p.id)}>{compareIds.includes(p.id)?"✓ في المقارنة":"مقارنة"}</button></div><button className="add-button" disabled={p.availableQuantity<1||price<=0} onClick={()=>void add(p)}>{q>0?"إضافة أخرى":"إضافة للسلة"}</button></div></article>})}</div><div className="catalog-pagination" aria-label="تصفح الكتالوج"><span>صفحة {catalogPage+1}</span><div><button type="button" className="ghost" onClick={()=>setCatalogPage(p=>Math.max(0,p-1))} disabled={catalogPage===0||loading}>السابق</button><button type="button" className="ghost" onClick={()=>setCatalogPage(p=>p+1)} disabled={!catalogHasMore||loading}>التالي</button></div></div></>:<div className="empty-state catalog-empty"><strong>{query||categoryId||activeCatalogFilters>0?'لم نجد أصنافًا مطابقة':'لا توجد أصناف متاحة حاليًا.'}</strong><span>{query||categoryId||activeCatalogFilters>0?'جرّب تعديل البحث أو الفلاتر ثم أعد المحاولة.':'تحقق من اتصال الحساب أو أعد المحاولة.'}</span><div className="catalog-empty-actions"><button type="button" onClick={()=>{setQuery('');setCategoryId(null);setCatalogStockFilter('all');setCatalogPriceFilter('all');setCatalogPage(0);}}>مسح الفلاتر</button><button type="button" className="ghost" onClick={()=>void loadData()}>إعادة المحاولة</button></div></div>}
      </>}
      {catalogFilterOpen&&<div className="modal-backdrop" data-dialog-backdrop onClick={()=>setCatalogFilterOpen(false)}><section className="modal catalog-filter-dialog" role="dialog" aria-modal="true" aria-labelledby="catalog-filter-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">تصفية الكتالوج</span><h2 id="catalog-filter-title">فلاتر المتجر</h2><small>الفلاتر تعمل على البيانات المصرح بها للحساب الحالي ولا تغيّر مصدر الحقيقة.</small></div><button type="button" aria-label="إغلاق الفلاتر" onClick={()=>setCatalogFilterOpen(false)}>×</button></div><div className="catalog-filter-grid"><fieldset><legend>التوفر</legend><label><input type="radio" name="catalog-stock" checked={catalogStockFilter==='all'} onChange={()=>setCatalogStockFilter('all')}/> الكل</label><label><input type="radio" name="catalog-stock" checked={catalogStockFilter==='available'} onChange={()=>setCatalogStockFilter('available')}/> متوفر فقط</label><label><input type="radio" name="catalog-stock" checked={catalogStockFilter==='out'} onChange={()=>setCatalogStockFilter('out')}/> غير متوفر</label></fieldset><fieldset><legend>السعر المصرّح</legend><label><input type="radio" name="catalog-price" checked={catalogPriceFilter==='all'} onChange={()=>setCatalogPriceFilter('all')}/> الكل</label><label><input type="radio" name="catalog-price" checked={catalogPriceFilter==='priced'} onChange={()=>setCatalogPriceFilter('priced')}/> بسعر أساسي مصرح</label><label><input type="radio" name="catalog-price" checked={catalogPriceFilter==='missing'} onChange={()=>setCatalogPriceFilter('missing')}/> بدون سعر أساسي</label></fieldset></div><div className="catalog-filter-preview"><strong>{filteredProducts.length.toLocaleString('ar')} نتيجة قبل الترتيب</strong><span>{activeCatalogFilters?activeCatalogFilters+' فلاتر نشطة':'لا توجد فلاتر إضافية'}</span></div><div className="order-detail-actions"><button type="button" className="ghost" onClick={()=>{setCatalogStockFilter('all');setCatalogPriceFilter('all');}}>مسح الفلاتر</button><button type="button" onClick={()=>{setCatalogPage(0);setCatalogFilterOpen(false);}}>إغلاق وتطبيق</button></div></section></div>}
      {pricingOpen&&<div className="modal-backdrop" data-dialog-backdrop onClick={()=>setPricingOpen(false)}><section className="modal customer-pricing-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-pricing-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">أسعار حسابك</span><h2 id="customer-pricing-title">قائمة الأسعار</h2><small>{online?'الأسعار معروضة من بيانات التسعير المصرّح بها للحساب الحالي.':'أنت دون اتصال؛ الأسعار المحفوظة قديمة وليست مصدر الحقيقة.'}</small></div><button type="button" aria-label="إغلاق قائمة الأسعار" onClick={()=>setPricingOpen(false)}>×</button></div><div className="customer-pricing-toolbar"><label><span>بحث في الأصناف</span><input aria-label="بحث قائمة الأسعار" value={pricingQuery} onChange={e=>setPricingQuery(e.target.value)} placeholder="اسم الصنف أو SKU…"/></label><span className="customer-pricing-count">{filteredPricingProducts.length.toLocaleString('ar')} صنف</span></div>{loading&&!products.length?<div className="customer-pricing-loading" role="status" aria-label="جارٍ تحميل الأسعار">{Array.from({length:4}).map((_,i)=><article key={i}><i/><i/><i/></article>)}</div>:!products.length?<div className="empty-state"><strong>لا توجد بيانات أسعار محملة</strong><span>أعد تحميل الكتالوج للحصول على أسعار الحساب المصرّح بها.</span><button type="button" onClick={()=>void loadData()}>إعادة المحاولة</button></div>:!filteredPricingProducts.length?<div className="empty-state"><strong>لا توجد أسعار مطابقة</strong><span>جرّب اسمًا أو SKU مختلفًا.</span><button type="button" className="ghost" onClick={()=>setPricingQuery('')}>مسح البحث</button></div>:<><div className="customer-pricing-list" role="table" aria-label="قائمة أسعار العميل"><div className="customer-pricing-row pricing-head" role="row"><span>الصنف</span><span>السعر الحالي</span><span>شرائح الكمية</span><span>الحالة</span></div>{filteredPricingProducts.slice(activePricingPage*pricingPageSize,(activePricingPage+1)*pricingPageSize).map(p=>{const base=effectivePrice(p,1);const productTiers=tiers[p.id]??[];return <div className="customer-pricing-row" role="row" key={p.id}><span><strong>{p.name}</strong><small>{p.sku} · {p.unit}</small></span><strong>{base>0?money(base,p.priceCurrency??'YER'):'غير مصرح'}</strong><span>{productTiers.length?productTiers.map(t=><b key={t.min_quantity}>من {t.min_quantity} · {money(t.unit_price,t.currency)}</b>):'سعر الحساب الأساسي فقط'}</span><span className={base>0?'pricing-authorized':'pricing-unavailable'}>{base>0?'مصرّح':'غير متاح'}</span></div>})}</div><div className="catalog-pagination customer-pricing-pagination" aria-label="صفحات الأسعار"><span>صفحة {activePricingPage+1} / {pricingPages}</span><div><button type="button" className="ghost" onClick={()=>setPricingPage(p=>Math.max(0,p-1))} disabled={activePricingPage===0}>السابق</button><button type="button" className="ghost" onClick={()=>setPricingPage(p=>Math.min(pricingPages-1,p+1))} disabled={activePricingPage>=pricingPages-1}>التالي</button></div></div></>}</section></div>}
      {section==='orders'&&<CustomerOrdersPanel orders={orders} loading={loading} detailBusy={orderDetailBusy} productsCount={products.length} onOpenDetail={openOrderDetail} onReload={()=>void loadData()} onReorder={async(order)=>{try{const detail=await getCustomerOrderDetail(order.id);await reorderOrderItems(detail.items);}catch(e){setError(e instanceof Error?e.message:'تعذر إعادة الطلب.');}}}/>}
      {section==='templates'&&config.showTemplates&&<section className="content-card customer-templates-panel">
        <div className="section-title">
          <div><span className="eyebrow">طلبات دورية</span><h2>القوالب والطلبات المحفوظة</h2><p>ابحث في طلباتك المحفوظة، راجع محتوياتها ثم أعد تطبيق القالب على السلة.</p></div>
          <span>{templates.length}/{config.maxTemplates} قوالب</span>
        </div>
        <div className="template-save">
          <input value={templateName} onChange={e=>setTemplateName(e.target.value)} placeholder="اسم القالب الجديد" aria-label="اسم القالب الجديد"/>
          <button disabled={busy||!templateName.trim()||!cart.length} onClick={()=>void saveTemplate()}>حفظ السلة كقالب</button>
        </div>
        <div className="template-toolbar" role="search" aria-label="البحث في القوالب">
          <label><span>بحث</span><input value={templateQuery} onChange={e=>setTemplateQuery(e.target.value)} placeholder="اسم القالب أو الفرع أو SKU أو الصنف…" disabled={loading}/></label>
          <label><span>الترتيب</span><select value={templateSort} onChange={e=>setTemplateSort(e.target.value as TemplateViewSort)} disabled={loading}><option value="updated">الأحدث تحديثًا</option><option value="name">الاسم</option><option value="largest">الأكثر أصنافًا</option><option value="smallest">الأقل أصنافًا</option></select></label>
          <button type="button" className="ghost" onClick={()=>{setTemplateQuery('');setTemplateSort('updated');}} disabled={loading||(!templateQuery&&templateSort==='updated')}>مسح</button>
          <button type="button" className="ghost" onClick={()=>void loadData()} disabled={loading||busy}>تحديث</button>
        </div>
        {loading ? <div className="template-loading-skeleton" role="status" aria-label="جارٍ تحميل القوالب">{Array.from({length:4}).map((_,index)=><article key={index}><div><i/><i/></div><span/><span/><b/></article>)}</div>
        : !templates.length ? <div className="empty-state template-empty"><strong>لا توجد قوالب محفوظة بعد.</strong><span>احفظ السلة الحالية كقالب لتكرار الطلبات الدورية دون إعادة إدخال الأصناف.</span><button type="button" onClick={()=>navigate('catalog')}>ابدأ من الكتالوج</button></div>
        : !filteredTemplates.length ? <div className="empty-state template-empty"><strong>لا توجد قوالب مطابقة.</strong><span>وسّع البحث أو استخدم مسح المرشح للعودة إلى جميع القوالب.</span><button type="button" onClick={()=>setTemplateQuery('')}>مسح البحث</button></div>
        : <>
          <div className="template-results-context"><span>{filteredTemplates.length} نتيجة مطابقة</span><span>صفحة {pagedTemplates.page} / {pagedTemplates.pages}</span></div>
          <div className="template-grid">{pagedTemplates.items.map(t=><article className="template-card template-card-rich" key={t.id}>
            <div className="template-card-head"><div><span className="eyebrow">قالب طلب</span><strong>{t.name}</strong><small>{t.branchLabel} · آخر تحديث {new Date(t.updatedAt).toLocaleDateString('ar-YE')}</small></div><span className="template-count">{t.lines.length} أصناف</span></div>
            <div className="template-line-preview" aria-label={'معاينة محتويات '+t.name}>{t.lines.slice(0,3).map(line=><span key={line.productId}><b>{line.quantity}×</b>{line.name}</span>)}{t.lines.length>3&&<span className="template-more-lines">+{t.lines.length-3} أصناف أخرى</span>}</div>
            <div className="template-card-actions"><button type="button" onClick={()=>setSelectedTemplate(t)}>التفاصيل</button><button type="button" onClick={()=>void applyTemplate(t)} disabled={busy}>إعادة الطلب</button><button type="button" className="danger-button" onClick={()=>setDeleteTemplateId(t.id)} disabled={busy}>حذف</button></div>
          </article>)}</div>
          <div className="directory-pagination" aria-label="صفحات القوالب"><span>عرض {((pagedTemplates.page-1)*8)+1}–{Math.min(pagedTemplates.page*8,filteredTemplates.length)} من {filteredTemplates.length}</span><div><button type="button" className="ghost" onClick={()=>setTemplatePage(p=>Math.max(1,p-1))} disabled={pagedTemplates.page===1}>السابق</button><button type="button" className="ghost" onClick={()=>setTemplatePage(p=>Math.min(pagedTemplates.pages,p+1))} disabled={pagedTemplates.page===pagedTemplates.pages}>التالي</button></div></div>
        </>}
        {selectedTemplate&&<div className="modal-backdrop" onClick={()=>setSelectedTemplate(null)}><section className="modal template-detail-modal" role="dialog" aria-modal="true" aria-labelledby="template-detail-title" onClick={e=>e.stopPropagation()}>
          <div className="modal-head"><div><span className="eyebrow">تفاصيل القالب</span><h2 id="template-detail-title">{selectedTemplate.name}</h2><small>{selectedTemplate.branchLabel} · {selectedTemplate.lines.length} أصناف</small></div><button type="button" aria-label="إغلاق التفاصيل" autoFocus onClick={()=>setSelectedTemplate(null)}>×</button></div>
          <div className="template-detail-list">{selectedTemplate.lines.map(line=><article key={line.productId}><div><strong>{line.name}</strong><small>{line.sku} · {line.unit}</small></div><span>{line.quantity.toLocaleString('ar-YE')} وحدة</span></article>)}</div>
          <div className="order-detail-actions"><button type="button" onClick={()=>void applyTemplate(selectedTemplate)} disabled={busy}>إعادة تطبيق على السلة</button><button type="button" className="ghost" onClick={()=>setSelectedTemplate(null)}>إغلاق</button></div>
        </section></div>}
        {deleteTemplateId&&(()=>{const target=templates.find(item=>item.id===deleteTemplateId);if(!target)return null;return <div className="modal-backdrop" onClick={()=>!busy&&setDeleteTemplateId(null)}><section className="modal template-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="template-delete-title" onClick={e=>e.stopPropagation()}>
          <div className="modal-head"><div><span className="eyebrow">إجراء حذفي</span><h2 id="template-delete-title">حذف «{target.name}»؟</h2><small>سيُحذف القالب المحفوظ من حسابك. لا يتم حذف أي طلب سابق أو أصناف من الكتالوج.</small></div><button type="button" aria-label="إلغاء الحذف" onClick={()=>setDeleteTemplateId(null)} disabled={busy}>×</button></div>
          <div className="template-delete-warning">هذا الإجراء لا يمكن التراجع عنه.</div>
          <div className="order-detail-actions"><button type="button" className="danger-button" onClick={()=>void removeTemplate(target.id)} disabled={busy}>{busy?'جارٍ الحذف…':'تأكيد حذف القالب'}</button><button type="button" className="ghost" onClick={()=>setDeleteTemplateId(null)} disabled={busy}>إلغاء</button></div>
        </section></div>})()}
      </section>}
      {section==='account'&&<CustomerAccountWorkspace customerName={customerName} email={email} phone={customerPhone} customerId={customerId} organizationName={organizationName} organizationId={organizationId} customerTier={customerTier} warehouseName={warehouseName} warehouseId={warehouseId} sessionUserId={sessionUserId} online={online} offlineSyncing={offlineSyncing} busy={busy} accentColor={config.accentColor} compactMode={config.compactMode} onRefresh={()=>void refreshAccount()} onLogout={()=>void logout()} onNavigate={navigate} />}
      {section==='notifications'&&<NotificationPanel audience="customer"/>}
      {section==='finance' && config.showCredit && <CustomerFinancePanel customerId={customerId} online={online} openFirstInvoiceRequest={customerInvoiceOpenRequest} />}
      {error&&<div className="error-banner" role="alert">{error}</div>}{message&&<div className="success" role="status">{message}</div>}
    </main></div>
    <nav className="customer-mobile-dock" aria-label="تنقل سريع للمشتري">
      <button type="button" className={section==="home"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("home")}}><span aria-hidden="true">⌂</span><small>الرئيسية</small></button>
      <button type="button" className={section==="catalog"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("catalog")}}><span aria-hidden="true">▣</span><small>الكتالوج</small></button>
      <button type="button" className={section==="orders"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("orders")}}><span aria-hidden="true">🧾</span><small>طلباتي</small></button>
      <button type="button" className="dock-cart" onClick={()=>{setMobileMoreOpen(false);setCartOpen(true)}}><span aria-hidden="true">🛒</span><small>السلة</small>{cartCount>0&&<b>{cartCount}</b>}</button>
      <button type="button" className={section==="account"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("account")}}><span aria-hidden="true">♙</span><small>حسابي</small></button>
      <button type="button" className={mobileMoreOpen?"active":""} aria-expanded={mobileMoreOpen} aria-controls="customer-mobile-more-menu" onClick={()=>setMobileMoreOpen(value=>!value)}><span aria-hidden="true">⋯</span><small>المزيد</small></button>
    </nav>
    {mobileMoreOpen&&<div className="customer-mobile-more-backdrop" role="presentation" onClick={()=>setMobileMoreOpen(false)}>
      <section className="customer-mobile-more-menu" id="customer-mobile-more-menu" role="dialog" aria-modal="true" aria-labelledby="customer-mobile-more-title" onClick={event=>event.stopPropagation()}>
        <div className="customer-mobile-more-head"><div><span className="eyebrow">تنقل إضافي</span><strong id="customer-mobile-more-title">المزيد من بوابة الأغبري</strong></div><button type="button" className="ghost" aria-label="إغلاق القائمة" onClick={()=>setMobileMoreOpen(false)}>×</button></div>
        <div className="customer-mobile-more-grid">
          {config.showTemplates&&<button type="button" className={section==="templates"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("templates")}}><span>▤</span><strong>القوالب</strong><small>طلباتك المحفوظة وإعادة استخدامها</small></button>}
          <button type="button" className={section==="notifications"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("notifications")}}><span>🔔</span><strong>الإشعارات</strong><small>تنبيهات الحساب والطلبات</small></button>
          {config.showCredit&&<button type="button" aria-label="المركز المالي" className={section==="finance"?"active":""} onClick={()=>{setMobileMoreOpen(false);navigate("finance")}}><span>◫</span><strong>المركز المالي</strong><small>الفواتير والمدفوعات والكشف</small></button>}
        </div>
      </section>
    </div>}
    {invitationOpen&&<div className="modal-backdrop" data-dialog-backdrop onClick={()=>setInvitationOpen(false)}><section className="modal invitation-help-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-help-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">دعوات الحساب</span><h2 id="invitation-help-title">قبول دعوة المؤسسة</h2><small>الدعوات تُقبل من الرابط المباشر المرسل إلى البريد المرتبط بالحساب. بوابة العميل لا تنشئ دعوات ولا تعرض روابط دعوات غير موجودة.</small></div><button type="button" aria-label="إغلاق معلومات الدعوات" onClick={()=>setInvitationOpen(false)}>×</button></div><div className="state-panel" data-state="info"><strong>لديك رابط دعوة؟</strong><small>افتح رابط الدعوة مباشرة لإكمال القبول. بعد اكتمال القبول يمكنك العودة إلى بوابة الأغبري وتسجيل الدخول بالسياق الجديد.</small></div><div className="order-detail-actions"><button type="button" className="ghost" onClick={()=>setInvitationOpen(false)}>إغلاق</button></div></section></div>}
    {selectedProduct&&<div className="modal-backdrop" onClick={()=>setSelectedProduct(null)}><section className="modal product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">تفاصيل الصنف</span><h2 id="product-detail-title">{selectedProduct.name}</h2></div><button aria-label="إغلاق تفاصيل الصنف" onClick={()=>setSelectedProduct(null)}>×</button></div><div className="product-detail-grid">{selectedProduct.imageUrl?<img src={selectedProduct.imageUrl} alt={selectedProduct.name}/>:<div className="product-placeholder large">{selectedProduct.name.slice(0,1)}</div>}<div><div className="product-detail-identity"><span className="sku">{selectedProduct.sku}</span><button type="button" className="copy-sku-button" onClick={()=>void copyProductSku(selectedProduct)}>نسخ SKU</button></div><p>{selectedProduct.description||'لا يوجد وصف إضافي لهذا الصنف.'}</p><div className="detail-facts"><span>الوحدة <strong>{selectedProduct.unit}</strong></span><label className="detail-quantity-control"><span>الكمية المطلوبة</span><input type="number" min="1" max={Math.min(selectedProduct.availableQuantity,MAX_ORDER_QUANTITY_PER_LINE)} value={catalogQuantityDrafts[selectedProduct.id] ?? '1'} onChange={e=>setCatalogQuantityDrafts(c=>({...c,[selectedProduct.id]:e.target.value}))} onBlur={()=>void applyCatalogQuantity(selectedProduct,catalogQuantityDrafts[selectedProduct.id] ?? '1')} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();void applyCatalogQuantity(selectedProduct,catalogQuantityDrafts[selectedProduct.id] ?? '1')}}}/></label><span>التصنيف <strong>{selectedProduct.category}</strong></span><span>المتاح <strong>{selectedProduct.availableQuantity}</strong></span><span>في السلة <strong>{cart.find(l=>l.product.id===selectedProduct.id)?.quantity??0}</strong></span></div>{effectivePrice(selectedProduct,1)>0?<div className="price-row"><strong>{money(effectivePrice(selectedProduct,1), selectedProduct.priceCurrency ?? 'YER')}</strong></div>:<div className="price-hidden">السعر حسب حسابك</div>}<div className="detail-tier-list">{(tiers[selectedProduct.id]??[]).map(t=><span key={t.min_quantity}>من {t.min_quantity} · {money(t.unit_price,t.currency)}</span>)}</div><button className="add-button" disabled={selectedProduct.availableQuantity<1||effectivePrice(selectedProduct,1)<=0} onClick={async()=>{if(await add(selectedProduct))setSelectedProduct(null);}}>إضافة للسلة</button></div></div></section></div>}
      {section==='home'&&<CustomerSavedShelf favorites={favoriteIds.map(id=>products.find(p=>p.id===id)).filter(Boolean) as PricedProduct[]} recent={recentProductIds.map(id=>products.find(p=>p.id===id)).filter(Boolean) as PricedProduct[]} onOpen={(product)=>openProduct(product as PricedProduct)} onAdd={(product)=>add(product,1,false)} onToggleFavorite={toggleFavorite} />}
      <ProductCompareTray products={products} selectedIds={compareIds} onToggle={toggleCompare} onOpenProduct={(product)=>setSelectedProduct(product as PricedProduct)} onAdd={(product)=>add(product,1,false)} getPrice={(product)=>effectivePrice(product,1)} />
    {selectedOrder&&<div className="modal-backdrop" onClick={()=>setSelectedOrder(null)}><section className="modal order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="customer-order-detail-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">تتبع الطلب</span><h2 id="customer-order-detail-title">طلب #{selectedOrder.order_number}</h2></div><button onClick={()=>setSelectedOrder(null)}>×</button></div><div className="order-detail-summary"><strong>{money(selectedOrder.total,selectedOrder.currency)}</strong><span className={`status status-${selectedOrder.status}`}>{selectedOrder.statusLabel}</span><small>{new Date(selectedOrder.created_at).toLocaleString('ar-YE')}</small></div><div className="timeline">{selectedOrder.timeline.map((step,index)=><div className={`timeline-step ${step.active?'done':''}`} key={`${step.status}-${index}`}><span>{step.active?'✓':index+1}</span><label>{step.label}</label></div>)}</div><div className="order-detail-lines">{selectedOrder.items.map(item=><div key={item.id}><div><strong>{item.name}</strong><small>{item.sku} · {item.unit}</small></div><span>{item.quantity} × {money(item.unit_price,item.currency)}</span><strong>{money(item.line_total,item.currency)}</strong></div>)}</div><div className="order-detail-actions"><button onClick={()=>void reorderOrderItems(selectedOrder.items)} disabled={busy}>إعادة الطلب</button><button className="ghost" onClick={()=>setSelectedOrder(null)}>إغلاق</button></div></section></div>}
    {quickOpen&&config.showQuickOrder&&<div className="modal-backdrop" onClick={()=>setQuickOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="quick-order-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2 id="quick-order-title">الطلب السريع</h2><button onClick={()=>setQuickOpen(false)}>×</button></div><p>أدخل SKU والكمية بسرعة.</p><QuickOrder products={products} warehouseId={warehouseId} onAdd={add}/></section></div>}
    {excelOpen&&<div className="modal-backdrop" onClick={()=>!excelBusy&&setExcelOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="excel-review-title" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2 id="excel-review-title">مراجعة الطلب من Excel</h2><button disabled={excelBusy} onClick={()=>setExcelOpen(false)}>×</button></div><p>تم تحليل الملف والتحقق من المعرفات والكميات والمخزون. لن تدخل البيانات السلة قبل اعتمادك.</p><div className="excel-review">{excelRows.map((row,index)=><div className="excel-row" key={`${row.identifier}-${index}`}><strong>{row.identifier||'—'}</strong><span>{row.quantity||'—'}</span><span>{row.product?.name??'غير مطابق'}</span><span className={row.error?'error-text':'ok-text'}>{row.error??'جاهز'}</span></div>)}</div><button className="checkout" disabled={excelBusy||excelRows.some(row=>Boolean(row.error)||!row.product)} onClick={()=>void confirmQuickExcel()}>{excelBusy?'جارٍ اعتماد الملف…':'اعتماد وإضافة إلى السلة'}</button></section></div>}
    {cartOpen&&<div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h2 id="cart-drawer-title">السلة · {cartCount}</h2><CustomerCartReadiness online={online} quantitiesConfirmed={!config.requireQuantityConfirmation||cart.every(l=>Boolean(confirmed[l.product.id]))} minOrderValue={config.minOrderValue} total={total} cartCount={cartCount} cartLines={cart.length} validLines={cart.length>0&&cart.every(l=>l.product.status==='active'&&l.quantity>0&&l.quantity<=l.product.availableQuantity&&effectivePrice(l.product,l.quantity)>0)} showPaymentMethods={config.showPaymentMethods} paymentAvailable={PAYMENT_OPTIONS.some(option=>option.key===payment&&config[option.field])} /><button aria-label="إغلاق السلة" onClick={()=>setCartOpen(false)}>×</button></div>{cart.length ? cart.map(l=>{const next=nextTier(l.product,l.quantity);return <div className="drawer-line" key={l.product.id}><div><strong>{l.product.name}</strong><small>{money(l.unitPrice,(l.product as PricedProduct).priceCurrency ?? finance?.currency ?? 'YER')} / {l.product.unit}</small>{config.showSavingsCalculator&&next&&<small className="saving">تبقى {next.min_quantity-l.quantity} للوصول للسعر التالي</small>}</div><div className="quantity"><button type="button" onClick={()=>void update(l.product.id,l.quantity-1)}>−</button><input className="product-qty-input drawer-quantity-input" aria-label={"كمية "+l.product.name+" في السلة"} type="number" min="1" max={Math.min(l.product.availableQuantity,MAX_ORDER_QUANTITY_PER_LINE)} value={catalogQuantityDrafts[l.product.id] ?? String(l.quantity)} onChange={e=>setCatalogQuantityDrafts(c=>({...c,[l.product.id]:e.target.value}))} onBlur={()=>void applyCatalogQuantity(l.product as PricedProduct,catalogQuantityDrafts[l.product.id] ?? String(l.quantity))} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();void applyCatalogQuantity(l.product as PricedProduct,catalogQuantityDrafts[l.product.id] ?? String(l.quantity))}}} /><button type="button" onClick={()=>void update(l.product.id,l.quantity+1)} disabled={l.quantity>=Math.min(l.product.availableQuantity,MAX_ORDER_QUANTITY_PER_LINE)}>+</button></div>{config.requireQuantityConfirmation&&<button className={confirmed[l.product.id]?'confirmed':'confirm'} onClick={()=>setQtyConfirmed(l.product.id,!confirmed[l.product.id])}>{confirmed[l.product.id]?'✓ معتمد':'اعتماد الكمية'}</button>}</div>}) : <div className="cart-empty cart-empty-primary"><strong>سلتك فارغة حاليًا.</strong><span>أضف الأصناف من الكتالوج أو استخدم الطلب السريع لبدء طلب جديد.</span><button type="button" onClick={()=>{setCartOpen(false);navigate('catalog');}}>العودة إلى الكتالوج</button></div>}<div className="drawer-total"><span>الإجمالي</span><strong>{money(total,(cart[0]?.product as PricedProduct)?.priceCurrency ?? finance?.currency ?? 'YER')}</strong></div>{config.showPaymentMethods&&<div className="payment-box"><strong>طريقة الدفع</strong>{PAYMENT_OPTIONS.filter(x=>config[x.field]).map(x=><label key={x.key}><input type="radio" checked={payment===x.key} onChange={()=>setPayment(x.key)}/>{x.label}</label>)}</div>}{config.showTemplates&&<label className="template-inline"><input value={templateName} onChange={e=>setTemplateName(e.target.value)} placeholder="حفظ كقالب"/><button disabled={busy||!templateName.trim()} onClick={()=>void saveTemplate()}>حفظ</button></label>}<button className="checkout" disabled={busy||!cart.length} onClick={()=>setCheckoutOpen(true)}>متابعة إلى إتمام الطلب</button></aside></div>}
    {checkoutOpen&&<div className="modal-backdrop" onClick={()=>!busy&&setCheckoutOpen(false)}><section className="modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><div><span className="eyebrow">Checkout · الخطوة الأخيرة</span><h2 id="checkout-title">مراجعة وإرسال الطلب</h2><small>راجع الكميات وطريقة الدفع قبل إنشاء الطلب. لا يتم إنشاء أي طلب حتى تضغط زر الاعتماد.</small></div><button type="button" aria-label="إغلاق إتمام الطلب" onClick={()=>setCheckoutOpen(false)} disabled={busy}>×</button></div>
      <CustomerCartReadiness online={online} quantitiesConfirmed={!config.requireQuantityConfirmation||cart.every(l=>Boolean(confirmed[l.product.id]))} minOrderValue={config.minOrderValue} total={total} cartCount={cartCount} cartLines={cart.length} validLines={cart.length>0&&cart.every(l=>l.product.status==='active'&&l.quantity>0&&l.quantity<=l.product.availableQuantity&&effectivePrice(l.product,l.quantity)>0)} showPaymentMethods={config.showPaymentMethods} paymentAvailable={PAYMENT_OPTIONS.some(option=>option.key===payment&&config[option.field])} />
      <div className="checkout-readiness" role="status"><span className={online?'ready':'blocked'}>{online?'● الاتصال بالخادم متاح':'○ الاتصال غير متاح'}</span><span>{cart.length} أصناف · {cartCount} وحدة</span><span>{config.requireQuantityConfirmation ? (cart.every(l=>confirmed[l.product.id])?'✓ الكميات معتمدة':'! توجد كميات تحتاج اعتمادًا') : '✓ اعتماد الكميات غير مطلوب'}</span></div>
      <div className="checkout-lines">{cart.map(line=><article key={line.product.id}><div><strong>{line.product.name}</strong><small>{line.product.sku} · {line.product.unit}</small></div><span>{line.quantity.toLocaleString('ar-YE')} × {money(line.unitPrice,(line.product as PricedProduct).priceCurrency ?? finance?.currency ?? 'YER')}</span><strong>{money(line.unitPrice*line.quantity,(line.product as PricedProduct).priceCurrency ?? finance?.currency ?? 'YER')}</strong></article>)}</div>
      <div className="checkout-summary-grid"><div><small>الإجمالي</small><strong>{money(total,(cart[0]?.product as PricedProduct)?.priceCurrency ?? finance?.currency ?? 'YER')}</strong></div><div><small>الدفع</small><strong>{PAYMENT_OPTIONS.find(option=>option.key===payment)?.label ?? '—'}</strong></div><div><small>الحد الأدنى</small><strong>{config.minOrderValue>0?money(config.minOrderValue):'غير مطبق'}</strong></div><div><small>الحد الأعلى</small><strong>{config.maxOrderValue>0?money(config.maxOrderValue):'غير مطبق'}</strong></div></div>
      {config.showPaymentMethods&&<div className="payment-box checkout-payment-box"><strong>طريقة الدفع</strong>{PAYMENT_OPTIONS.filter(x=>config[x.field]).map(x=><label key={x.key}><input type="radio" checked={payment===x.key} onChange={()=>setPayment(x.key)}/>{x.label}</label>)}</div>}
      {config.requireQuantityConfirmation&&!cart.every(l=>confirmed[l.product.id])&&<div className="checkout-blocker" role="alert">اعتمد جميع الكميات من السلة قبل إرسال الطلب.</div>}
      {!online&&<div className="checkout-blocker" role="alert">الطلب ينتظر عودة الاتصال؛ لا يمكن إنشاء معاملة خارج الاتصال.</div>}
      {config.minOrderValue>0&&total<config.minOrderValue&&<div className="checkout-blocker" role="alert">قيمة الطلب أقل من الحد الأدنى المطبق.</div>}
      {config.maxOrderValue>0&&total>config.maxOrderValue&&<div className="checkout-blocker" role="alert">قيمة الطلب تتجاوز الحد الأعلى المطبق.</div>}
      <div className="order-detail-actions"><button type="button" className="ghost" onClick={()=>{setCheckoutOpen(false);setCartOpen(true)}} disabled={busy}>العودة للسلة</button><button type="button" onClick={()=>void submit()} disabled={busy||!cart.length}>{busy?'جارٍ إنشاء الطلب…':'اعتماد وإنشاء الطلب'}</button></div>
    </section></div>}
  </div>;
}

function QuickOrder({products,warehouseId,onAdd}:{products:Product[];warehouseId:string|null;onAdd:(p:Product,q?:number)=>Promise<boolean>}){const [sku,setSku]=useState('');const [qty,setQty]=useState('1');const [resolved,setResolved]=useState<Product|null>(null);const [resolving,setResolving]=useState(false);const [lookupError,setLookupError]=useState('');const normalized=sku.trim().toLowerCase();const local=products.find(p=>p.sku.toLowerCase()===normalized)??null;const found=local??resolved;const numericQty=Number(qty);const validQty=Number.isSafeInteger(numericQty)&&numericQty>=1&&numericQty<=MAX_ORDER_QUANTITY_PER_LINE;useEffect(()=>{setResolved(null);setLookupError('');},[sku]);async function resolveAndAdd(){if(!validQty||resolving)return;setResolving(true);setLookupError('');try{let product=found;if(!product){if(!warehouseId){setLookupError('لا يوجد مستودع تشغيلي متاح للبحث عن الصنف.');return;}const rows=await getCatalog(sku.trim(),null,5,0,warehouseId);const exact=rows.find(item=>item.sku.toLowerCase()===normalized||(item.barcode??'').toLowerCase()===normalized);if(exact){product=mapProduct(exact,'أصناف');setResolved(product);}}if(!product){setLookupError('لم يتم العثور على SKU أو باركود مصرح به لهذا الحساب.');return;}if(await onAdd(product,numericQty)){setSku('');setResolved(null);}}catch(e){setLookupError(e instanceof Error?e.message:'تعذر البحث عن الصنف.');}finally{setResolving(false);}}return <div className="quick-editor"><input aria-label="SKU أو باركود المنتج" value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU أو الباركود"/><input aria-label="الكمية" value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1" max={MAX_ORDER_QUANTITY_PER_LINE} placeholder={`الكمية (حتى ${MAX_ORDER_QUANTITY_PER_LINE})`}/><button disabled={resolving||!validQty} onClick={()=>void resolveAndAdd()}>{resolving?'جارٍ البحث…':'إضافة'}</button>{found&&<div className="quick-result" role="status">{found.name} · متاح {found.availableQuantity} {found.unit}</div>}{lookupError&&<div className="error-banner" role="alert">{lookupError}</div>}</div>}
