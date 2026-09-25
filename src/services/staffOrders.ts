import type { OrderStatus } from '../domain/types';
import { requireSupabase } from '../lib/supabase';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES: ReadonlySet<string> = new Set(['draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

export interface StaffOrderSummary {
  id: string; order_number: number; customer_id: string; customer_name: string; warehouse_id: string;
  status: OrderStatus; total: number; currency: string; created_at: string; updated_at: string;
}

export interface StaffOrderDetailItem {
  id: string; product_id: string; sku: string; name: string; unit: string;
  quantity: number; unit_price: number; line_total: number; currency: string;
}

export interface StaffOrderHistoryEntry {
  from_status: OrderStatus | null; to_status: OrderStatus; created_at: string;
}

export interface StaffOrderDetail extends StaffOrderSummary {
  warehouse_name: string;
  items: StaffOrderDetailItem[];
  history: StaffOrderHistoryEntry[];
}

function assertDetailNumber(value: unknown, label: string, integer = false): number {
  const normalized = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(normalized) || normalized < 0 || (integer && !Number.isSafeInteger(normalized))) {
    throw new Error(`قيمة ${label} في تفاصيل الطلب غير صالحة. لم يتم إثبات نجاح العملية.`);
  }
  return normalized;
}

function assertStatus(value: unknown, label: string): OrderStatus {
  if (typeof value !== 'string' || !ORDER_STATUSES.has(value)) throw new Error(`حالة ${label} غير صالحة. لم يتم إثبات نجاح العملية.`);
  return value as OrderStatus;
}

export function assertStaffOrderDetailItem(value: unknown): StaffOrderDetailItem {
  if (!value || typeof value !== 'object') throw new Error('بند تفاصيل الطلب غير صالح.');
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || !UUID_PATTERN.test(item.id)) throw new Error('معرّف بند الطلب غير صالح.');
  if (typeof item.product_id !== 'string' || !UUID_PATTERN.test(item.product_id)) throw new Error('معرّف المنتج في الطلب غير صالح.');
  if (typeof item.sku !== 'string' || !item.sku.trim()) throw new Error('SKU بند الطلب غير صالح.');
  if (typeof item.name !== 'string' || !item.name.trim()) throw new Error('اسم بند الطلب غير صالح.');
  if (typeof item.unit !== 'string' || !item.unit.trim()) throw new Error('وحدة بند الطلب غير صالحة.');
  const quantity = assertDetailNumber(item.quantity, 'الكمية', true);
  if (quantity < 1) throw new Error('كمية بند الطلب يجب أن تكون موجبة.');
  const unitPrice = assertDetailNumber(item.unit_price, 'سعر الوحدة');
  const lineTotal = assertDetailNumber(item.line_total, 'إجمالي السطر');
  if (typeof item.currency !== 'string' || !/^[A-Z]{3}$/.test(item.currency)) throw new Error('عملة بند الطلب غير صالحة.');
  return {
    id:item.id, product_id:item.product_id, sku:item.sku, name:item.name, unit:item.unit,
    quantity, unit_price:unitPrice, line_total:lineTotal, currency:item.currency
  };
}

export function assertStaffOrderDetail(value: unknown): StaffOrderDetail {
  if (!value || typeof value !== 'object') throw new Error('تفاصيل الطلب التشغيلي غير صالحة. لم يتم إثبات نجاح العملية.');
  const item = value as Record<string, unknown>;
  const summary = assertStaffOrderSummary(item);
  if (typeof item.warehouse_name !== 'string' || !item.warehouse_name.trim()) throw new Error('اسم المستودع في تفاصيل الطلب غير صالح.');
  if (!Array.isArray(item.items)) throw new Error('بنود تفاصيل الطلب غير صالحة.');
  if (!Array.isArray(item.history)) throw new Error('سجل حالات الطلب غير صالح.');
  const items = item.items.map(assertStaffOrderDetailItem);
  const history = item.history.map((entry) => {
    if (!entry || typeof entry !== 'object') throw new Error('سجل حالة الطلب غير صالح.');
    const row = entry as Record<string, unknown>;
    return {
      from_status: row.from_status == null ? null : assertStatus(row.from_status, 'الحالة السابقة'),
      to_status: assertStatus(row.to_status, 'الحالة التالية'),
      created_at: typeof row.created_at === 'string' && !Number.isNaN(Date.parse(row.created_at)) ? row.created_at : (()=>{ throw new Error('تاريخ حركة الطلب غير صالح.'); })()
    };
  });
  return {...summary, warehouse_name:item.warehouse_name, items, history};
}

