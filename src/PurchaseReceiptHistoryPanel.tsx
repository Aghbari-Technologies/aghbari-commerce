import OperationalLoadingSkeleton from './OperationalLoadingSkeleton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import RecordDetailDrawer from './RecordDetailDrawer';

type UserRole='owner'|'admin'|'warehouse';
interface Receipt{ id:string; receipt_number:number; purchase_order_id:string; warehouse_id:string; received_by:string|null; received_at:string; notes:string|null; }
interface Warehouse{ id:string; name:string; }
interface PurchaseOrder{ id:string; purchase_order_number:number; supplier_id:string; }
interface Supplier{ id:string; name:string; }
interface ReceiptItem{ id:string; receipt_id:string; product_id:string; quantity_received:number; unit_cost:number; line_total:number; }
interface Product{ id:string; name:string; sku:string; }

export default function PurchaseReceiptHistoryPanel({role}:{role:UserRole}){
  const canUse=['owner','admin','warehouse'].includes(role);
  const [receipts,setReceipts]=useState<Receipt[]>([]);
  const [warehouses,setWarehouses]=useState<Map<string,string>>(new Map());
  const [orders,setOrders]=useState<Map<string,PurchaseOrder>>(new Map());
  const [suppliers,setSuppliers]=useState<Map<string,string>>(new Map());
  const [items,setItems]=useState<ReceiptItem[]>([]);
  const [products,setProducts]=useState<Map<string,Product>>(new Map());
  const [query,setQuery]=useState(''); const [sort,setSort]=useState<'newest'|'oldest'>('newest'); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [selectedReceipt,setSelectedReceipt]=useState<Receipt|null>(null);
  const reload=useCallback(async()=>{if(!supabase||!canUse){setLoading(false);return;}setLoading(true);setError(null);try{const [r,w,o,s]=await Promise.all([
    supabase.from('purchase_receipts').select('id,receipt_number,purchase_order_id,warehouse_id,received_by,received_at,notes').order('received_at',{ascending:false}).limit(300),
    supabase.from('warehouses').select('id,name').eq('is_active',true),
    supabase.from('purchase_orders').select('id,purchase_order_number,supplier_id').limit(300),
    supabase.from('suppliers').select('id,name').eq('is_active',true).limit(300)
  ]);if(r.error)throw r.error;if(w.error)throw w.error;if(o.error)throw o.error;if(s.error)throw s.error;
    setReceipts((r.data??[]) as Receipt[]);setWarehouses(new Map(((w.data??[]) as Warehouse[]).map(x=>[x.id,x.name])));setOrders(new Map(((o.data??[]) as PurchaseOrder[]).map(x=>[x.id,x])));setSuppliers(new Map(((s.data??[]) as Supplier[]).map(x=>[x.id,x.name])));
  }catch(e){setError(e instanceof Error?e.message:'تعذر تحميل سجل الاستلام.');}finally{setLoading(false);}},[canUse]);
  useEffect(()=>{void reload();},[reload]);useEffect(()=>{setPage(1);},[query,sort]);
  const filtered=useMemo(()=>{const needle=query.trim().toLocaleLowerCase();return receipts.filter(r=>{const o=orders.get(r.purchase_order_id);const supplier=o?suppliers.get(o.supplier_id):'';return !needle||[r.receipt_number,o?.purchase_order_number??'',supplier??'',warehouses.get(r.warehouse_id)??'',r.notes??''].join(' ').toLocaleLowerCase().includes(needle);}).sort((a,b)=>{const delta=new Date(b.received_at).getTime()-new Date(a.received_at).getTime();return sort==='oldest'?-delta:delta;});},[orders,query,receipts,sort,suppliers,warehouses]);
  const pages=Math.max(1,Math.ceil(filtered.length/10));const activePage=Math.min(page,pages);const visible=filtered.slice((activePage-1)*10,activePage*10);
  const totalUnits=items.reduce((sum,row)=>sum+Number(row.quantity_received||0),0);
  const totalValue=items.reduce((sum,row)=>sum+Number(row.line_total||0),0);
  function itemsFor(receiptId:string){return items.filter(item=>item.receipt_id===receiptId);}
  function exportCsv(){
    const rows=filtered.flatMap(receipt=>{
      const order=orders.get(receipt.purchase_order_id);
      const supplier=order?suppliers.get(order.supplier_id):'';
      const receiptItems=itemsFor(receipt.id);
      return (receiptItems.length?receiptItems:[null]).map(item=>[
        receipt.receipt_number,
        order?.purchase_order_number??'',
        supplier??'',
        warehouses.get(receipt.warehouse_id)??'',
        new Date(receipt.received_at).toLocaleString('ar-YE'),
        item?products.get(item.product_id)?.sku||item.product_id:'',
        item?products.get(item.product_id)?.name||'صنف غير معروف':'',
        item?.quantity_received??'',
        item?.unit_cost??'',
        item?.line_total??'',
        receipt.notes??''
      ]);
    });
    if(!rows.length)return;
    const headers=['الإيصال','أمر الشراء','المورد','المستودع','تاريخ الاستلام','SKU','الصنف','الكمية','سعر الوحدة','إجمالي السطر','الملاحظات'];
    const csv='\\ufeff'+[headers,...rows].map(row=>row.map(value=>'"'+String(value??'').replaceAll('"','""')+'"').join(',')).join('\\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='aghbari-receiving-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);
  }
  if(!canUse)return null;
  return <section className='cart-panel' id='admin-receipts'><div className='section-heading'><div><span className='eyebrow'>Receiving Ledger</span><h2>سجل استلام المشتريات</h2><p className='panel-note'>الإيصالات المسجلة فعليًا مع أمر الشراء والمورد والمستودع والتاريخ.</p></div><span>{filtered.length}/{receipts.length} إيصال</span></div>
<div className='ops-metrics-strip' aria-label='ملخص الاستلام'><article><small>الإيصالات</small><strong>{receipts.length.toLocaleString('ar')}</strong><span>إجمالي السجل</span></article><article><small>النتائج</small><strong>{filtered.length.toLocaleString('ar')}</strong><span>بعد البحث</span></article><article><small>الوحدات</small><strong>{totalUnits.toLocaleString('ar-YE')}</strong><span>من كل البنود</span></article><article><small>القيمة</small><strong>{totalValue.toLocaleString('ar-YE')}</strong><span>إجمالي الاستلام</span></article></div>
    <div className='order-queue-toolbar'><input aria-label='بحث سجل الاستلام' value={query} onChange={e=>setQuery(e.target.value)} placeholder='رقم الإيصال أو أمر الشراء أو المورد'/><select aria-label='ترتيب سجل الاستلام' value={sort} onChange={e=>setSort(e.target.value as typeof sort)} disabled={loading}><option value='newest'>الأحدث</option><option value='oldest'>الأقدم</option></select><button type='button' className='ghost' onClick={exportCsv} disabled={loading||!filtered.length}>تصدير CSV</button><button type='button' className='ghost' onClick={()=>void reload()} disabled={loading}>إعادة تحميل</button><button type='button' className='ghost' onClick={()=>setQuery('')} disabled={!query}>مسح</button></div>
    {loading?<OperationalLoadingSkeleton variant="collection" />:error?<div className='empty-state'><strong>تعذر تحميل سجل الاستلام.</strong><span>{error}</span><button type='button' onClick={()=>void reload()}>إعادة المحاولة</button></div>:!filtered.length?<div className='empty-state'><strong>{receipts.length?'لا توجد نتائج مطابقة.':'لا توجد إيصالات استلام بعد.'}</strong><span>{receipts.length?'غيّر عبارة البحث.':'ستظهر الإيصالات هنا بعد تنفيذ عمليات الاستلام.'}</span></div>:<><div className='cart-lines'>{visible.map(r=>{const o=orders.get(r.purchase_order_id);const supplier=o?suppliers.get(o.supplier_id):null;return <article className='cart-line' key={r.id}><div><strong>إيصال #{r.receipt_number}</strong><small>أمر شراء #{o?.purchase_order_number??'—'} · {supplier??'مورد غير معروف'}</small></div><div><strong>{warehouses.get(r.warehouse_id)??'مستودع'}</strong><small>{new Date(r.received_at).toLocaleString('ar-YE')}</small></div><div><small>{r.notes??'بدون ملاحظات'}</small><button type='button' className='ghost' onClick={()=>setSelectedReceipt(r)}>التفاصيل</button></div></article>})}</div><div className='directory-pagination'><span>صفحة {activePage} / {pages}</span><div><button type='button' className='ghost' onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={activePage===1}>السابق</button><button type='button' className='ghost' onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={activePage===pages}>التالي</button></div></div></>}
  {selectedReceipt&&(()=>{const order=orders.get(selectedReceipt.purchase_order_id);const receiptItems=itemsFor(selectedReceipt.id);const receiptValue=receiptItems.reduce((sum,item)=>sum+Number(item.line_total||0),0);return <RecordDetailDrawer eyebrow='Receiving Ledger' title={`إيصال #${selectedReceipt.receipt_number}`} summary={`أمر شراء #${order?.purchase_order_number??'—'} · ${suppliers.get(order?.supplier_id??'')??'مورد غير معروف'}`} fields={[{label:'المستودع',value:warehouses.get(selectedReceipt.warehouse_id)??'—'},{label:'تاريخ الاستلام',value:new Date(selectedReceipt.received_at).toLocaleString('ar-YE')},{label:'المستخدم المنفذ',value:selectedReceipt.received_by??'غير متاح'},{label:'عدد البنود',value:receiptItems.length},{label:'إجمالي الاستلام',value:receiptValue.toLocaleString('ar-YE')},{label:'المعرّف',value:selectedReceipt.id},{label:'البنود',wide:true,content:true,value:<div className='record-detail-line-list'>{receiptItems.length?receiptItems.map(item=>{const product=products.get(item.product_id);return <div className='record-detail-line' key={item.id}><span>{product?.sku??item.product_id}</span><strong>{product?.name??'صنف غير معروف'}</strong><span>{Number(item.quantity_received).toLocaleString('ar-YE')} × {Number(item.unit_cost).toLocaleString('ar-YE')}</span><b>{Number(item.line_total).toLocaleString('ar-YE')}</b></div>}):<span>لا توجد بنود مرتبطة بهذا الإيصال.</span>}</div>},{label:'الملاحظات',value:selectedReceipt.notes??'بدون ملاحظات',wide:true}]} onClose={()=>setSelectedReceipt(null)}/>})()}
  </section>;
}
