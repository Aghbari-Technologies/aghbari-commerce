import type { Product } from './domain/types';

export default function CustomerSavedShelf({favorites,recent,onOpen,onAdd,onToggleFavorite}:{favorites:Product[];recent:Product[];onOpen:(product:Product)=>void;onAdd:(product:Product)=>Promise<boolean>;onToggleFavorite:(id:string)=>void}){
 const render=(items:Product[],emptyTitle:string,emptyText:string)=>items.length?<div className="customer-saved-shelf-grid">{items.slice(0,6).map(product=><article className="customer-saved-product" key={product.id}>
   <button type="button" className="customer-saved-product-image" onClick={()=>onOpen(product)} aria-label={'فتح '+product.name}>{product.imageUrl?<img src={product.imageUrl} alt=""/>:<span>{product.name.slice(0,1)}</span>}<i className={product.availableQuantity>0?'in-stock':'out-stock'}>{product.availableQuantity>0?'متوفر':'غير متوفر'}</i></button>
   <div className="customer-saved-product-copy"><small>{product.sku} · {product.unit}</small><strong>{product.name}</strong><span>{product.availableQuantity.toLocaleString('ar-YE')} متاح</span><div>
    <button type="button" onClick={()=>void onAdd(product)} disabled={product.availableQuantity<1}>{product.availableQuantity>0?'إضافة للسلة':'غير متاح'}</button>
    <button type="button" className="saved-heart" aria-label="إزالة من المفضلة" onClick={()=>onToggleFavorite(product.id)}>♥</button>
   </div></div>
 </article>)}</div>:<div className="customer-saved-empty"><strong>{emptyTitle}</strong><span>{emptyText}</span></div>;
 return <section className="customer-saved-shelf" aria-label="الأصناف المحفوظة والمشاهدة"><div className="customer-saved-shelf-head"><div><span className="eyebrow">PERSONAL BUYING MEMORY</span><h3>محطات الشراء المحفوظة</h3><p>تخصيص محلي على هذا الجهاز لتسريع العودة للأصناف دون تغيير بيانات Commerce.</p></div><span className="customer-saved-device-badge">محفوظ على الجهاز</span></div>
  <section className="customer-saved-group" aria-label="المفضلة"><div className="customer-saved-group-head"><strong>المفضلة</strong><small>{favorites.length} صنف</small></div>{render(favorites,'لم تحفظ مفضلة بعد','اضغط ♡ على أي صنف تريد العودة إليه بسرعة.')}</section>
  <section className="customer-saved-group" aria-label="شوهدت مؤخرًا"><div className="customer-saved-group-head"><strong>شوهدت مؤخرًا</strong><small>{recent.length} صنف</small></div>{render(recent,'لا توجد أصناف حديثة','عند فتح تفاصيل الأصناف ستظهر هنا تلقائيًا.')}</section>
 </section>;
}
