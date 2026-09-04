import { useEffect, useMemo, useState } from 'react';
import type { CartLine, CustomerTier, Product } from './domain/types';
import { calculateClientPreviewTotal } from './domain/order';
import { formatMoney } from './domain/pricing';
import { getCatalog, type CatalogItem } from './services/catalog';
import { supabase } from './lib/supabase';
import './styles.css';

const demoProducts: Product[] = [
  ['FOOD-001','أرز بسمتي 10 كجم','كيس','الأرز',120], ['FOOD-002','سكر أبيض 50 كجم','كيس','السكر',75],
  ['FOOD-003','زيت دوار الشمس 1.5 لتر','كرتون','الزيوت',48], ['FOOD-004','دقيق أبيض 50 كجم','كيس','الدقيق',63],
  ['FOOD-005','حليب بودرة 2.5 كجم','كرتون','الألبان',31], ['FOOD-006','مكرونة 400 جم','كرتون','المعكرونة',96]
].map(([sku,name,unit,category,qty], i) => ({ id:`demo-${i+1}`, sku, name, unit, category, availableQuantity:Number(qty), status:'active' as const }));
const demoPrices: Record<CustomerTier, number[]> = { retail:[18500,14500,7200,12500,16800,6100], wholesale:[17600,13750,6850,11800,15900,5800], distributor:[16800,13100,6500,11200,15100,5500] };

function mapCatalogItem(item: CatalogItem): Product & { authorizedPrice?: number } {
  return { id:item.id, sku:item.sku, name:item.name, unit:item.unit, category:item.category_id ?? 'أصناف', description:item.description ?? undefined, availableQuantity:item.available_quantity, status:item.status === 'active' ? 'active' : 'inactive', imageUrl:item.image_path ?? undefined, authorizedPrice:item.authorized_price ?? undefined };
}

