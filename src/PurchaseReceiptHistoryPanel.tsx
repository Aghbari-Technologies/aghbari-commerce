import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

type UserRole='owner'|'admin'|'warehouse';
interface Receipt{ id:string; receipt_number:number; purchase_order_id:string; warehouse_id:string; received_by:string|null; received_at:string; notes:string|null; }
interface Warehouse{ id:string; name:string; }
interface PurchaseOrder{ id:string; purchase_order_number:number; supplier_id:string; }
interface Supplier{ id:string; name:string; }

export default function PurchaseReceiptHistoryPanel({role}:{role:UserRole}){
  const canUse=['owner','admin','warehouse'].includes(role);
  const [receipts,setReceipts]=useState<Receipt[]>([]);
  const [warehouses,setWarehouses]=useState<Map<string,string>>(new Map());
  const [orders,setOrders]=useState<Map<string,PurchaseOrder>>(new Map());
  const [suppliers,setSuppliers]=useState<Map<string,string>>(new Map());
  const [query,setQuery]=useState(''); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const reload=useCallback(async()=>{if(!supabase||!canUse){setLoading(false);return;}setLoading(true);setError(null);try{const [r,w,o,s]=await Promise.all([
    supabase.from('purchase_receipts').select('id,receipt_number,purchase_order_id,warehouse_id,received_by,received_at,notes').order('received_at',{ascending:false}).limit(300),
    supabase.from('warehouses').select('id,name').eq('is_active',true),
    supabase.from('purchase_orders').select('id,purchase_order_number,supplier_id').limit(300),
    supabase.from('suppliers').select('id,name').eq('is_active',true).limit(300)
  ]);if(r.error)throw r.error;if(w.error)throw w.error;if(o.error)throw o.error;if(s.error)throw s.error;
    setReceipts((r.data??[]) as Receipt[]);setWarehouses(new Map(((w.data??[]) as Warehouse[]).map(x=>[x.id,x.name])));setOrders(new Map(((o.data??[]) as PurchaseOrder[]).map(x=>[x.id,x])));setSuppliers(new Map(((s.data??[]) as Supplier[]).map(x=>[x.id,x.name])));
  }catch(e){setError(e instanceof Error?e.message:'تعذر تحميل سجل الاستلام.');}finally{setLoading(false);}},[canUse]);
  useEffect(()=>{void reload();},[reload]);useEffect(()=>{setPage(1);},[query]);
  const filtered=useMemo(()=>{const needle=query.trim().toLocaleLowerCase();return receipts.filter(r=>{const o=orders.get(r.purchase_order_id);const supplier=o?suppliers.get(o.supplier_id):'';return !needle||[r.receipt_number,o?.purchase_order_number??'',supplier??'',warehouses.get(r.warehouse_id)??'',r.notes??''].join(' ').toLocaleLowerCase().includes(needle);});},[orders,query,receipts,suppliers,warehouses]);
  const pages=Math.max(1,Math.ceil(filtered.length/10));const activePage=Math.min(page,pages);const visible=filtered.slice((activePage-1)*10,activePage*10);
  if(!canUse)return null;
  return <section className='cart-panel' id='admin-receipts'><div className='section-heading'><div><span className='eyebrow'>Receiving Ledger</span><h2>سجل استلام المشتريات</h2><p className='panel-note'>الإيصالات المسجلة فعليًا مع أمر الشراء والمورد والمستودع والتاريخ.</p></div><span>{filtered.length}/{receipts.length} إيصال</span></div>
    <div className='order-queue-toolbar'><input aria-label='بحث سجل الاستلام' value={query} onChange={e=>setQuery(e.target.value)} placeholder='رقم الإيصال أو أمر الشراء أو المورد'/><button type='button' className='ghost' onClick={()=>void reload()} disabled={loading}>إعادة تحميل</button><button type='button' className='ghost' onClick={()=>setQuery('')} disabled={!query}>مسح</button></div>
    {loading?<div className='portal-loading' role='status'>جارٍ تحميل سجل الاستلام…</div>:error?<div className='empty-state'><strong>تعذر تحميل سجل الاستلام.</strong><span>{error}</span><button type='button' onClick={()=>void reload()}>إعادة المحاولة</button></div>:!filtered.length?<div className='empty-state'><strong>{receipts.length?'لا توجد نتائج مطابقة.':'لا توجد إيصالات استلام بعد.'}</strong><span>{receipts.length?'غيّر عبارة البحث.':'ستظهر الإيصالات هنا بعد تنفيذ عمليات الاستلام.'}</span></div>:<><div className='cart-lines'>{visible.map(r=>{const o=orders.get(r.purchase_order_id);const supplier=o?suppliers.get(o.supplier_id):null;return <article className='cart-line' key={r.id}><div><strong>إيصال #{r.receipt_number}</strong><small>أمر شراء #{o?.purchase_order_number??'—'} · {supplier??'مورد غير معروف'}</small></div><div><strong>{warehouses.get(r.warehouse_id)??'مستودع'}</strong><small>{new Date(r.received_at).toLocaleString('ar-YE')}</small></div><div><small>{r.notes??'بدون ملاحظات'}</small></div></article>})}</div><div className='directory-pagination'><span>صفحة {activePage} / {pages}</span><div><button type='button' className='ghost' onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={activePage===1}>السابق</button><button type='button' className='ghost' onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={activePage===pages}>التالي</button></div></div></>}
  </section>;
}
