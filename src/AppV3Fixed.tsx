import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import readXlsxFile from './lib/read-excel-file-browser';
import type { CartLine, Product } from './domain/types';
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
import './customer-portal-v3.css';
import './customer-portal-v3-dynamic.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer' | 'customer';
const STAFF_ROLES = new Set<UserRole>(['owner', 'admin', 'sales', 'warehouse']);
type PriceTier = { min_quantity: number; unit_price: number; currency: string };
type Finance = { currency: string; creditLimit: number; outstanding: number; available: number; entries: Array<{ id: string; reference?: string; description: string; debit: number; credit: number; due_date?: string; status: string; created_at: string }> };
type TemplateLine = { productId: string; sku: string; name: string; unit: string; quantity: number };
type OrderTemplate = { id: string; name: string; branchLabel: string; lines: TemplateLine[]; updatedAt: string };
type ClientUiConfig = {
  showSearch:boolean; showCategories:boolean; showExcel:boolean; showCredit:boolean; showTemplates:boolean; showInventory:boolean; showRetailPrice:boolean; showQuickOrder:boolean;
  requireQuantityConfirmation:boolean; showTieredPricing:boolean; showSavingsCalculator:boolean; showImageSearch:boolean; showVoiceSearch:boolean; showPaymentMethods:boolean;
  paymentOnCredit:boolean; paymentCash:boolean; paymentTransfer:boolean; minOrderValue:number; maxOrderValue:number; maxTemplates:number;
};
const DEFAULT_UI_CONFIG: ClientUiConfig = { showSearch:true, showCategories:true, showExcel:true, showCredit:true, showTemplates:true, showInventory:true, showRetailPrice:false, showQuickOrder:true, requireQuantityConfirmation:true, showTieredPricing:true, showSavingsCalculator:true, showImageSearch:false, showVoiceSearch:false, showPaymentMethods:true, paymentOnCredit:true, paymentCash:true, paymentTransfer:true, minOrderValue:0, maxOrderValue:0, maxTemplates:50 };
const PAYMENT_OPTIONS = [{key:'credit' as const,label:'آجل / ائتمان',field:'paymentOnCredit' as const},{key:'cash' as const,label:'نقدي',field:'paymentCash' as const},{key:'transfer' as const,label:'حوالة',field:'paymentTransfer' as const}];
function mapProduct(item: CatalogItem, categoryName: string, imageUrl?: string): Product { return { id:item.id, sku:item.sku, name:item.name, unit:item.unit, category:categoryName, description:item.description ?? undefined, availableQuantity:item.available_quantity, status:item.status === 'active' ? 'active' : 'inactive', imageUrl }; }
function templatesFor(customerId:string):OrderTemplate[]{ try{return JSON.parse(localStorage.getItem(`aghbari:templates:${customerId}`)??'[]') as OrderTemplate[];}catch{return[];} }
function saveTemplates(customerId:string,items:OrderTemplate[]){localStorage.setItem(`aghbari:templates:${customerId}`,JSON.stringify(items));}
function money(value:number,currency='YER'){return `${formatMoney(value)} ${currency==='YER'?'ر.ي':currency}`;}

export default function AppV3Fixed(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [signedIn,setSignedIn]=useState(false); const [ready,setReady]=useState(false); const [role,setRole]=useState<UserRole>('viewer'); const [customerId,setCustomerId]=useState<string|null>(null); const [organizationId,setOrganizationId]=useState<string|null>(null); const [warehouseId,setWarehouseId]=useState<string|null>(null); const [customerName,setCustomerName]=useState('تاجر الأغبري');
  const [config,setConfig]=useState<ClientUiConfig>(DEFAULT_UI_CONFIG); const [query,setQuery]=useState(''); const [categoryId,setCategoryId]=useState<string|null>(null); const [categories,setCategories]=useState<CategoryOption[]>([]); const [products,setProducts]=useState<Product[]>([]); const [tiers,setTiers]=useState<Record<string,PriceTier[]>>({}); const [cart,setCart]=useState<CartLine[]>([]); const [cartOpen,setCartOpen]=useState(false); const [quickOpen,setQuickOpen]=useState(false); const [section,setSection]=useState<'catalog'|'orders'|'finance'|'templates'>('catalog');
  const [orders,setOrders]=useState<CustomerOrderSummary[]>([]); const [finance,setFinance]=useState<Finance|null>(null); const [templates,setTemplates]=useState<OrderTemplate[]>([]); const [templateName,setTemplateName]=useState(''); const [confirmed,setConfirmed]=useState<Record<string,boolean>>({}); const [payment,setPayment]=useState<'credit'|'cash'|'transfer'>('credit'); const [loading,setLoading]=useState(false); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  const loadConfig=useCallback(async(orgId:string)=>{ if(!supabase)return; const {data}=await supabase.from('client_ui_settings').select('config').eq('organization_id',orgId).maybeSingle(); setConfig(data?.config?{...DEFAULT_UI_CONFIG,...(data.config as Partial<ClientUiConfig>)}:DEFAULT_UI_CONFIG); },[]);