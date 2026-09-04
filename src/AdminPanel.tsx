import { useCallback, useEffect, useState } from 'react';
import type { CustomerTier } from './domain/types';
import { adjustInventory, createCategory, setProductPrice, upsertProduct } from './services/admin';
import { commitProductImport, stageProductImport } from './services/importExcel';
import { supabase } from './lib/supabase';

interface StaffProduct { id: string; sku: string; name: string; unit: string; }
interface Warehouse { id: string; name: string; }
type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
const tiers: CustomerTier[] = ['retail', 'wholesale', 'distributor'];

export default function AdminPanel({ role }: { role: UserRole }) {
  const [products, setProducts] = useState<StaffProduct[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [product, setProduct] = useState({ sku: '', name: '', unit: 'كرتون' });
  const [category, setCategory] = useState({ name: '', slug: '' });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [tier, setTier] = useState<CustomerTier>('wholesale');
  const [price, setPrice] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{ rows: number; invalid: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const [{ data: productRows, error: productError }, { data: warehouseRows, error: warehouseError }] = await Promise.all([
      supabase.from('products').select('id,sku,name,unit').eq('status', 'active').order('name').limit(200),
      supabase.from('warehouses').select('id,name').eq('is_active', true).order('created_at')
    ]);
    if (productError) throw productError;
    if (warehouseError) throw warehouseError;
    setProducts((productRows ?? []) as StaffProduct[]);
    const nextWarehouses = (warehouseRows ?? []) as Warehouse[];
    setWarehouses(nextWarehouses);
    if (!warehouseId && nextWarehouses[0]) setWarehouseId(nextWarehouses[0].id);
  }, [warehouseId]);

  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل مركز التحكم.')); }, [reload]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(null); setMessage(null);
    try { await action(); setMessage(success); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); }
    finally { setBusy(false); }
  }

  async function stageImport() {
    if (!importFile) return;
    setBusy(true); setError(null); setMessage(null); setImportJobId(null); setImportPreview(null);
    try {
      const result = await stageProductImport(importFile);
      setImportPreview({ rows: result.rows.length, invalid: result.diagnostics.length });
      if (result.jobId) { setImportJobId(result.jobId); setMessage('تمت المعاينة والتحقق على الخادم. يمكنك اعتماد الاستيراد الذري.'); }
      else setError('الملف يحتوي أخطاء ويجب إصلاحها قبل الاستيراد.');
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تجهيز ملف الاستيراد.'); }
    finally { setBusy(false); }
  }

  async function commitImport() {
    if (!importJobId || !warehouseId) return;
    await run(async () => {
      const result = await commitProductImport(importJobId, warehouseId);
      setImportJobId(null); setImportFile(null); setImportPreview(null);
      return result;
    }, 'تم اعتماد الاستيراد بالكامل وتسجيل أثر المخزون والتدقيق.');
  }

  const canCatalog = role === 'owner' || role === 'admin' || role === 'sales';
  const canCategory = role === 'owner' || role === 'admin';
  const canInventory = role === 'owner' || role === 'admin' || role === 'warehouse';

  return <section className="admin-panel" id="account">
    <div className="section-heading"><div><span className="eyebrow">إدارة التشغيل</span><h2>مركز التحكم</h2></div><span>الصلاحيات تُفرض على الخادم أيضًا</span></div>
    <div className="admin-grid">
      {canCatalog && <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => upsertProduct({ sku: product.sku, name: product.name, unit: product.unit }), 'تم حفظ المنتج.'); }}>
        <h3>منتج جديد</h3><input aria-label="SKU" placeholder="SKU" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} required />
        <input aria-label="اسم المنتج" placeholder="اسم المنتج" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required />
        <input aria-label="الوحدة" placeholder="الوحدة" value={product.unit} onChange={(e) => setProduct({ ...product, unit: e.target.value })} required /><button disabled={busy}>حفظ المنتج</button>
      </form>}

      {canCategory && <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => createCategory(category.name, category.slug), 'تم إنشاء التصنيف.'); }}>
        <h3>تصنيف جديد</h3><input aria-label="اسم التصنيف" placeholder="اسم التصنيف" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} required />
        <input aria-label="معرف التصنيف" placeholder="slug مثل rice" value={category.slug} onChange={(e) => setCategory({ ...category, slug: e.target.value })} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><button disabled={busy}>حفظ التصنيف</button>
      </form>}

      {canCatalog && <form className="admin-card" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !price) return; void run(() => setProductPrice(selectedProduct, tier, Number(price)), 'تم تحديث السعر الفعّال.'); }}>
        <h3>تسعير حسب الفئة</h3><select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select>
        <select aria-label="تصنيف العميل" value={tier} onChange={(e) => setTier(e.target.value as CustomerTier)}>{tiers.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <input aria-label="السعر" type="number" min="0" step="0.01" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} required /><button disabled={busy}>اعتماد السعر</button>
      </form>}

      {canCatalog && <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void stageImport(); }}>
        <h3>استيراد Excel آمن</h3><input aria-label="ملف المنتجات" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportJobId(null); setImportPreview(null); }} required />
        {importPreview && <small>الصفوف: {importPreview.rows} · الأخطاء: {importPreview.invalid}</small>}
        {!importJobId ? <button disabled={busy || !importFile}>رفع ومعاينة</button> : <button disabled={busy || !warehouseId} onClick={(e) => { e.preventDefault(); void commitImport(); }}>اعتماد الاستيراد الذري</button>}
      </form>}

      {canInventory && <form className="admin-card" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !warehouseId || !delta) return; void run(() => adjustInventory(warehouseId, selectedProduct, Number(delta), reason), 'تم تعديل المخزون وتسجيل الحركة.'); }}>
        <h3>تعديل المخزون</h3><select aria-label="المستودع" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required><option value="">اختر المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <input aria-label="التغيير" type="number" step="1" placeholder="+ أو - الكمية" value={delta} onChange={(e) => setDelta(e.target.value)} required /><input aria-label="سبب التعديل" placeholder="سبب التعديل" value={reason} onChange={(e) => setReason(e.target.value)} required /><button disabled={busy}>تسجيل الحركة</button>
      </form>}
    </div>
    {error && <div className="error-banner" role="alert">{error}</div>}{message && <div className="success" role="status">{message}</div>}
  </section>;
}
