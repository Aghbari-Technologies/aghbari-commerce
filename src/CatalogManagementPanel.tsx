import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCategories, type CategoryOption } from './services/categories';
import { upsertProduct } from './services/admin';
import { supabase } from './lib/supabase';
import './catalog-management.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type ProductStatus = 'active' | 'inactive';
interface ProductRow { id: string; sku: string; name: string; unit: string; category_id: string | null; description: string | null; status: ProductStatus; created_at: string; updated_at: string; }

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
  const [draft,setDraft] = useState({sku:'',name:'',unit:'',categoryId:'',description:'',status:'active' as ProductStatus});

  const reload = useCallback(async() => {
    if (!supabase || !canManage) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [{data,error:productsError}, categoryRows] = await Promise.all([
        supabase.from('products').select('id,sku,name,unit,category_id,description,status,created_at,updated_at').order('created_at',{ascending:false}).limit(1000),
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
  useEffect(()=>{ setPage(1); },[query,categoryId,status,sort]);

  const categoryNames = useMemo(()=>new Map(categories.map(item=>[item.id,item.name])),[categories]);
  const filtered = useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase();
    return products
      .filter(p=>status==='all'||p.status===status)
      .filter(p=>!categoryId||p.category_id===categoryId)
      .filter(p=>!needle||p.name.toLocaleLowerCase().includes(needle)||p.sku.toLocaleLowerCase().includes(needle)||p.unit.toLocaleLowerCase().includes(needle)||(p.description??'').toLocaleLowerCase().includes(needle))
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
    setDraft({sku:product.sku,name:product.name,unit:product.unit,categoryId:product.category_id??'',description:product.description??'',status:product.status});
    setError(null); setMessage(null);
  }
  async function saveEdit(){
    if(!editing||busyId) return;
    setBusyId(editing.id); setError(null); setMessage(null);
    try {
      await upsertProduct({productId:editing.id,sku:draft.sku,name:draft.name,unit:draft.unit,categoryId:draft.categoryId||null,description:draft.description,status:draft.status});
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

  if(!canManage) return null;
  return <section className="catalog-management cart-panel" id="admin-catalog" aria-busy={loading}>
    <div className="section-heading">
      <div><span className="eyebrow">Catalog & Products</span><h2>كتالوج المنتجات</h2><p className="panel-note">إدارة حقيقية للمنتجات الحالية مع فلاتر وفرز وتعديل آمن لحالة البيع.</p></div>
      <div className="catalog-stats" aria-label="ملخص المنتجات"><span>{products.length} إجمالي</span><span>{activeCount} نشط</span><span>{inactiveCount} موقوف</span></div>
    </div>

    <div className="catalog-toolbar" role="search">
      <label><span>البحث</span><input aria-label="بحث المنتجات" value={query} onChange={e=>setQuery(e.target.value)} placeholder="الاسم أو SKU أو الوحدة أو الوصف" /></label>
      <label><span>التصنيف</span><select aria-label="فلترة التصنيف" value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="">كل التصنيفات</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label><span>الحالة</span><select aria-label="فلترة الحالة" value={status} onChange={e=>setStatus(e.target.value as 'all'|ProductStatus)}><option value="all">كل الحالات</option><option value="active">نشط</option><option value="inactive">موقوف</option></select></label>
      <label><span>الترتيب</span><select aria-label="ترتيب المنتجات" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="name">الاسم</option><option value="sku">SKU</option><option value="newest">الأحدث</option></select></label>
      <button type="button" className="ghost" onClick={()=>void reload()} disabled={loading||Boolean(busyId)}>إعادة تحميل</button>
    </div>

    {loading ? <div className="portal-loading" role="status">جارٍ تحميل الكتالوج…</div>
      : error ? <div className="empty-state"><strong>تعذر تحميل كتالوج المنتجات.</strong><span>{error}</span><button type="button" onClick={()=>void reload()}>إعادة المحاولة</button></div>
      : !filtered.length ? <div className="empty-state"><strong>لا توجد منتجات مطابقة.</strong><span>{products.length?'غيّر الفلاتر أو عبارة البحث.':'ابدأ بإضافة أول منتج من بطاقة المنتج الجديدة أعلاه.'}</span>{(query||categoryId||status!=='all')&&<button type="button" onClick={()=>{setQuery('');setCategoryId('');setStatus('all');}}>مسح الفلاتر</button>}</div>
      : <div className="catalog-table" role="table" aria-label="جدول المنتجات">
          <div className="catalog-row catalog-head" role="row"><span>المنتج</span><span>SKU</span><span>التصنيف</span><span>الوحدة</span><span>الحالة</span><span>الإجراء</span></div>
          {visible.map(product=><article className="catalog-row" role="row" key={product.id}>
            <div><strong>{product.name}</strong><small>{product.description||'بدون وصف'}</small></div>
            <code dir="ltr">{product.sku}</code>
            <span>{product.category_id?categoryNames.get(product.category_id)??'تصنيف محذوف':'بدون تصنيف'}</span>
            <span>{product.unit}</span>
            <span className={'catalog-status '+product.status}>{STATUS_LABELS[product.status]}</span>
            <div className="catalog-actions"><button type="button" className="ghost" onClick={()=>openEdit(product)} disabled={Boolean(busyId)}>تعديل</button>{canToggle&&<button type="button" className="ghost" onClick={()=>void toggleStatus(product)} disabled={busyId===product.id}>{busyId===product.id?'جارٍ الحفظ…':product.status==='active'?'إيقاف':'تفعيل'}</button>}</div>
          </article>)}
        </div>}

    {!loading&&filtered.length>0&&<div className="catalog-pagination" aria-label="صفحات المنتجات"><span>عرض {(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE,filtered.length)} من {filtered.length}</span><div><button type="button" className="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>السابق</button><strong>صفحة {currentPage} / {totalPages}</strong><button type="button" className="ghost" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>التالي</button></div></div>}

    {message&&<div className="success" role="status">{message}</div>}

    {editing&&<dialog className="catalog-dialog" open aria-label="تعديل المنتج">
      <form method="dialog" className="catalog-dialog-card" onSubmit={e=>{e.preventDefault();void saveEdit();}}>
        <div className="section-heading"><div><span className="eyebrow">تحرير المنتج</span><h3>{editing.name}</h3></div><button type="button" className="ghost" onClick={()=>setEditing(null)}>إغلاق</button></div>
        <div className="admin-grid">
          <label>SKU<input value={draft.sku} onChange={e=>setDraft(d=>({...d,sku:e.target.value}))} required /></label>
          <label>اسم المنتج<input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} required /></label>
          <label>الوحدة<input value={draft.unit} onChange={e=>setDraft(d=>({...d,unit:e.target.value}))} required /></label>
          <label>التصنيف<select value={draft.categoryId} onChange={e=>setDraft(d=>({...d,categoryId:e.target.value}))}><option value="">بدون تصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="catalog-dialog-wide">الوصف<textarea rows={4} value={draft.description} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} /></label>
          {canToggle&&<label>الحالة<select value={draft.status} onChange={e=>setDraft(d=>({...d,status:e.target.value as ProductStatus}))}><option value="active">نشط</option><option value="inactive">موقوف</option></select></label>}
        </div>
        <div className="catalog-dialog-actions"><button type="button" className="ghost" onClick={()=>setEditing(null)}>إلغاء</button><button type="submit" disabled={busyId===editing.id}>{busyId===editing.id?'جارٍ الحفظ…':'حفظ التغييرات'}</button></div>
      </form>
    </dialog>}
  </section>;
}
