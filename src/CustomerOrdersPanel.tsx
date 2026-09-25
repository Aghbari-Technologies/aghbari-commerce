import { useEffect, useMemo, useState } from 'react';
import type { CustomerOrderSummary } from './services/customerOrders';

const PAGE_SIZE = 10;
const STATUS_LABELS: Record<string,string> = {
  draft:'مسودة', pending:'قيد المراجعة', confirmed:'مؤكد', preparing:'قيد التجهيز',
  ready:'جاهز', completed:'مكتمل', cancelled:'ملغي'
};
const STATUS_ORDER = ['pending','confirmed','preparing','ready','completed'];

type SortMode = 'newest' | 'oldest' | 'highest' | 'lowest';
type Density = 'comfortable' | 'compact';

function statusProgress(status: string) {
  if (status === 'cancelled') return -1;
  const index = STATUS_ORDER.indexOf(status);
  return index < 0 ? 0 : index + 1;
}

function dateKey(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

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
  const [sort,setSort] = useState<SortMode>('newest');
  const [density,setDensity] = useState<Density>('comfortable');
  const [page,setPage] = useState(1);

  useEffect(()=>{setPage(1);},[query,status,sort]);

  const statuses=useMemo(()=>Array.from(new Set(orders.map(order=>order.status))),[orders]);
  const filtered=useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase();
    return orders
      .filter(order=>
        (status==='all'||order.status===status) &&
        (!needle||String(order.order_number).includes(needle)||String(order.customer_name ?? '').toLocaleLowerCase().includes(needle)||order.status.toLocaleLowerCase().includes(needle)||String(STATUS_LABELS[order.status]??'').includes(needle))
      )
      .sort((a,b)=>{
        if(sort==='highest') return Number(b.total)-Number(a.total);
        if(sort==='lowest') return Number(a.total)-Number(b.total);
        const delta=dateKey(b.created_at)-dateKey(a.created_at);
        return sort==='oldest' ? -delta : delta;
      });
  },[orders,query,status,sort]);
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const activePage=Math.min(page,pages);
  const visible=filtered.slice((activePage-1)*PAGE_SIZE,activePage*PAGE_SIZE);
  const openCount=orders.filter(order=>['pending','confirmed','preparing','ready'].includes(order.status)).length;
  const completedCount=orders.filter(order=>order.status==='completed').length;
  const cancelledCount=orders.filter(order=>order.status==='cancelled').length;
  const totalValue=orders.reduce((sum,order)=>sum+Number(order.total||0),0);

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setSort('newest');
    setPage(1);
  }

  return <section className="content-card customer-orders-panel" aria-busy={loading}>
    <div className="section-title">
      <div><span className="eyebrow">التشغيل</span><h2>طلباتك وشحناتك</h2><p className="panel-note">{productsCount} أصناف محملة في سياق المتجر الحالي.</p></div>
      <span>{filtered.length}/{orders.length} طلب</span>
    </div>

    <div className="customer-order-summary-strip" aria-label="ملخص حالات الطلبات">
      <article><span aria-hidden="true">↗</span><div><small>المفتوحة</small><strong>{openCount.toLocaleString('ar')}</strong><em>تحت المعالجة</em></div></article>
      <article><span aria-hidden="true">✓</span><div><small>المكتملة</small><strong>{completedCount.toLocaleString('ar')}</strong><em>تم إنجازها</em></div></article>
      <article><span aria-hidden="true">!</span><div><small>الملغاة</small><strong>{cancelledCount.toLocaleString('ar')}</strong><em>تحتاج مراجعة</em></div></article>
      <article className="customer-order-value-summary"><span aria-hidden="true">ر.ي</span><div><small>قيمة السجل</small><strong>{totalValue.toLocaleString('ar-YE')}</strong><em>قبل أي مرشحات</em></div></article>
    </div>

    <div className="customer-orders-toolbar" role="search">
      <label><span>بحث</span><input aria-label="بحث الطلبات" value={query} onChange={e=>setQuery(e.target.value)} placeholder="رقم الطلب أو العميل أو الحالة" disabled={loading}/></label>
      <label><span>الحالة</span><select aria-label="فلترة حالة الطلب" value={status} onChange={e=>setStatus(e.target.value)} disabled={loading}><option value="all">كل الحالات</option>{statuses.map(item=><option key={item} value={item}>{STATUS_LABELS[item]??item}</option>)}</select></label>
      <label><span>الترتيب</span><select aria-label="ترتيب الطلبات" value={sort} onChange={e=>setSort(e.target.value as SortMode)} disabled={loading}><option value="newest">الأحدث أولًا</option><option value="oldest">الأقدم أولًا</option><option value="highest">الأعلى قيمة</option><option value="lowest">الأقل قيمة</option></select></label>
      <button type="button" className="ghost" onClick={clearFilters} disabled={loading||(!query&&status==='all'&&sort==='newest')}>مسح</button>
      <button type="button" className="ghost" onClick={onReload} disabled={loading}>إعادة تحميل</button>
      <div className="customer-order-density" role="group" aria-label="كثافة قائمة الطلبات"><button type="button" className={density==='comfortable'?'active':''} aria-pressed={density==='comfortable'} onClick={()=>setDensity('comfortable')}>مريح</button><button type="button" className={density==='compact'?'active':''} aria-pressed={density==='compact'} onClick={()=>setDensity('compact')}>مضغوط</button></div>
    </div>

    {detailBusy&&<div className="portal-loading" role="status">جارٍ تحميل تفاصيل الطلب…</div>}
    {loading?<div className="portal-loading" role="status">جارٍ تحميل الطلبات…</div>
      :!orders.length?<div className="empty-state"><strong>لا توجد طلبات سابقة بعد.</strong><span>بعد أول إرسال سيظهر سجل الطلبات والتتبع هنا.</span><button type="button" onClick={onReload}>إعادة المحاولة</button></div>
      :!filtered.length?<div className="empty-state"><strong>لا توجد طلبات مطابقة.</strong><span>غيّر البحث أو فلتر الحالة أو الترتيب ثم أعد المحاولة.</span><button type="button" onClick={clearFilters}>مسح الفلاتر</button></div>
      :<><div className={`orders-list ${density==='compact'?'is-compact':''}`}>{visible.map(order=>{
        const progress=statusProgress(order.status);
        return <article className="order-card" key={order.id}>
          <div className="order-head"><div><span className="eyebrow">طلب B2B</span><strong>طلب #{order.order_number}</strong><small>{order.customer_name ?? 'حساب العميل'} · {new Date(order.created_at).toLocaleString('ar-YE')}</small></div><strong>{Number(order.total).toLocaleString('ar-YE')} {order.currency}</strong></div>
          <div className="order-status" data-status={order.status}>{STATUS_LABELS[order.status]??order.status}</div>
          {progress >= 0 && <div className="customer-order-timeline" aria-label={`تقدم الطلب: ${STATUS_LABELS[order.status]??order.status}`}>
            {STATUS_ORDER.map((step,index)=><div className={index < progress ? 'is-complete' : index === progress-1 ? 'is-current' : ''} key={step}><span aria-hidden="true">{index < progress ? '✓' : index + 1}</span><small>{STATUS_LABELS[step]}</small></div>)}
          </div>}
          {order.status === 'cancelled' && <div className="state-panel" data-state="error"><strong>الطلب ملغي</strong><small>يمكنك فتح التفاصيل لمعرفة حالة السجل، أو إعادة الطلب لإنشاء محاولة جديدة.</small></div>}
          <div className="order-footer"><button type="button" disabled={detailBusy} onClick={()=>onOpenDetail(order)}>عرض التفاصيل والتتبع</button><button type="button" className="ghost" disabled={loading} onClick={()=>onReorder(order)}>إعادة الطلب</button></div>
        </article>;
      })}</div>
      <div className="customer-orders-pagination" aria-label="صفحات الطلبات"><span>صفحة {activePage} / {pages} · عرض {((activePage-1)*PAGE_SIZE)+1}–{Math.min(activePage*PAGE_SIZE,filtered.length)} من {filtered.length}</span><div><button type="button" className="ghost" onClick={()=>setPage(value=>Math.max(1,value-1))} disabled={activePage===1}>السابق</button><button type="button" className="ghost" onClick={()=>setPage(value=>Math.min(pages,value+1))} disabled={activePage===pages}>التالي</button></div></div></>}
  </section>;
}
