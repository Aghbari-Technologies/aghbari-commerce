import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCategories, type CategoryOption } from './services/categories';
import { upsertProduct } from './services/admin';
import { supabase } from './lib/supabase';
import './catalog-management.css';
import RecordDetailDrawer from './RecordDetailDrawer';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type ProductStatus = 'active' | 'inactive';
interface ProductRow { id: string; sku: string; name: string; unit: string; barcode: string | null; category_id: string | null; description: string | null; status: ProductStatus; created_at: string; updated_at: string; }

const PAGE_SIZE = 12;
const STATUS_LABELS: Record<ProductStatus,string> = { active: 'نشط', inactive: 'موقوف' };

export default function CatalogManagementPanel({ role }: { role: UserRole }) {
  const canManage = role === 'owner' || role === 'admin' || role === 'sales';
  const canToggle = role === 'owner' || role === 'admin';
  const [products,setProducts] = useState<ProductRow[]>([]);
  const [categories,setCategories] = useState<CategoryOption[]>([]);
  const [query,setQuery] = useState('');
  const [categoryId,setCategoryId] = useState('');
  const [status,setStatus] = useState<'all'|ProductStatus>('all');
  const [sort,setSort] = useState<'name'|'sku'|'newest'>('name');
  const [page,setPage] = useState(1);
  const [loading,setLoading] = useState(true);
  const [busyId,setBusyId] = useState<string|null>(null);
  const [error,setError] = useState<string|null>(null);
  const [message,setMessage] = useState<string|null>(null);
  const [editing,setEditing] = useState<ProductRow|null>(null);
  const [draft,setDraft] = useState({sku:'',name:'',unit:'',barcode:'',categoryId:'',description:'',status:'active' as ProductStatus});
  const [selectedIds,setSelectedIds] = useState<string[]>([]);
  const [bulkStatus,setBulkStatus] = useState<ProductStatus>('inactive');
  const [bulkBusy,setBulkBusy] = useState(false);
  const [bulkMessage,setBulkMessage] = useState<string|null>(null);

  const reload = useCallback(async() => {
    if (!supabase || !canManage) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [{data,error:productsError}, categoryRows] = await Promise.all([
        supabase.from('products').select('id,sku,name,unit,barcode,category_id,description,status,created_at,updated_at').order('created_at',{ascending:false}).limit(1000),
        getCategories()
      ]);
      if (productsError) throw productsError;
      setProducts((data ?? []) as ProductRow[]);
      setCategories(categoryRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل كتالوج المنتجات.');
    } finally { setLoading(false); }
  },[canManage]);

  useEffect(()=>{ void reload(); },[reload]);
  useEffect(()=>{ setPage(1); setSelectedIds([]); setBulkMessage(null); },[query,categoryId,status,sort]);

  const categoryNames = useMemo(()=>new Map(categories.map(item=>[item.id,item.name])),[categories]);
  const filtered = useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase();
    return products
      .filter(p=>status==='all'||p.status===status)
      .filter(p=>!categoryId||p.category_id===categoryId)
      .filter(p=>!needle||p.name.toLocaleLowerCase().includes(needle)||p.sku.toLocaleLowerCase().includes(needle)||p.unit.toLocaleLowerCase().includes(needle)||(p.barcode??'').toLocaleLowerCase().includes(needle)||(p.description??'').toLocaleLowerCase().includes(needle))
      .sort((a,b)=>{
        if(sort==='sku') return a.sku.localeCompare(b.sku,'ar');
        if(sort==='newest') return b.created_at.localeCompare(a.created_at);
        return a.name.localeCompare(b.name,'ar');
      });
  },[categoryId,products,query,sort,status]);

  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const currentPage=Math.min(page,totalPages);
  const visible=filtered.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  const activeCount=products.filter(p=>p.status==='active').length;
  const inactiveCount=products.length-activeCount;

  function openEdit(product:ProductRow){
    setEditing(product);
    setDraft({sku:product.sku,name:product.name,unit:product.unit,barcode:product.barcode??'',categoryId:product.category_id??'',description:product.description??'',status:product.status});
    setError(null); setMessage(null);
  }
  async function createNewProduct(){
    if(busyId) return;
    setBusyId('__new__'); setError(null); setMessage(null);
    try {
      await upsertProduct({productId:null,sku:createDraft.sku,name:createDraft.name,unit:createDraft.unit,barcode:createDraft.barcode||null,categoryId:createDraft.categoryId||null,description:createDraft.description,status:createDraft.status});
      setCreateDraft({sku:'',name:'',unit:'حبة',barcode:'',categoryId:'',description:'',status:'active'});
      setMessage('تم إنشاء المنتج وحفظه عبر المسار الكانوني.');
      await reload();
    } catch(e) { setError(e instanceof Error?e.message:'تعذر إنشاء المنتج.'); }
    finally { setBusyId(null); }
  }
  async function saveEdit(){
    if(!editing||busyId) return;
    setBusyId(editing.id); setError(null); setMessage(null);
    try {
      await upsertProduct({productId:editing.id,sku:draft.sku,name:draft.name,unit:draft.unit,barcode:draft.barcode||null,categoryId:draft.categoryId||null,description:draft.description,status:draft.status});
      setEditing(null);
      setMessage('تم حفظ بيانات المنتج وحالته في قاعدة البيانات.');
      await reload();
    } catch(e) {
      setError(e instanceof Error?e.message:'تعذر حفظ المنتج.');
    } finally { setBusyId(null); }
  }
  async function toggleStatus(product:ProductRow){
    if(!canToggle||busyId) return;
    const nextStatus:ProductStatus=product.status==='active'?'inactive':'active';
    if(!window.confirm(nextStatus==='inactive'?'إيقاف هذا المنتج عن البيع؟':'إعادة تفعيل هذا المنتج؟')) return;
    setBusyId(product.id); setError(null); setMessage(null);
    try {
      await upsertProduct({productId:product.id,sku:product.sku,name:product.name,unit:product.unit,categoryId:product.category_id,description:product.description,status:nextStatus});
      setMessage(nextStatus==='active'?'تم تفعيل المنتج.':'تم إيقاف المنتج.');
      await reload();
    } catch(e) {
      setError(e instanceof Error?e.message:'تعذر تغيير حالة المنتج.');
    } finally { setBusyId(null); }
  }

  async function applyBulkStatus() {
    if (!canToggle || bulkBusy || !selectedIds.length) return;
    if (selectedIds.length > 50) { setBulkMessage('الحد الأقصى للعملية الجماعية هو 50 منتجًا في الدفعة الواحدة.'); return; }
    const targetIds = new Set(selectedIds);
    const targets = products.filter((product) => targetIds.has(product.id) && product.status !== bulkStatus);
    if (!targets.length) { setBulkMessage('لا توجد تغييرات فعلية في الاختيار الحالي.'); return; }
    if (!window.confirm('معاينة العملية: سيتم تغيير حالة ' + targets.length + ' منتجًا إلى «' + STATUS_LABELS[bulkStatus] + '». كل منتج سيُسجّل عبر RPC الكانوني، ويمكن أن ينتج فشلًا جزئيًا يحتاج إعادة معالجة. اعتماد؟')) return;
    setBulkBusy(true); setBulkMessage(null); setError(null);
    let succeeded = 0; const failed: string[] = [];
    try {
      for (const product of targets) {
        try {
          await upsertProduct({ productId: product.id, sku: product.sku, name: product.name, unit: product.unit, barcode: product.barcode, categoryId: product.category_id, description: product.description, status: bulkStatus });
          succeeded += 1;
        } catch (e) {
          failed.push(product.sku + ': ' + (e instanceof Error ? e.message : 'فشل غير معروف'));
        }
      }
      setSelectedIds([]);
      setBulkMessage(failed.length ? 'تمت معالجة ' + succeeded + ' من ' + targets.length + ' منتجًا. العناصر الفاشلة بقيت دون ادعاء نجاح وتحتاج إعادة معالجة.' : 'تم اعتماد العملية الجماعية على ' + succeeded + ' منتجًا وتسجيل كل تغيير عبر المسار الكانوني.');
      await reload();
    } finally { setBulkBusy(false); }
  }

  if(!canManage) return null;
  return <section className="catalog-management cart-panel" id="admin-catalog" aria-busy={loading}>
    <div className="section-heading">
      <div><span className="eyebrow">Catalog & Products</span><h2>كتالوج المنتجات</h2><p className="panel-note">إدارة حقيقية للمنتجات الحالية مع فلاتر وفرز وتعديل آمن لحالة البيع.</p></div>
      <div className="catalog-stats" aria-label="ملخص المنتجات"><span>{products.length} إجمالي</span><span>{activeCount} نشط</span><span>{inactiveCount} موقوف</span></div>
    </div>

    <form className="catalog-create-card" onSubmit={e=>{e.preventDefault();void createNewProduct();}} aria-label="إنشاء منتج جديد"><div><span className="eyebrow">إضافة صنف</span><h3>منتج جديد</h3><p>إنشاء منتج حقيقي في الكتالوج. لن يظهر كمتاح للبيع للعميل إلا بعد نجاح الحفظ ووصوله من المصدر التشغيلي.</p></div><div className="catalog-create-grid"><label>SKU<input value={createDraft.sku} onChange={e=>setCreateDraft(d=>({...d,sku:e.target.value}))} required placeholder="مثال: SKU-1001" /></label><label>اسم المنتج<input value={createDraft.name} onChange={e=>setCreateDraft(d=>({...d,name:e.target.value}))} required /></label><label>الوحدة<select value={createDraft.unit} onChange={e=>setCreateDraft(d=>({...d,unit:e.target.value}))}>{['حبة','كرتون','طن'].map(unit=><option key={unit} value={unit}>{unit}</option>)}</select></label><label>الباركود<input inputMode="numeric" autoComplete="off" maxLength={80} value={createDraft.barcode} onChange={e=>setCreateDraft(d=>({...d,barcode:e.target.value}))} placeholder="اختياري" /></label><label>التصنيف<select value={createDraft.categoryId} onChange={e=>setCreateDraft(d=>({...d,categoryId:e.target.value}))}><option value="">بدون تصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="catalog-create-wide">الوصف<textarea rows={2} value={createDraft.description} onChange={e=>setCreateDraft(d=>({...d,description:e.target.value}))} placeholder="وصف تشغيلي مختصر للمنتج" /></label></div><div className="catalog-create-actions"><span>سيتم تسجيل الإنشاء على قاعدة البيانات عبر RPC المصرح.</span><button type="submit" disabled={busyId==='__new__'}>{busyId==='__new__'?'جارٍ الإنشاء…':'إنشاء المنتج'}</button></div></form>
    <div className="catalog-toolbar" role="search">
      <label><span>البحث</span><input aria-label="بحث المنتجات" value={query} onChange={e=>setQuery(e.target.value)} placeholder="الاسم أو SKU أو الباركود أو الوحدة أو الوصف" /></label>
      <label><span>التصنيف</span><select aria-label="فلترة التصنيف" value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="">كل التصنيفات</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label><span>الحالة</span><select aria-label="فلترة الحالة" value={status} onChange={e=>setStatus(e.target.value as 'all'|ProductStatus)}><option value="all">كل الحالات</option><option value="active">نشط</option><option value="inactive">موقوف</option></select></label>
      <label><span>الترتيب</span><select aria-label="ترتيب المنتجات" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="name">الاسم</option><option value="sku">SKU</option><option value="newest">الأحدث</option></select></label>
      <button type="button" className="ghost" onClick={()=>void reload()} disabled={loading||Boolean(busyId)}>إعادة تحميل</button>
    </div>

    {!loading && canToggle && filtered.length > 0 && <div className="bulk-action-center" aria-label="مركز العمليات الجماعية">
      <div><strong>مركز العمليات الجماعية</strong><small>{selectedIds.length} محدد · الحد 50</small></div>
      <label>الحالة الجديدة<select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value as ProductStatus)}><option value="inactive">موقوف</option><option value="active">نشط</option></select></label>
      <button type="button" disabled={bulkBusy || !selectedIds.length} onClick={()=>void applyBulkStatus()}>{bulkBusy?'جارٍ التنفيذ…':'معاينة واعتماد الحالة'}</button>
      <button type="button" className="ghost" disabled={!selectedIds.length||bulkBusy} onClick={()=>setSelectedIds([])}>مسح التحديد</button>
      {selectedIds.length > 50 && <span role="alert">الاختيار يتجاوز الحد. قلل العدد قبل الاعتماد.</span>}
      {bulkMessage && <span role="status">{bulkMessage}</span>}
    </div>}
    {loading ? <div className="portal-loading" role="status">جارٍ تحميل الكتالوج…</div>
      : error ? <div className="empty-state"><strong>تعذر تحميل كتالوج المنتجات.</strong><span>{error}</span><button type="button" onClick={()=>void reload()}>إعادة المحاولة</button></div>
      : !filtered.length ? <div className="empty-state"><strong>لا توجد منتجات مطابقة.</strong><span>{products.length?'غيّر الفلاتر أو عبارة البحث.':'ابدأ بإضافة أول منتج من بطاقة المنتج الجديدة أعلاه.'}</span>{(query||categoryId||status!=='all')&&<button type="button" onClick={()=>{setQuery('');setCategoryId('');setStatus('all');}}>مسح الفلاتر</button>}</div>
      : <div className="catalog-table" role="table" aria-label="جدول المنتجات">
          <div className="catalog-row catalog-head" role="row"><label className="catalog-select catalog-select-all"><input type="checkbox" aria-label="تحديد منتجات الصفحة" checked={visible.length>0&&visible.every(product=>selectedIds.includes(product.id))} onChange={(e)=>setSelectedIds(current=>e.target.checked?[...new Set([...current,...visible.map(product=>product.id)])]:current.filter(id=>!visible.some(product=>product.id===id)))} disabled={bulkBusy} /><span>الكل</span></label><span>المنتج</span><span>SKU / Barcode</span><span>التصنيف</span><span>الوحدة</span><span>الحالة</span><span>الإجراء</span></div>
          {visible.map(product=><article className="catalog-row" role="row" key={product.id}>
            <label className="catalog-select"><input type="checkbox" aria-label={'تحديد '+product.name} checked={selectedIds.includes(product.id)} onChange={(e)=>setSelectedIds(current=>e.target.checked?[...new Set([...current,product.id])]:current.filter(id=>id!==product.id))} disabled={bulkBusy} /><span className="sr-only">تحديد</span></label>
            <div><strong>{product.name}</strong><small>{product.description||'بدون وصف'}</small></div>
            <code dir="ltr">{product.sku}{product.barcode?' · '+product.barcode:''}</code>
            <span>{product.category_id?categoryNames.get(product.category_id)??'تصنيف محذوف':'بدون تصنيف'}</span>
            <span>{product.unit}</span>
            <span className={'catalog-status '+product.status}>{STATUS_LABELS[product.status]}</span>
            <div className="catalog-actions"><button type="button" className="ghost" onClick={()=>setSelectedProduct(product)}>التفاصيل</button><button type="button" className="ghost" onClick={()=>openEdit(product)} disabled={Boolean(busyId)}>تعديل</button>{canToggle&&<button type="button" className="ghost" onClick={()=>void toggleStatus(product)} disabled={busyId===product.id}>{busyId===product.id?'جارٍ الحفظ…':product.status==='active'?'إيقاف':'تفعيل'}</button>}</div>
          </article>)}
        </div>}

    {!loading&&filtered.length>0&&<div className="catalog-pagination" aria-label="صفحات المنتجات"><span>عرض {(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE,filtered.length)} من {filtered.length}</span><div><button type="button" className="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>السابق</button><strong>صفحة {currentPage} / {totalPages}</strong><button type="button" className="ghost" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>التالي</button></div></div>}

    {message&&<div className="success" role="status">{message}</div>}
    {selectedProduct&&<RecordDetailDrawer eyebrow="Catalog / Products" title={selectedProduct.name} summary={STATUS_LABELS[selectedProduct.status]} fields={[{label:"SKU",value:selectedProduct.sku},{label:"الباركود",value:selectedProduct.barcode??"غير محدد"},{label:"الوحدة",value:selectedProduct.unit},{label:"التصنيف",value:selectedProduct.category_id?categoryNames.get(selectedProduct.category_id)??"تصنيف غير موجود":"بدون تصنيف"},{label:"الحالة",value:STATUS_LABELS[selectedProduct.status]},{label:"تاريخ الإنشاء",value:new Date(selectedProduct.created_at).toLocaleString("ar-YE")},{label:"آخر تحديث",value:new Date(selectedProduct.updated_at).toLocaleString("ar-YE")},{label:"الوصف",value:selectedProduct.description??"بدون وصف",wide:true},{label:"المعرّف",value:selectedProduct.id,wide:true}]} onClose={()=>setSelectedProduct(null)}/>}

    {editing&&<dialog className="catalog-dialog" open aria-label="تعديل المنتج">
      <form method="dialog" className="catalog-dialog-card" onSubmit={e=>{e.preventDefault();void saveEdit();}}>
        <div className="section-heading"><div><span className="eyebrow">تحرير المنتج</span><h3>{editing.name}</h3></div><button type="button" className="ghost" onClick={()=>setEditing(null)}>إغلاق</button></div>
        <div className="admin-grid">
          <label>SKU<input value={draft.sku} onChange={e=>setDraft(d=>({...d,sku:e.target.value}))} required /></label>
          <label>اسم المنتج<input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} required /></label>
          <label>الوحدة<input value={draft.unit} onChange={e=>setDraft(d=>({...d,unit:e.target.value}))} required /></label><label>الباركود<input inputMode="numeric" autoComplete="off" maxLength={80} value={draft.barcode} onChange={e=>setDraft(d=>({...d,barcode:e.target.value}))} placeholder="باركود اختياري" /></label>
          <label>التصنيف<select value={draft.categoryId} onChange={e=>setDraft(d=>({...d,categoryId:e.target.value}))}><option value="">بدون تصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="catalog-dialog-wide">الوصف<textarea rows={4} value={draft.description} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} /></label>
          {canToggle&&<label>الحالة<select value={draft.status} onChange={e=>setDraft(d=>({...d,status:e.target.value as ProductStatus}))}><option value="active">نشط</option><option value="inactive">موقوف</option></select></label>}
        </div>
        <div className="catalog-dialog-actions"><button type="button" className="ghost" onClick={()=>setEditing(null)}>إلغاء</button><button type="submit" disabled={busyId===editing.id}>{busyId===editing.id?'جارٍ الحفظ…':'حفظ التغييرات'}</button></div>
      </form>
    </dialog>}
  </section>;
}