export function assertStaffOrderSummary(value: unknown): StaffOrderSummary {
  if (!value || typeof value !== 'object') throw new Error('استجابة الطلب التشغيلي غير صالحة. لم يتم إثبات نجاح العملية.');
  const item = value as Record<string, unknown>;
  const uuidFields: Array<[unknown, string]> = [[item.id, 'معرّف الطلب'], [item.customer_id, 'معرّف العميل'], [item.warehouse_id, 'معرّف المستودع']];
  for (const [valueToCheck, label] of uuidFields) if (typeof valueToCheck !== 'string' || !UUID_PATTERN.test(valueToCheck)) throw new Error(`${label} غير صالح. لم يتم إثبات نجاح العملية.`);
  if (typeof item.order_number !== 'number' || !Number.isSafeInteger(item.order_number) || item.order_number <= 0) throw new Error('رقم الطلب التشغيلي غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.status !== 'string' || !ORDER_STATUSES.has(item.status)) throw new Error('حالة الطلب التشغيلي غير صالحة. لم يتم إثبات نجاح العملية.');
  if (typeof item.total !== 'number' || !Number.isFinite(item.total) || item.total < 0) throw new Error('إجمالي الطلب التشغيلي غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.currency !== 'string' || !/^[A-Z]{3}$/.test(item.currency)) throw new Error('عملة الطلب التشغيلي غير صالحة. لم يتم إثبات نجاح العملية.');
  if (typeof item.customer_name !== 'string' || !item.customer_name.trim()) throw new Error('اسم العميل في الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.created_at !== 'string' || !item.created_at.trim() || Number.isNaN(Date.parse(item.created_at))) throw new Error('تاريخ إنشاء الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.updated_at !== 'string' || !item.updated_at.trim() || Number.isNaN(Date.parse(item.updated_at))) throw new Error('تاريخ تحديث الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  return item as unknown as StaffOrderSummary;
}

export async function getStaffOrders(limit = 50): Promise<StaffOrderSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const { data, error } = await requireSupabase().from('orders').select('id,order_number,customer_id,warehouse_id,status,total,currency,created_at,updated_at,customers(name)').order('created_at', { ascending: false }).limit(safeLimit);
  if (error) throw error;
  return (data ?? []).map((row) => {
    const item = row as typeof row & { customers?: { name?: string } | null };
    return assertStaffOrderSummary({ id: item.id, order_number: Number(item.order_number), customer_id: item.customer_id, customer_name: item.customers?.name ?? 'عميل غير معروف', warehouse_id: item.warehouse_id, status: item.status, total: typeof item.total === 'number' ? item.total : Number(item.total), currency: item.currency, created_at: item.created_at, updated_at: item.updated_at });
  });
}

export async function transitionOrder(orderId: string, toStatus: OrderStatus): Promise<StaffOrderSummary> {
  if (typeof orderId !== 'string' || !UUID_PATTERN.test(orderId)) throw new Error('معرّف الطلب غير صالح.');
  if (typeof toStatus !== 'string' || !ORDER_STATUSES.has(toStatus)) throw new Error('حالة انتقال الطلب غير صالحة.');
  const { data, error } = await requireSupabase().rpc('transition_order', { p_order_id: orderId, p_to_status: toStatus });
  if (error) throw error;
  return assertStaffOrderSummary(data as unknown);
}

export async function getStaffOrderDetail(orderId: string): Promise<StaffOrderDetail> {
  if (typeof orderId !== 'string' || !UUID_PATTERN.test(orderId)) throw new Error('معرّف الطلب غير صالح.');
  const client = requireSupabase();
  const { data: order, error: orderError } = await client
    .from('orders')
    .select('id,order_number,customer_id,warehouse_id,status,total,currency,created_at,updated_at,customers(name),warehouses(name)')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) throw new Error('الطلب غير موجود أو غير متاح لهذا الحساب.');

  const [{ data: items, error: itemsError }, { data: history, error: historyError }] = await Promise.all([
    client.from('order_items')
      .select('id,product_id,quantity,unit_price,line_total,currency,products(sku,name,unit)')
      .eq('order_id', orderId)
      .order('created_at'),
    client.from('order_status_history')
      .select('from_status,to_status,created_at')
      .eq('order_id', orderId)
      .order('created_at')
  ]);
  if (itemsError) throw itemsError;
  if (historyError) throw historyError;

  const orderRow = order as Record<string, unknown>;
  const customerRelation = orderRow.customers as { name?: string } | Array<{ name?: string }> | null;
  const warehouseRelation = orderRow.warehouses as { name?: string } | Array<{ name?: string }> | null;
  const customerName = Array.isArray(customerRelation) ? customerRelation[0]?.name : customerRelation?.name;
  const warehouseName = Array.isArray(warehouseRelation) ? warehouseRelation[0]?.name : warehouseRelation?.name;

  const mappedItems = (items ?? []).map((row) => {
    const value = row as Record<string, unknown>;
    const productRelation = value.products as { sku?: string; name?: string; unit?: string } | Array<{ sku?: string; name?: string; unit?: string }> | null;
    const product = Array.isArray(productRelation) ? productRelation[0] : productRelation;
    return assertStaffOrderDetailItem({
      id:value.id,
      product_id:value.product_id,
      sku:product?.sku ?? '—',
      name:product?.name ?? 'صنف غير متاح',
      unit:product?.unit ?? 'وحدة',
      quantity:value.quantity,
      unit_price:value.unit_price,
      line_total:value.line_total,
      currency:value.currency ?? orderRow.currency
    });
  });

  return assertStaffOrderDetail({
    ...orderRow,
    order_number:Number(orderRow.order_number),
    total:typeof orderRow.total === 'number' ? orderRow.total : Number(orderRow.total),
    customer_name:customerName ?? 'عميل غير معروف',
    warehouse_name:warehouseName ?? 'مستودع غير معروف',
    items:mappedItems,
    history:history ?? []
  });
}