export default function App() {
  const [query,setQuery]=useState(''); const [category,setCategory]=useState('الكل'); const [tier] = useState<CustomerTier>('wholesale');
  const [products,setProducts]=useState<Product[]>(demoProducts); const [serverPrices,setServerPrices]=useState<Record<string,number>>({});
  const [cart,setCart]=useState<CartLine[]>([]); const [submitted,setSubmitted]=useState(false); const [runtimeReady,setRuntimeReady]=useState(false); const [runtimeError,setRuntimeError]=useState<string|null>(null);

  useEffect(()=>{ let cancelled=false; async function load(){ if(!supabase)return; const {data:{session}}=await supabase.auth.getSession(); if(!session)return; try{const items=await getCatalog(query,null,100,0); if(cancelled)return; setProducts(items.map(mapCatalogItem)); setServerPrices(Object.fromEntries(items.map(i=>[i.id,i.authorized_price??0]))); setRuntimeReady(true); setRuntimeError(null);}catch(e){if(!cancelled)setRuntimeError(e instanceof Error?e.message:'تعذر تحميل الكتالوج');}} void load(); return()=>{cancelled=true}; },[query]);
  const categories=useMemo(()=>['الكل',...new Set(products.map(p=>p.category))],[products]);
  const filtered=useMemo(()=>products.filter(p=>(p.name.includes(query)||p.sku.toLowerCase().includes(query.toLowerCase()))&&(category==='الكل'||p.category===category)),[category,products,query]);
  const priceFor=(p:Product)=>runtimeReady?(serverPrices[p.id]??0):(demoPrices[tier][demoProducts.findIndex(x=>x.sku===p.sku)]??0); const total=calculateClientPreviewTotal(cart);
  function addToCart(product:Product){const price=priceFor(product);if(price<=0)return;setCart(current=>{const existing=current.find(l=>l.product.id===product.id);if(existing)return current.map(l=>l.product.id===product.id?{...l,quantity:Math.min(l.quantity+1,product.availableQuantity)}:l);return[...current,{product,quantity:1,unitPrice:price}]});setSubmitted(false)}
  function updateQuantity(id:string,q:number){setCart(current=>current.map(l=>l.product.id===id?{...l,quantity:Math.max(0,Math.min(q,l.product.availableQuantity))}:l).filter(l=>l.quantity>0))}
  function submitOrder(){if(cart.length)setSubmitted(true)}
  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">أ</span><div><strong>بوابة الأغبري</strong><small>للمواد الغذائية</small></div></div><nav aria-label="التنقل الرئيسي"><a className="active" href="#catalog">المنتجات</a><a href="#orders">طلباتي</a><a href="#account">حسابي</a></nav><button className="cart-button" onClick={()=>document.getElementById('cart')?.scrollIntoView({behavior:'smooth'})}>السلة <b>{cart.length}</b></button></header>
    <main><section className="hero" id="catalog"><div><span className="eyebrow">تجارة جملة أسرع</span><h1>اطلب احتياج متجرك<br/>بخطوات بسيطة.</h1><p>ابحث عن الأصناف، راجع السعر المتاح لحسابك، وعدّل الكميات مباشرة.</p></div><div className="hero-card"><span>حالة الخدمة</span><strong>{runtimeReady?'متصل':'وضع التطوير'}</strong><small>{runtimeReady?'الكتالوج والسعر مصدرهما الخادم.':'لا توجد جلسة Supabase؛ بيانات العرض تجريبية ولا تمثل صلاحية إنتاجية.'}</small></div></section>
      {runtimeError&&<div className="error-banner" role="alert">تعذر تحميل بيانات الخادم: {runtimeError}</div>}<section className="toolbar"><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث بالاسم أو SKU..." aria-label="بحث المنتجات"/></label><div className="chips">{categories.map(item=><button key={item} className={item===category?'chip selected':'chip'} onClick={()=>setCategory(item)}>{item}</button>)}</div></section>
      <section className="catalog-grid">{filtered.map(product=><article className="product-card" key={product.id}><div className="product-image" aria-hidden="true">{product.name.slice(0,1)}</div><div className="product-meta"><span>{product.category}</span><code>{product.sku}</code></div><h2>{product.name}</h2><p className="unit">الوحدة: {product.unit} · المتاح: {product.availableQuantity}</p><div className="product-footer"><strong>{priceFor(product)?formatMoney(priceFor(product)):'السعر عند الطلب'}</strong><button disabled={!priceFor(product)} onClick={()=>addToCart(product)}>أضف للسلة</button></div></article>)}{!filtered.length&&<div className="empty">لا توجد أصناف مطابقة لبحثك.</div>}</section>
      <section className="cart-panel" id="cart"><div className="section-heading"><div><span className="eyebrow">مسودة الطلب</span><h2>السلة</h2></div><span>{cart.length} أصناف</span></div>{!cart.length?<div className="cart-empty">السلة فارغة. أضف الأصناف التي تريد طلبها.</div>:<><div className="cart-lines">{cart.map(line=><div className="cart-line" key={line.product.id}><div><strong>{line.product.name}</strong><small>{formatMoney(line.unitPrice)} / {line.product.unit}</small></div><div className="quantity"><button onClick={()=>updateQuantity(line.product.id,line.quantity-1)} aria-label="إنقاص">−</button><span>{line.quantity}</span><button onClick={()=>updateQuantity(line.product.id,line.quantity+1)} aria-label="زيادة">+</button></div><strong>{formatMoney(line.unitPrice*line.quantity)}</strong></div>)}</div><div className="cart-total"><span>الإجمالي التقديري</span><strong>{formatMoney(total)}</strong></div><button className="checkout" onClick={submitOrder}>إرسال الطلب</button>{submitted&&<div className="success">المسودة جاهزة. الإرسال النهائي يجب أن يستخدم RPC الخادم مع الهوية والسعر والمخزون ومفتاح idempotency.</div>}</>}</section></main><footer>بوابة الأغبري · النظام التشغيلي للتجارة</footer></div>;
}
