import { useEffect, useMemo, useState } from 'react';
import { getCustomerOrdersPage, type CustomerOrderStatusFilter, type CustomerOrderSummary } from './services/customerOrders';

const PAGE_SIZE = 10;
const STATUS_LABELS: Record<string,string> = {
  draft:'مسودة', pending:'قيد المراجعة', confirmed:'مؤكد', preparing:'قيد التجهيز',
  ready:'جاهز', completed:'مكتمل', cancelled:'ملغي'
};

export default function CustomerOrdersPanel({
  orders, loading, detailBusy, productsCount,
  onOpenDetail, onReorder, onReload
}: {
  orders: CustomerOrderSummary[];
  loading: boolean;
  detailBusy: boolean;
  productsCount: number;
  onOpenDetail: (order: CustomerOrderSummary) => void;
  onReorder: (order: CustomerOrderSummary) => void;
  onReload: () => void;
}) {
  const [query,setQuery] = useState('');
  const [status,setStatus] = useState<CustomerOrderStatusFilter>('all');
  const [page,setPage] = useState(1);
  const [pageRows,setPageRows] = useState<CustomerOrderSummary[]>(orders);
  const [total,setTotal] = useState(orders.length);
  const [pageBusy,setPageBusy] = useState(false);
  const [pageError,setPageError] = useState<string|null>(null);

  useEffect(()=>{setPage(1);},[query,status]);

  const statuses=useMemo(()=>Array.from(new Set(orders.map(order=>order.status))),[orders]);
  useEffect(()=>{
    let cancelled=false;
    if(loading)return;
    setPageBusy(true);
    setPageError(null);
    void getCustomerOrdersPage({limit:PAGE_SIZE,offset:(page-1)*PAGE_SIZE,query,status}).then((result)=>{
      if(cancelled)return;
      setPageRows(result.items);
      setTotal(result.total);
    }).catch((e)=>{
      if(cancelled)return;
      setPageRows([]);
      setTotal(0);
      setPageError(e instanceof Error?e.message:'تعذر تحميل صفحة الطلبات.');
    }).finally(()=>{
      if(!cancelled)setPageBusy(false);
    });
    return()=>{cancelled=true;};
  },[loading,orders,page,query,status]);
  const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
  const activePage=Math.min(page,pages);
  const visible=pageRows;

  return <section className="content-card customer-orders-panel" aria-busy={loading||pageBusy}>
    <div className="section-title">
      <div><span className="eyebrow">التشغيل</span><h2>طلباتك وشحناتك</h2><p className="panel-note">{productsCount} أصناف محملة في سياق المتجر الحالي.</p></div>
      <span>{total} طلب في السجل</span>
    </div>
    <div className="customer-orders-toolbar">
      <label><span>بحث</span><input aria-label="بحث الطلبات" value={query} onChange={e=>setQuery(e.target.value)} placeholder="رقم الطلب أو الحالة" disabled={loading}/></label>
      <label><span>الحالة</span><select aria-label="فلترة حالة الطلب" value={status} onChange={e=>setStatus(e.target.value)} disabled={loading||pageBusy}><option value="all">كل الحالات</option>{statuses.map(item=><option key={item} value={item}>{STATUS_LABELS[item]??item}</option>)}</select></label>
      <button type="button" className="ghost" onClick={()=>{setQuery('');setStatus('all');setPage(1);}} disabled={loading||(!query&&status==='all')}>مسح</button>
      <button type="button" className="ghost" onClick={onReload} disabled={loading}>إعادة تحميل</button>
    </div>
    {detailBusy&&<div className="portal-loading" role="status">جارٍ تحميل تفاصيل الطلب…</div>}
    {loading||pageBusy?<div className="portal-loading" role="status">جارٍ تحميل الطلبات…</div>
      :pageError?<div className="empty-state"><strong>تعذر تحميل صفحة الطلبات.</strong><span>{pageError}</span><button type="button" onClick={onReload}>إعادة المحاولة</button></div>
      :!orders.length?<div className="empty-state"><strong>لا توجد طلبات سابقة بعد.</strong><span>بعد أول إرسال سيظهر سجل الطلبات والتتبع هنا.</span><button type="button" onClick={onReload}>إعادة المحاولة</button></div>
      :!visible.length?<div className="empty-state"><strong>لا توجد طلبات مطابقة.</strong><span>غيّر البحث أو فلتر الحالة ثم أعد المحاولة.</span><button type="button" onClick={()=>{setQuery('');setStatus('all');}}>مسح الفلاتر</button></div>
      :<><div className="orders-list">{visible.map(order=><article className="order-card" key={order.id}>
        <div className="order-head"><strong>طلب #{order.order_number}</strong><strong>{order.total.toLocaleString('ar-YE')} {order.currency}</strong></div>
        <small>{new Date(order.created_at).toLocaleString('ar-YE')}</small>
        <div className="order-status">{STATUS_LABELS[order.status]??order.status}</div>
        <div className="order-footer"><button disabled={detailBusy} onClick={()=>onOpenDetail(order)}>عرض التفاصيل والتتبع</button><button className="ghost" disabled={loading} onClick={()=>onReorder(order)}>إعادة الطلب</button></div>
      </article>)}</div>
      <div className="customer-orders-pagination" aria-label="صفحات الطلبات"><span>صفحة {activePage} / {pages} · عرض {total ? ((activePage-1)*PAGE_SIZE)+1 : 0}–{Math.min(activePage*PAGE_SIZE,total)} من {total} طلب</span><div><button type="button" className="ghost" onClick={()=>setPage(value=>Math.max(1,value-1))} disabled={activePage===1}>السابق</button><button type="button" className="ghost" onClick={()=>setPage(value=>Math.min(pages,value+1))} disabled={activePage===pages}>التالي</button></div></div></>}
  </section>;
}
