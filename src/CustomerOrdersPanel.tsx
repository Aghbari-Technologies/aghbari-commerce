import { useEffect, useMemo, useState } from 'react';
import type { CustomerOrderSummary, CustomerOrderDetail } from './services/customerOrders';

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
  const [status,setStatus] = useState('all');
  const [page,setPage] = useState(1);

  useEffect(()=>{setPage(1);},[query,status]);

  const statuses=useMemo(()=>Array.from(new Set(orders.map(order=>order.status))),[orders]);
  const filtered=useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase();
    return orders.filter(order=>
      (status==='all'||order.status===status) &&
      (!needle||String(order.order_number).includes(needle)||order.status.toLocaleLowerCase().includes(needle)||String(STATUS_LABELS[order.status]??'').includes(needle))
    );
  },[orders,query,status]);
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const activePage=Math.min(page,pages);
  const visible=filtered.slice((activePage-1)*PAGE_SIZE,activePage*PAGE_SIZE);

  return <section className="content-card customer-orders-panel" aria-busy={loading}>
    <div className="section-title">
      <div><span className="eyebrow">التشغيل</span><h2>طلباتك وشحناتك</h2><p className="panel-note">{productsCount} أصناف محملة في سياق المتجر الحالي.</p></div>
      <span>{filtered.length}/{orders.length} طلب</span>
    </div>
    <div className="customer-orders-toolbar">
      <label><span>بحث</span><input aria-label="بحث الطلبات" value={query} onChange={e=>setQuery(e.target.value)} placeholder="رقم الطلب أو الحالة" disabled={loading}/></label>
      <label><span>الحالة</span><select aria-label="فلترة حالة الطلب" value={status} onChange={e=>setStatus(e.target.value)} disabled={loading}><option value="all">كل الحالات</option>{statuses.map(item=><option key={item} value={item}>{STATUS_LABELS[item]??item}</option>)}</select></label>
      <button type="button" className="ghost" onClick={()=>{setQuery('');setStatus('all');setPage(1);}} disabled={loading||(!query&&status==='all')}>مسح</button>
      <button type="button" className="ghost" onClick={onReload} disabled={loading}>إعادة تحميل</button>
    </div>
    {detailBusy&&<div className="portal-loading" role="status">جارٍ تحميل تفاصيل الطلب…</div>}
    {loading?<div className="portal-loading" role="status">جارٍ تحميل الطلبات…</div>
      :!orders.length?<div className="empty-state"><strong>لا توجد طلبات سابقة بعد.</strong><span>بعد أول إرسال سيظهر سجل الطلبات والتتبع هنا.</span><button type="button" onClick={onReload}>إعادة المحاولة</button></div>
      :!filtered.length?<div className="empty-state"><strong>لا توجد طلبات مطابقة.</strong><span>غيّر البحث أو فلتر الحالة ثم أعد المحاولة.</span><button type="button" onClick={()=>{setQuery('');setStatus('all');}}>مسح الفلاتر</button></div>
      :<><div className="orders-list">{visible.map(order=><article className="order-card" key={order.id}>
        <div className="order-head"><strong>طلب #{order.order_number}</strong><strong>{order.total.toLocaleString('ar-YE')} {order.currency}</strong></div>
        <small>{new Date(order.created_at).toLocaleString('ar-YE')}</small>
        <div className="order-status">{STATUS_LABELS[order.status]??order.status}</div>
        <div className="order-footer"><button disabled={detailBusy} onClick={()=>onOpenDetail(order)}>عرض التفاصيل والتتبع</button><button className="ghost" disabled={loading} onClick={()=>onReorder(order)}>إعادة الطلب</button></div>
      </article>)}</div>
      <div className="customer-orders-pagination" aria-label="صفحات الطلبات"><span>صفحة {activePage} / {pages} · عرض {((activePage-1)*PAGE_SIZE)+1}–{Math.min(activePage*PAGE_SIZE,filtered.length)}</span><div><button type="button" className="ghost" onClick={()=>setPage(value=>Math.max(1,value-1))} disabled={activePage===1}>السابق</button><button type="button" className="ghost" onClick={()=>setPage(value=>Math.min(pages,value+1))} disabled={activePage===pages}>التالي</button></div></div></>}
  </section>;
}
