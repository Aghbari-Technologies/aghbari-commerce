import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { transferInventory, setStockThreshold, getLowStock, type LowStockRow } from './services/inventory';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
interface Product { id: string; sku: string; name: string; }
interface Warehouse { id: string; name: string; }

export default function InventoryPanel({ role }: { role: UserRole }) {
  const canUse = ['owner','admin','warehouse'].includes(role);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [thresholdWarehouse, setThresholdWarehouse] = useState('');
  const [thresholdProduct, setThresholdProduct] = useState('');
  const [minQuantity, setMinQuantity] = useState('0');
  const [reorderQuantity, setReorderQuantity] = useState('1');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!supabase || !canUse) return;
    const [productResult, warehouseResult, lowRows] = await Promise.all([
      supabase.from('products').select('id,sku,name').eq('status','active').order('name').limit(500),
      supabase.from('warehouses').select('id,name').eq('is_active',true).order('created_at'),
      getLowStock()
    ]);
    const { data: productRows, error: productError } = productResult;
    const { data: warehouseRows, error: warehouseError } = warehouseResult;
    if (productError) throw productError;
    if (warehouseError) throw warehouseError;
    setProducts((productRows ?? []) as Product[]);
    const nextWarehouses = (warehouseRows ?? []) as Warehouse[];
    setWarehouses(nextWarehouses);
    setLowStock(lowRows);
    if (!source && nextWarehouses[0]) setSource(nextWarehouses[0].id);
    if (!destination && nextWarehouses[1]) setDestination(nextWarehouses[1].id);
    if (!thresholdWarehouse && nextWarehouses[0]) setThresholdWarehouse(nextWarehouses[0].id);
    if (!productId && productRows?.[0]) setProductId(productRows[0].id);
    if (!thresholdProduct && productRows?.[0]) setThresholdProduct(productRows[0].id);
  }, [canUse, destination, productId, source, thresholdProduct, thresholdWarehouse]);

  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل المخزون.')); }, [reload]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(null); setMessage(null);
    try { await action(); setMessage(success); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); }
    finally { setBusy(false); }
  }

  if (!canUse) return null;
  const makeKey = (prefix: string) => `agh-${prefix}-${crypto.randomUUID()}`;

  return <div className="cart-panel" id="inventory">
    <div className="section-heading"><div><span className="eyebrow">المخزون</span><h2>النقل والتنبيهات التشغيلية</h2></div><span>{lowStock.length} أصناف منخفضة</span></div>
    <div className="admin-grid">
      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => transferInventory(source,destination,makeKey('transfer'),[{productId,quantity:Number(quantity)}],notes), 'تم نقل المخزون ذريًا وتسجيل الحركتين.'); }}>
        <h3>تحويل بين المستودعات</h3>
        <select aria-label="المستودع المصدر" value={source} onChange={(e) => setSource(e.target.value)} required><option value="">من المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select aria-label="المستودع الوجهة" value={destination} onChange={(e) => setDestination(e.target.value)} required><option value="">إلى المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select aria-label="منتج التحويل" value={productId} onChange={(e) => setProductId(e.target.value)} required><option value="">اختر المنتج</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select>
        <input aria-label="كمية التحويل" type="number" min="1" max="100000" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input aria-label="ملاحظات التحويل" placeholder="ملاحظة (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button disabled={busy || !source || !destination || source === destination}>تنفيذ التحويل</button>
      </form>

      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => setStockThreshold(thresholdWarehouse,thresholdProduct,Number(minQuantity),Number(reorderQuantity)), 'تم حفظ حد إعادة الطلب.'); }}>
        <h3>حد إعادة الطلب</h3>
        <select aria-label="مستودع الحد" value={thresholdWarehouse} onChange={(e) => setThresholdWarehouse(e.target.value)} required><option value="">اختر المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select aria-label="منتج الحد" value={thresholdProduct} onChange={(e) => setThresholdProduct(e.target.value)} required><option value="">اختر المنتج</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select>
        <input aria-label="الحد الأدنى" type="number" min="0" step="1" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} required />
        <input aria-label="كمية إعادة الطلب" type="number" min="1" step="1" value={reorderQuantity} onChange={(e) => setReorderQuantity(e.target.value)} required />
        <button disabled={busy}>حفظ الحد</button>
      </form>

      <div className="admin-card"><h3>الأصناف التي تحتاج إجراء</h3>{!lowStock.length ? <small>لا توجد أصناف تحت حدود إعادة الطلب.</small> : <div className="cart-lines">{lowStock.slice(0,20).map((row) => <article className="cart-line" key={`${row.warehouse_id}:${row.product_id}`}><div><strong>{row.product_name}</strong><small>{row.sku} · {row.warehouse_name}</small></div><div><strong>{row.current_quantity}</strong><small>الحد {row.min_quantity} · إعادة {row.reorder_quantity}</small></div></article>)}</div>}</div>
    </div>
    {error && <div className="error-banner" role="alert">{error}</div>}{message && <div className="success" role="status">{message}</div>}
  </div>;
}
