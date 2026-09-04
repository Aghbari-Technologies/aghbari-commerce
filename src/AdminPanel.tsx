import { useEffect, useState } from 'react';
import type { CustomerTier } from './domain/types';
import { adjustInventory, createCategory, setProductPrice, upsertProduct } from './services/admin';
import { supabase } from './lib/supabase';

interface StaffProduct { id: string; sku: string; name: string; unit: string; }
interface Warehouse { id: string; name: string; }

const tiers: CustomerTier[] = ['retail', 'wholesale', 'distributor'];

export default function AdminPanel() {
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
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
  }

  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل مركز التحكم.')); }, []);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(null); setMessage(null);
    try { await action(); setMessage(success); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); }
    finally { setBusy(false); }
  }

  return <section className="admin-panel" id="account">
    <div className="section-heading"><div><span className="eyebrow">إدارة التشغيل</span><h2>مركز التحكم</h2></div><span>للمستخدمين المخولين فقط</span></div>
    <div className="admin-grid">
      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => upsertProduct({ sku: product.sku, name: product.name, unit: product.unit }), 'تم حفظ المنتج.'); }}>
        <h3>منتج جديد</h3>
        <input aria-label="SKU" placeholder="SKU" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} required />
        <input aria-label="اسم المنتج" placeholder="اسم المنتج" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required />
        <input aria-label="الوحدة" placeholder="الوحدة" value={product.unit} onChange={(e) => setProduct({ ...product, unit: e.target.value })} required />
        <button disabled={busy}>حفظ المنتج</button>
      </form>

      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => createCategory(category.name, category.slug), 'تم إنشاء التصنيف.'); }}>
        <h3>تصنيف جديد</h3>
        <input aria-label="اسم التصنيف" placeholder="اسم التصنيف" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} required />
        <input aria-label="معرف التصنيف" placeholder="slug مثل rice" value={category.slug} onChange={(e) => setCategory({ ...category, slug: e.target.value })} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
        <button disabled={busy}>حفظ التصنيف</button>
      </form>

      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !price) return; void run(() => setProductPrice(selectedProduct, tier, Number(price)), 'تم تحديث السعر الفعّال.'); }}>
        <h3>تسعير حسب الفئة</h3>
        <select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select>
        <select aria-label="تصنيف العميل" value={tier} onChange={(e) => setTier(e.target.value as CustomerTier)}>{tiers.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <input aria-label="السعر" type="number" min="0" step="0.01" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <button disabled={busy}>اعتماد السعر</button>
      </form>

      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !warehouseId || !delta) return; void run(() => adjustInventory(warehouseId, selectedProduct, Number(delta), reason), 'تم تعديل المخزون وتسجيل الحركة.'); }}>
        <h3>تعديل المخزون</h3>
        <select aria-label="المستودع" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required><option value="">اختر المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <input aria-label="التغيير" type="number" step="1" placeholder="+ أو - الكمية" value={delta} onChange={(e) => setDelta(e.target.value)} required />
        <input aria-label="سبب التعديل" placeholder="سبب التعديل" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <button disabled={busy}>تسجيل الحركة</button>
      </form>
    </div>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {message && <div className="success" role="status">{message}</div>}
  </section>;
}
