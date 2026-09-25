import { requireSupabase } from '../lib/supabase';
import type { OrderStatus } from '../domain/types';
import { retryRead } from '../lib/retry';

export interface CustomerOrderDetailItem { id:string; product_id:string; sku:string; name:string; unit:string; quantity:number; unit_price:number; line_total:number; currency:string; }
export interface CustomerOrderTimelineStep { status:OrderStatus; label:string; active:boolean; }
export interface CustomerOrderDetail extends CustomerOrderSummary { items:CustomerOrderDetailItem[]; timeline:CustomerOrderTimelineStep[]; statusLabel:string; }

export interface CustomerOrderSummary {
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

export interface CustomerOrderPage {
  items: CustomerOrderSummary[];
  total: number;
  hasMore: boolean;
}

export type CustomerOrderStatusFilter = 'all' | OrderStatus;

export async function getCustomerOrdersPage({
  limit = 10,
  offset = 0,
  query = '',
  status = 'all'
}: {
  limit?: number;
  offset?: number;
  query?: string;
  status?: CustomerOrderStatusFilter;
} = {}): Promise<CustomerOrderPage> {
  const safeLimit = Math.min(Math.max(Number.isSafeInteger(limit) ? limit : 10, 1), 50);
  const safeOffset = Math.min(Math.max(Number.isSafeInteger(offset) ? offset : 0, 0), 100000);
  const needle = query.trim().toLocaleLowerCase();
  const statusByLabel = Object.entries(STATUS_LABELS).find(([key, label]) => key === needle || label.toLocaleLowerCase() === needle)?.[0];
  const numericOrderNumber = /^\\d+$/.test(needle) ? Number(needle) : NaN;
  if (needle && !Number.isSafeInteger(numericOrderNumber) && !statusByLabel) return { items: [], total: 0, hasMore: false };

  const { data, count } = await retryRead(async () => {
    let request = requireSupabase().from('orders')
      .select('id,order_number,status,total,currency,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);
    if (status !== 'all') request = request.eq('status', status);
    if (Number.isSafeInteger(numericOrderNumber)) request = request.eq('order_number', numericOrderNumber);
    else if (statusByLabel) request = request.eq('status', statusByLabel);
    const result = await request;
    if (result.error) throw result.error;
    return result;
  });
  const items = (data ?? []).map((item) => assertCustomerOrderSummary({
    ...item,
    order_number: Number(item.order_number),
    total: typeof item.total === 'number' ? item.total : Number(item.total)
  }));
  const total = Math.max(0, count ?? items.length);
  return { items, total, hasMore: safeOffset + items.length < total };
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

const STATUS_LABELS: Record<string,string> = { draft:'مسودة', pending:'قيد المراجعة', confirmed:'مؤكد', preparing:'قيد التجهيز', ready:'جاهز', completed:'مكتمل', cancelled:'ملغي' };
const STATUS_FLOW: OrderStatus[] = ['pending','confirmed','preparing','ready','completed'];
type CustomerOrderDetailRow = { id:string; product_id:string; quantity:number|string; unit_price:number|string; line_total:number|string; currency:string|null; products:{sku:string|null;name:string|null;unit:string|null}|{sku:string|null;name:string|null;unit:string|null}[]|null };
type CustomerOrderHistoryRow = { from_status:OrderStatus|null; to_status:OrderStatus; created_at:string };

export function buildCustomerOrderTimeline(orderStatus: OrderStatus, history: CustomerOrderHistoryRow[]): CustomerOrderTimelineStep[] {
  const reached = new Set<OrderStatus>();
  for (const entry of history) {
    if (entry.from_status) reached.add(entry.from_status);
    reached.add(entry.to_status);
  }
  const currentIndex = STATUS_FLOW.indexOf(orderStatus);
  return STATUS_FLOW.map((status, index) => ({
    status,
    label: STATUS_LABELS[status],
    active: reached.has(status) || (currentIndex >= 0 && index <= currentIndex)
  }));
}

function assertDetailNumber(value: unknown, label: string, integer = false): number {
  const normalized = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(normalized) || normalized < 0 || (integer && !Number.isSafeInteger(normalized))) {
    throw new Error(`قيمة ${label} غير صالحة. لم يتم إثبات نجاح العملية.`);
  }
  return normalized;
}

export async function getCustomerOrderDetail(orderId:string): Promise<CustomerOrderDetail> {
  if (!UUID_PATTERN.test(orderId)) throw new Error('معرّف الطلب غير صالح.');
  const client = requireSupabase();
  const { data: order, error: orderError } = await client.from('orders').select('id,order_number,status,total,currency,created_at').eq('id',orderId).maybeSingle();
  if (orderError) throw orderError;
  if (!order) throw new Error('الطلب غير موجود أو غير متاح لهذا الحساب.');
  const [{ data: items, error: itemsError }, { data: history, error: historyError }] = await Promise.all([
    client.from('order_items').select('id,product_id,quantity,unit_price,line_total,currency,products:products(sku,name,unit)').eq('order_id',orderId).order('created_at'),
    client.from('order_status_history').select('from_status,to_status,created_at').eq('order_id',orderId).order('created_at')
  ]);
  if (itemsError) throw itemsError;
  if (historyError) throw historyError;
  const mappedItems: CustomerOrderDetailItem[] = (items??[]).map((row:CustomerOrderDetailRow) => {
    if (typeof row.id !== 'string' || !UUID_PATTERN.test(row.id) || typeof row.product_id !== 'string' || !UUID_PATTERN.test(row.product_id)) {
      throw new Error('بيانات أصناف الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
    }
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const quantity = assertDetailNumber(row.quantity, 'كمية الصنف', true);
    if (quantity < 1) throw new Error('كمية الصنف غير صالحة. لم يتم إثبات نجاح العملية.');
    const unitPrice = assertDetailNumber(row.unit_price, 'سعر الوحدة');
    const lineTotal = assertDetailNumber(row.line_total, 'إجمالي السطر');
    const currency = String(row.currency??order.currency);
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error('عملة السطر غير صالحة. لم يتم إثبات نجاح العملية.');
    return { id:row.id, product_id:row.product_id, sku:String(product?.sku??'—'), name:String(product?.name??'صنف غير متاح'), unit:String(product?.unit??'وحدة'), quantity, unit_price:unitPrice, line_total:lineTotal, currency };
  });
  const safeHistory = (history??[] as CustomerOrderHistoryRow[]).map((entry) => {
    if (!ORDER_STATUSES.has(entry.to_status)) throw new Error('سجل حالة الطلب غير صالح. لم يتم إثبات نجاح العملية.');
    return { ...entry, to_status: entry.to_status as OrderStatus };
  });
  const timeline = buildCustomerOrderTimeline(order.status as OrderStatus, safeHistory);
  return { ...assertCustomerOrderSummary({...order, order_number:Number(order.order_number), total:Number(order.total)}), items:mappedItems, timeline, statusLabel:STATUS_LABELS[order.status]??order.status };
}
