import { useState } from 'react';
import { supabase } from './lib/supabase';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
const PAGE_SIZE = 1000;
const MAX_EXPORT_ROWS = 10000;
const MAX_PRICE_ROWS = 30000;

function escapeCsv(value: unknown) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Record<string, unknown>>) {
  const csv = [headers, ...rows.map((row) => headers.map((header) => escapeCsv(row[header])))]
    .map((row) => row.join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchAllProducts() {
  const client = supabase;
  if (!client) throw new Error('خدمة البيانات غير متاحة.');
  const rows: Array<{ id: string; sku: string; name: string; unit: string; status: string; created_at: string }> = [];
  for (let from = 0; from < MAX_EXPORT_ROWS; from += PAGE_SIZE) {
    const { data, error } = await client.from('products').select('id,sku,name,unit,status,created_at').order('name').range(from, Math.min(from + PAGE_SIZE - 1, MAX_EXPORT_ROWS - 1));
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  if (rows.length >= MAX_EXPORT_ROWS) throw new Error(`تصدير أكثر من ${MAX_EXPORT_ROWS.toLocaleString('ar-YE')} منتج غير مدعوم في عملية واحدة.`);
  return rows;
}

export default function ExportPanel({ role }: { role: UserRole }) {
  const canExport = role === 'owner' || role === 'admin' || role === 'sales' || role === 'warehouse';
  const canPublish = role === 'owner' || role === 'admin';
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [gatewayMessage, setGatewayMessage] = useState<string | null>(null);

  if (!canExport || !supabase) return null;

  async function exportProducts() {
    const client = supabase;
    if (!client) return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const now = new Date().toISOString();
      const [products, priceResult] = await Promise.all([
        fetchAllProducts(),
        client.from('product_prices').select('product_id,amount,valid_from,valid_to,price_lists!inner(tier,currency)').lte('valid_from', now).or(`valid_to.is.null,valid_to.gte.${now}`).order('valid_from', { ascending: false }).limit(MAX_PRICE_ROWS)
      ]);
      if (priceResult.error) throw priceResult.error;
      if ((priceResult.data?.length ?? 0) >= MAX_PRICE_ROWS) throw new Error(`بيانات الأسعار تتجاوز الحد الآمن وهو ${MAX_PRICE_ROWS.toLocaleString('ar-YE')} سجل.`);
      const priceByProduct = new Map<string, { retail?: number; wholesale?: number; distributor?: number; currency?: string }>();
      for (const row of priceResult.data ?? []) {
        const tier = (row.price_lists as { tier?: string; currency?: string } | null)?.tier;
        if (!tier || !['retail', 'wholesale', 'distributor'].includes(tier)) continue;
        const current = priceByProduct.get(row.product_id) ?? {};
        if (current[tier as 'retail' | 'wholesale' | 'distributor'] === undefined) current[tier as 'retail' | 'wholesale' | 'distributor'] = Number(row.amount);
        current.currency ??= (row.price_lists as { currency?: string } | null)?.currency;
        priceByProduct.set(row.product_id, current);
      }
      const rows = products.map((product) => ({ SKU: product.sku, Name: product.name, Unit: product.unit, Status: product.status, 'Retail Price': priceByProduct.get(product.id)?.retail ?? '', 'Wholesale Price': priceByProduct.get(product.id)?.wholesale ?? '', 'Distributor Price': priceByProduct.get(product.id)?.distributor ?? '', Currency: priceByProduct.get(product.id)?.currency ?? 'YER', CreatedAt: product.created_at }));
      downloadCsv(`aghbari-products-${new Date().toISOString().slice(0, 10)}.csv`, ['SKU','Name','Unit','Status','Retail Price','Wholesale Price','Distributor Price','Currency','CreatedAt'], rows);
      setMessage(`تم تصدير ${rows.length} منتجًا.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تصدير البيانات.'); }
    finally { setBusy(false); }
  }


  async function exportCustomers() {
    const client = supabase; if(!client) return;
    setBusy(true); setError(null); setMessage(null);
    try { const { data, error: queryError } = await client.from('customers').select('name,phone,tier,is_active,created_at').order('created_at',{ascending:false}).limit(MAX_EXPORT_ROWS); if(queryError) throw queryError;
      const rows=(data??[]).map(row=>({Name:row.name,Phone:row.phone??'',Tier:row.tier,Status:row.is_active?'active':'paused',CreatedAt:row.created_at}));
      downloadCsv(\`aghbari-customers-\${new Date().toISOString().slice(0,10)}.csv\`,['Name','Phone','Tier','Status','CreatedAt'],rows); setMessage(\`تم تصدير \${rows.length} عميلًا.\`);
    }catch(e){setError(e instanceof Error?e.message:'تعذر تصدير العملاء.');}finally{setBusy(false);}
  }
  async function exportOrders() {
    const client = supabase; if(!client) return;
    setBusy(true); setError(null); setMessage(null);
    try { const { data, error: queryError } = await client.from('orders').select('order_number,status,total,currency,payment_method,created_at').order('created_at',{ascending:false}).limit(MAX_EXPORT_ROWS); if(queryError) throw queryError;
      const rows=(data??[]).map(row=>({OrderNumber:row.order_number,Status:row.status,Total:Number(row.total),Currency:row.currency,PaymentMethod:row.payment_method??'',CreatedAt:row.created_at}));
      downloadCsv(\`aghbari-orders-\${new Date().toISOString().slice(0,10)}.csv\`,['OrderNumber','Status','Total','Currency','PaymentMethod','CreatedAt'],rows); setMessage(\`تم تصدير \${rows.length} طلبًا.\`);
    }catch(e){setError(e instanceof Error?e.message:'تعذر تصدير الطلبات.');}finally{setBusy(false);}
  }
  async function exportInventory() {
    const client = supabase; if(!client) return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const [{data:balances,error:balanceError},{data:products,error:productsError},{data:warehouses,error:warehouseError}]=await Promise.all([
        client.from('inventory_balances').select('warehouse_id,product_id,quantity,updated_at').order('updated_at',{ascending:false}).limit(MAX_EXPORT_ROWS),
        client.from('products').select('id,sku,name').limit(MAX_EXPORT_ROWS),
        client.from('warehouses').select('id,name').limit(MAX_EXPORT_ROWS)
      ]);
      if(balanceError) throw balanceError; if(productsError) throw productsError; if(warehouseError) throw warehouseError;
      const productMap=new Map((products??[]).map(row=>[row.id,row])); const warehouseMap=new Map((warehouses??[]).map(row=>[row.id,row]));
      const rows=(balances??[]).map(row=>({SKU:productMap.get(row.product_id)?.sku??row.product_id,Product:productMap.get(row.product_id)?.name??'',Warehouse:warehouseMap.get(row.warehouse_id)?.name??row.warehouse_id,Quantity:Number(row.quantity),UpdatedAt:row.updated_at}));
      downloadCsv(\`aghbari-inventory-\${new Date().toISOString().slice(0,10)}.csv\`,['SKU','Product','Warehouse','Quantity','UpdatedAt'],rows); setMessage(\`تم تصدير \${rows.length} حركة رصيد مخزني.\`);
    }catch(e){setError(e instanceof Error?e.message:'تعذر تصدير المخزون.');}finally{setBusy(false);}
  }

  async function publishForReporting() {
    const client = supabase;
    if (!client || !canPublish) return;
    setPublishing(true); setError(null); setGatewayMessage(null);
    try {
      const period = new Date().toISOString().slice(0, 10);
      const idempotencyKey = `products-${period}`;
      const { data, error: invokeError } = await client.functions.invoke('reporting-gateway', {
        body: {
          source_dataset_id: 'commerce-products-v1',
          source_version: '0.1.0',
          schema_version: '1.0',
          idempotency_key: idempotencyKey,
          data_period_start: period,
          data_period_end: period
        }
      });
      if (invokeError) throw invokeError;
      if (!data?.ok) throw new Error(data?.reason ?? 'تعذر نشر البيانات التحليلية.');
      setGatewayMessage(data.already_active ? `مجموعة البيانات ${data.dataset_id} منشورة بالفعل.` : `تم تمرير ${data.record_count ?? 0} سجلًا إلى بوابة التقارير.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر الوصول إلى بوابة التقارير.');
    } finally { setPublishing(false); }
  }

  return <div className="admin-card">
    <h3>مركز البيانات والتقارير</h3>
    <p>التصدير التشغيلي يقرأ من الحقيقة المصرح بها داخل المؤسسة. تمر بيانات التحليل عبر البوابة المنضبطة فقط.</p>
    {canPublish && <button disabled={busy || publishing} onClick={() => void publishForReporting()}>{publishing ? 'جارٍ تمرير البيانات…' : 'إرسال إلى بوابة التقارير'}</button>}
    <div className="admin-grid export-action-grid"><button disabled={busy || publishing} onClick={() => void exportProducts()}>{busy ? 'جارٍ التصدير…' : 'تصدير الكتالوج والأسعار'}</button><button disabled={busy || publishing} onClick={() => void exportCustomers()}>تصدير العملاء</button><button disabled={busy || publishing} onClick={() => void exportOrders()}>تصدير الطلبات</button><button disabled={busy || publishing} onClick={() => void exportInventory()}>تصدير المخزون</button></div>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {message && <div className="success" role="status">{message}</div>}
    {gatewayMessage && <div className="success" role="status">{gatewayMessage}</div>}
  </div>;
}