import { requireSupabase } from '../lib/supabase';
import type { OrderStatus } from '../domain/types';
import { retryRead } from '../lib/retry';

export interface CustomerOrderDetailItem { id:string; product_id:string; sku:string; name:string; unit:string; quantity:number; unit_price:number; line_total:number; currency:string; }\nexport interface CustomerOrderTimelineStep { status:OrderStatus; label:string; active:boolean; }\nexport interface CustomerOrderDetail extends CustomerOrderSummary { items:CustomerOrderDetailItem[]; timeline:CustomerOrderTimelineStep[]; statusLabel:string; }\n\nexport interface CustomerOrderSummary {
  id: string;
  order_number: number;
  status: OrderStatus;
  total: number;
  currency: string;
  created_at: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES: ReadonlySet<string> = new Set(['draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

export function assertCustomerOrderSummary(value: unknown): CustomerOrderSummary {
  if (!value || typeof value !== 'object') throw new Error('استجابة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || !UUID_PATTERN.test(item.id)) throw new Error('معرّف الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.order_number !== 'number' || !Number.isSafeInteger(item.order_number) || item.order_number <= 0) throw new Error('رقم الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.status !== 'string' || !ORDER_STATUSES.has(item.status)) throw new Error('حالة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  if (typeof item.total !== 'number' || !Number.isFinite(item.total) || item.total < 0) throw new Error('إجمالي الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.currency !== 'string' || !/^[A-Z]{3}$/.test(item.currency)) throw new Error('عملة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  if (typeof item.created_at !== 'string' || !item.created_at.trim() || Number.isNaN(Date.parse(item.created_at))) throw new Error('تاريخ الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  return { id: item.id, order_number: item.order_number, status: item.status as OrderStatus, total: item.total, currency: item.currency, created_at: item.created_at };
}

export async function getCustomerOrders(limit = 20): Promise<CustomerOrderSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const { data } = await retryRead(async () => {
    const result = await requireSupabase().from('orders').select('id,order_number,status,total,currency,created_at').order('created_at', { ascending: false }).limit(safeLimit);
    if (result.error) throw result.error;
    return result;
  });
  return (data ?? []).map((item) => assertCustomerOrderSummary({
    ...item,
    order_number: Number(item.order_number),
    total: typeof item.total === 'number' ? item.total : Number(item.total)
  }));
}
\nconst STATUS_LABELS: Record<string,string> = { draft:'مسودة', pending:'قيد المراجعة', confirmed:'مؤكد', preparing:'قيد التجهيز', ready:'جاهز', completed:'مكتمل', cancelled:'ملغي' };\nconst STATUS_FLOW: OrderStatus[] = ['pending','confirmed','preparing','ready','completed'];\n\nexport async function getCustomerOrderDetail(orderId:string): Promise<CustomerOrderDetail> {\n  if (!UUID_PATTERN.test(orderId)) throw new Error('معرّف الطلب غير صالح.');\n  const client = requireSupabase();\n  const { data: order, error: orderError } = await client.from('orders').select('id,order_number,status,total,currency,created_at').eq('id',orderId).maybeSingle();\n  if (orderError) throw orderError;\n  if (!order) throw new Error('الطلب غير موجود أو غير متاح لهذا الحساب.');\n  const [{ data: items, error: itemsError }, { data: history, error: historyError }] = await Promise.all([\n    client.from('order_items').select('id,product_id,quantity,unit_price,line_total,currency,products:products(sku,name,unit)').eq('order_id',orderId).order('created_at'),\n    client.from('order_status_history').select('from_status,to_status,created_at').eq('order_id',orderId).order('created_at')\n  ]);\n  if (itemsError) throw itemsError;\n  if (historyError) throw historyError;\n  const mappedItems: CustomerOrderDetailItem[] = (items??[]).map((row:any) => {\n    const product = Array.isArray(row.products) ? row.products[0] : row.products;\n    return { id:String(row.id), product_id:String(row.product_id), sku:String(product?.sku??'—'), name:String(product?.name??'صنف غير متاح'), unit:String(product?.unit??'وحدة'), quantity:Number(row.quantity), unit_price:Number(row.unit_price), line_total:Number(row.line_total), currency:String(row.currency??order.currency) };\n  });\n  const reached = new Set<string>(['pending', ...((history??[]).map((h:any)=>String(h.to_status)))]);\n  const timeline = STATUS_FLOW.map(status=>({status,label:STATUS_LABELS[status],active:reached.has(status) || status===order.status}));\n  return { ...assertCustomerOrderSummary({...order, order_number:Number(order.order_number), total:Number(order.total)}), items:mappedItems, timeline, statusLabel:STATUS_LABELS[order.status]??order.status };\n}\n