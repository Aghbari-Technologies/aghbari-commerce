import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPurchaseOrder, createSupplier, approvePurchaseOrder, receivePurchaseOrder, submitPurchaseOrder } from './services/purchasing';
import { supabase } from './lib/supabase';
import RecordDetailDrawer from './RecordDetailDrawer';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type Status = 'draft' | 'submitted' | 'approved' | 'partially_received' | 'received' | 'cancelled';
interface Product { id: string; sku: string; name: string; unit: string; }
interface Warehouse { id: string; name: string; }
interface Supplier { id: string; name: string; phone: string | null; }
interface PurchaseOrder { id: string; purchase_order_number: number; supplier_id: string; warehouse_id: string; status: Status; total: number; currency: string; }
interface PurchaseItem { id: string; purchase_order_id: string; product_id: string; quantity_ordered: number; quantity_received: number; unit_cost: number; }

const statusLabels: Record<Status, string> = {
  draft: 'مسودة', submitted: 'مرسل', approved: 'معتمد', partially_received: 'استلام جزئي', received: 'مستلم', cancelled: 'ملغي'
};

export default function PurchasingPanel({ role }: { role: UserRole }) {
  const canManage = role === 'owner' || role === 'admin' || role === 'warehouse';
  const canApprove = role === 'owner' || role === 'admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [purchaseLines, setPurchaseLines] = useState<Array<{ productId: string; quantity: string; unitCost: string }>>([{ productId: '', quantity: '1', unitCost: '0' }]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [receiveLines, setReceiveLines] = useState<Array<{ purchaseOrderItemId: string; quantity: string }>>([{ purchaseOrderItemId: '', quantity: '1' }]);
  const [receiveNotes, setReceiveNotes] = useState('');
  const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [orderQuery,setOrderQuery]=useState(''); const [orderStatus,setOrderStatus]=useState<'all'|Status>('all'); const [orderPage,setOrderPage]=useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase || !canManage) { setLoading(false); return; }
    setLoading(true);
    const [{ data: productRows, error: productError }, { data: warehouseRows, error: warehouseError }, { data: supplierRows, error: supplierError }, { data: orderRows, error: orderError }, { data: itemRows, error: itemError }] = await Promise.all([
      supabase.from('products').select('id,sku,name,unit').eq('status', 'active').order('name').limit(500),
      supabase.from('warehouses').select('id,name').eq('is_active', true).order('created_at'),
      supabase.from('suppliers').select('id,name,phone').eq('is_active', true).order('name').limit(200),
      supabase.from('purchase_orders').select('id,purchase_order_number,supplier_id,warehouse_id,status,total,currency').order('created_at', { ascending: false }).limit(100),
      supabase.from('purchase_order_items').select('id,purchase_order_id,product_id,quantity_ordered,quantity_received,unit_cost').order('created_at')
    ]);
    if (productError) throw productError;
    if (warehouseError) throw warehouseError;
    if (supplierError) throw supplierError;
    if (orderError) throw orderError;
    if (itemError) throw itemError;
    setProducts((productRows ?? []) as Product[]); setWarehouses((warehouseRows ?? []) as Warehouse[]); setSuppliers((supplierRows ?? []) as Supplier[]);
    const nextOrders = (orderRows ?? []) as PurchaseOrder[]; setOrders(nextOrders); setItems((itemRows ?? []) as PurchaseItem[]);
    if (!warehouseId && warehouseRows?.[0]) setWarehouseId(warehouseRows[0].id);
    if (!supplierId && supplierRows?.[0]) setSupplierId(supplierRows[0].id);
    setPurchaseLines((current) => current.map((line) => ({ ...line, productId: line.productId || productRows?.[0]?.id || '' })));
    if (!selectedOrderId) setSelectedOrderId(nextOrders.find((o) => o.status === 'approved' || o.status === 'partially_received')?.id ?? '');
    setLoading(false);
  }, [canManage, selectedOrderId, supplierId, warehouseId]);

  useEffect(() => { void load().catch((e) => { setLoading(false); setError(e instanceof Error ? e.message : 'تعذر تحميل المشتريات.'); }); }, [load]);
  useEffect(()=>{setOrderPage(1);},[orderQuery,orderStatus]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(null); setMessage(null);
    try { await action(); setMessage(success); await load(); }
    catch (e) { setLoading(false); setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); }
    finally { setBusy(false); }
  }

  const selectedOrderItems = items.filter((item) => item.purchase_order_id === selectedOrderId && item.quantity_received < item.quantity_ordered);
  const supplierNameFor = (id: string) => suppliers.find((supplier) => supplier.id === id)?.name ?? 'مورد';
  const productNameFor = (id: string) => products.find((product) => product.id === id)?.name ?? id;
  const receivingDraftItems = receiveLines.map((line) => {
    const item = selectedOrderItems.find((candidate) => candidate.id === line.purchaseOrderItemId);
    return { ...line, item };
  });
  const receiveableRemaining = selectedOrderItems.filter((item) => !receiveLines.some((line) => line.purchaseOrderItemId === item.id)).length;
  const visibleOrders=useMemo(()=>{const needle=orderQuery.trim().toLocaleLowerCase();return orders.filter(o=>(orderStatus==='all'||o.status===orderStatus)&&(!needle||String(o.purchase_order_number).includes(needle)||(suppliers.find(s=>s.id===o.supplier_id)?.name??'').toLocaleLowerCase().includes(needle)||statusLabels[o.status].includes(needle)));},[orderQuery,orderStatus,orders,suppliers]); const orderPages=Math.max(1,Math.ceil(visibleOrders.length/8)); const activeOrderPage=Math.min(orderPage,orderPages); const pagedOrders=visibleOrders.slice((activeOrderPage-1)*8,activeOrderPage*8);

  if (!canManage) return null;

  return <div className="cart-panel" id="purchasing">
    <div className="section-heading"><div><span className="eyebrow">المشتريات والمستودع</span><h2>دورة التوريد</h2></div><span aria-live="polite">{loading ? 'جارٍ التحديث…' : `${orders.length} أوامر شراء`}</span></div>
    <div className="admin-grid">
      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(() => createSupplier({ name: supplierName, phone: supplierPhone, address: supplierAddress }), 'تم إنشاء المورد وتسجيل أثر العملية.').then(() => { setSupplierName(''); setSupplierPhone(''); setSupplierAddress(''); }); }}>
        <h3>مورد جديد</h3>
        <input aria-label="اسم المورد" placeholder="اسم المورد" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
        <input aria-label="هاتف المورد" placeholder="الهاتف" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} />
        <input aria-label="عنوان المورد" placeholder="العنوان" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} />
        <button disabled={busy}>حفظ المورد</button>
      </form>

      <form className="admin-card purchasing-builder" onSubmit={(e) => {
        e.preventDefault();
        const normalized = purchaseLines
          .filter((line) => line.productId)
          .map((line) => ({ productId: line.productId, quantity: Number(line.quantity), unitCost: Number(line.unitCost) }));
        if (!supplierId || !warehouseId || !normalized.length || normalized.some((line) => !Number.isSafeInteger(line.quantity) || line.quantity < 1 || !Number.isFinite(line.unitCost) || line.unitCost < 0)) {
          setError('أكمل المورد والمستودع وبنود أمر الشراء قبل الإنشاء.');
          return;
        }
        const seen = new Set<string>();
        if (normalized.some((line) => seen.has(line.productId) || (seen.add(line.productId), false))) {
          setError('لا يمكن تكرار المنتج داخل أمر الشراء.');
          return;
        }
        void run(async () => {
          await createPurchaseOrder({
            supplierId,
            warehouseId,
            idempotencyKey: `agh-po-${crypto.randomUUID()}`,
            lines: normalized,
            currency: 'YER'
          });
          setPurchaseLines([{ productId: products[0]?.id ?? '', quantity: '1', unitCost: '0' }]);
        }, 'تم إنشاء أمر الشراء متعدد البنود وتسجيل العملية.');
      }}>
        <div className="section-heading"><div><h3>أمر شراء جديد</h3><small>أنشئ أمرًا متعدد البنود في عملية ذرية واحدة.</small></div><span>{purchaseLines.length} بند</span></div>
        <select aria-label="المورد" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required><option value="">اختر المورد</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>
        <select aria-label="مستودع الاستلام" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required><option value="">اختر المستودع</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select>
        <div className="purchase-draft-lines">
          {purchaseLines.map((line, index) => <div className="purchase-draft-line" key={index}>
            <select aria-label={`منتج بند الشراء ${index + 1}`} value={line.productId} onChange={(e) => setPurchaseLines((current) => current.map((item, i) => i === index ? { ...item, productId: e.target.value } : item))} required>
              <option value="">اختر المنتج</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}
            </select>
            <input aria-label={`كمية بند الشراء ${index + 1}`} type="number" min="1" step="1" value={line.quantity} onChange={(e) => setPurchaseLines((current) => current.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))} required />
            <input aria-label={`تكلفة بند الشراء ${index + 1}`} type="number" min="0" step="0.01" value={line.unitCost} onChange={(e) => setPurchaseLines((current) => current.map((item, i) => i === index ? { ...item, unitCost: e.target.value } : item))} required />
            <button type="button" className="ghost" onClick={() => setPurchaseLines((current) => current.length === 1 ? current : current.filter((_, i) => i !== index))} disabled={busy || purchaseLines.length === 1}>حذف</button>
          </div>)}
        </div>
        <div className="purchase-builder-actions">
          <button type="button" className="ghost" onClick={() => setPurchaseLines((current) => [...current, { productId: products[0]?.id ?? '', quantity: '1', unitCost: '0' }])} disabled={busy || purchaseLines.length >= 100}>+ إضافة بند</button>
          <span>{purchaseLines.length}/100 · إجمالي تقديري {purchaseLines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitCost) || 0), 0)} YER</span>
        </div>
        <button disabled={busy || !supplierId || !warehouseId || !purchaseLines.some((line) => line.productId)}>إنشاء أمر شراء</button>
      </form>

      <div className="admin-card"><h3>اعتماد أوامر الشراء</h3><div className="order-queue-toolbar"><input aria-label="بحث أوامر الشراء" value={orderQuery} onChange={e=>setOrderQuery(e.target.value)} placeholder="رقم الأمر أو المورد" disabled={loading}/><select aria-label="حالة أمر الشراء" value={orderStatus} onChange={e=>setOrderStatus(e.target.value as 'all'|Status)} disabled={loading}><option value="all">كل الحالات</option>{(Object.keys(statusLabels) as Status[]).map(k=><option key={k} value={k}>{statusLabels[k]}</option>)}</select><button type="button" className="ghost" onClick={()=>{setOrderQuery('');setOrderStatus('all');}} disabled={!orderQuery&&orderStatus==='all'}>مسح</button></div>{loading ? <div className="portal-loading" role="status">جارٍ تحميل أوامر الشراء…</div> : orders.length === 0 ? <div className="empty-state"><strong>لا توجد أوامر شراء بعد.</strong><button type="button" onClick={() => void load()}>إعادة المحاولة</button></div> : !visibleOrders.length ? <div className="empty-state"><strong>لا توجد نتائج مطابقة.</strong><button type="button" onClick={()=>{setOrderQuery('');setOrderStatus('all');}}>مسح الفلاتر</button></div> : <><div className="cart-lines">{pagedOrders.map((order) => <article className="cart-line" key={order.id}><div><strong>أمر #{order.purchase_order_number}</strong><small>{supplierNameFor(order.supplier_id)}</small></div><div><strong>{order.total} {order.currency}</strong><small>{statusLabels[order.status]}</small></div><div className="status-actions"><button type="button" className="ghost" onClick={() => setDetailOrderId(order.id)}>التفاصيل</button>{order.status === 'draft' && <button disabled={busy} onClick={() => void run(() => submitPurchaseOrder(order.id), 'تم إرسال أمر الشراء للاعتماد.')}>إرسال</button>}{canApprove && order.status === 'submitted' && <button disabled={busy} onClick={() => void run(() => approvePurchaseOrder(order.id), 'تم اعتماد أمر الشراء.')}>اعتماد</button>}</div></article>)}</div>{visibleOrders.length>0&&<div className="directory-pagination"><span>صفحة {activeOrderPage} / {orderPages} · {visibleOrders.length} نتيجة</span><div><button type="button" className="ghost" onClick={()=>setOrderPage(p=>Math.max(1,p-1))} disabled={activeOrderPage===1}>السابق</button><button type="button" className="ghost" onClick={()=>setOrderPage(p=>Math.min(orderPages,p+1))} disabled={activeOrderPage===orderPages}>التالي</button></div></div></>}</div>

      <form className="admin-card receiving-builder" onSubmit={(e) => {
        e.preventDefault();
        if (!selectedOrderId) { setError('اختر أمر شراء قابلًا للاستلام.'); return; }
        const normalized = receivingDraftItems.map((line) => ({
          purchaseOrderItemId: line.purchaseOrderItemId,
          productId: line.item?.product_id ?? '',
          quantity: Number(line.quantity),
          remaining: line.item ? line.item.quantity_ordered - line.item.quantity_received : -1
        }));
        if (!normalized.length || normalized.some((line) => !line.purchaseOrderItemId || !line.productId || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > line.remaining)) {
          setError('أكمل بنود الاستلام وتحقق من الكميات المتبقية قبل التسجيل.');
          return;
        }
        const seen = new Set<string>();
        if (normalized.some((line) => seen.has(line.purchaseOrderItemId) || (seen.add(line.purchaseOrderItemId), false))) {
          setError('لا يمكن تكرار بند أمر الشراء داخل إيصال واحد.');
          return;
        }
        void run(() => receivePurchaseOrder({
          purchaseOrderId: selectedOrderId,
          idempotencyKey: `agh-receive-${crypto.randomUUID()}`,
          lines: normalized.map(({ purchaseOrderItemId, productId, quantity }) => ({ purchaseOrderItemId, productId, quantity })),
          notes: receiveNotes.trim() || undefined
        }), 'تم استلام جميع البنود ذريًا وتحديث المخزون وتسجيل الحركة.');
      }}>
        <div className="section-heading"><div><h3>استلام البضاعة</h3><small>إيصال متعدد البنود في عملية ذرية واحدة.</small></div><span>{receiveLines.length} بند</span></div>
        <select aria-label="أمر الشراء" value={selectedOrderId} onChange={(e) => { setSelectedOrderId(e.target.value); setReceiveLines([{ purchaseOrderItemId: '', quantity: '1' }]); }} required>
          <option value="">اختر أمرًا معتمدًا</option>{orders.filter((order) => order.status === 'approved' || order.status === 'partially_received').map((order) => <option key={order.id} value={order.id}>#{order.purchase_order_number} · {supplierNameFor(order.supplier_id)}</option>)}
        </select>
        {selectedOrderItems.length ? <div className="receiving-draft-lines">
          {receivingDraftItems.map((line, index) => <div className="receiving-draft-line" key={index}>
            <select aria-label={`بند الاستلام ${index + 1}`} value={line.purchaseOrderItemId} onChange={(e) => setReceiveLines((current) => current.map((item, i) => i === index ? { ...item, purchaseOrderItemId: e.target.value } : item))} required>
              <option value="">اختر بند أمر الشراء</option>{selectedOrderItems.map((item) => <option key={item.id} value={item.id}>{productNameFor(item.product_id)} · متبقٍ {item.quantity_ordered - item.quantity_received}</option>)}
            </select>
            <input aria-label={`كمية الاستلام ${index + 1}`} type="number" min="1" max={line.item ? line.item.quantity_ordered - line.item.quantity_received : undefined} step="1" value={line.quantity} onChange={(e) => setReceiveLines((current) => current.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))} required />
            <button type="button" className="ghost" onClick={() => setReceiveLines((current) => current.length === 1 ? current : current.filter((_, i) => i !== index))} disabled={busy || receiveLines.length === 1}>حذف</button>
          </div>)}
        </div> : <div className="empty-state"><strong>لا توجد بنود متبقية للاستلام.</strong><span>اختر أمرًا بحالة معتمد أو استلام جزئي.</span></div>}
        <div className="receiving-builder-actions">
          <button type="button" className="ghost" onClick={() => {
            const next = selectedOrderItems.find((item) => !receiveLines.some((line) => line.purchaseOrderItemId === item.id));
            if (next) setReceiveLines((current) => [...current, { purchaseOrderItemId: next.id, quantity: '1' }]);
          }} disabled={busy || receiveableRemaining === 0 || receiveLines.length >= 100}>+ إضافة بند</button>
          <input aria-label="ملاحظات إيصال الاستلام" value={receiveNotes} onChange={(e) => setReceiveNotes(e.target.value)} maxLength={2000} placeholder="ملاحظات الإيصال (اختياري)" />
          <span>{receiveLines.length}/100 بند · المتاح لإضافته {receiveableRemaining}</span>
        </div>
        <button disabled={busy || !selectedOrderId || !receivingDraftItems.length || receivingDraftItems.some((line) => !line.item)}>تسجيل الاستلام الذري</button>
      </form>
    </div>
    {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" className="ghost" onClick={() => void load()} disabled={loading}>إعادة تحميل المشتريات</button></div>}{message && <div className="success" role="status">{message}</div>}
    {detailOrderId&&(()=>{const order=orders.find(item=>item.id===detailOrderId);if(!order)return null;const lines=items.filter(item=>item.purchase_order_id===order.id);return <RecordDetailDrawer eyebrow="Purchasing" title={`أمر شراء #${order.purchase_order_number}`} summary={`${supplierNameFor(order.supplier_id)} · ${statusLabels[order.status]}`} fields={[{label:'المورد',value:supplierNameFor(order.supplier_id)},{label:'المستودع',value:warehouses.find(w=>w.id===order.warehouse_id)?.name??'—'},{label:'الحالة',value:statusLabels[order.status]},{label:'الإجمالي',value:`${order.total} ${order.currency}`},{label:'عدد البنود',value:lines.length},{label:'المعرّف',value:order.id},{label:'البنود',value:<div className="record-detail-lines">{lines.length?lines.map(line=><div key={line.id}><span>{productNameFor(line.product_id)}</span><strong>{line.quantity_ordered} · استلم {line.quantity_received} · {line.unit_cost} {order.currency}</strong></div>):'لا توجد بنود مرتبطة بهذا الأمر.'}</div>,wide:true}]} onClose={()=>setDetailOrderId(null)}/>})()}

  </div>;
}
