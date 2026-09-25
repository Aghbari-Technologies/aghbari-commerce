import { requireSupabase } from '../lib/supabase';

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'approved' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseLineInput { productId: string; quantity: number; unitCost: number; }
export interface PurchaseOrderInput {
  supplierId: string;
  warehouseId: string;
  idempotencyKey: string;
  lines: PurchaseLineInput[];
  currency?: string;
  notes?: string;
}
export interface ReceiveLineInput { purchaseOrderItemId: string; productId: string; quantity: number; }
export interface PurchaseReceiptDetailItem {
  id: string; purchase_order_item_id: string; product_id: string;
  sku: string; name: string; unit: string; quantity_received: number;
  unit_cost: number; line_total: number;
}


const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_LINES = 100;
const MAX_QUANTITY = 10_000;

function requireUuid(value: string, field: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error(`${field} غير صالح.`);
  return normalized;
}

function requireIdempotencyKey(value: string): string {
  const normalized = value.trim();
  if (normalized.length < 16 || normalized.length > 200) throw new Error('مفتاح منع التكرار يجب أن يكون بين 16 و200 حرف.');
  return normalized;
}

function requirePositiveQuantity(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > MAX_QUANTITY) {
    throw new Error(`${field} يجب أن يكون عددًا صحيحًا بين 1 و${MAX_QUANTITY}.`);
  }
  return value;
}

function requireNonNegativeFiniteNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} يجب أن يكون رقمًا غير سالب.`);
  return value;
}

function requireCurrency(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(normalized)) throw new Error('العملة يجب أن تكون رمزًا من ثلاثة أحرف.');
  return normalized;
}

export function validatePurchaseOrderInput(input: PurchaseOrderInput): void {
  requireUuid(input.supplierId, 'المورد');
  requireUuid(input.warehouseId, 'المخزن');
  requireIdempotencyKey(input.idempotencyKey);
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > MAX_LINES) throw new Error(`يجب أن يحتوي أمر الشراء على 1 إلى ${MAX_LINES} أصناف.`);
  const products = new Set<string>();
  for (const line of input.lines) {
    const productId = requireUuid(line.productId, 'المنتج');
    if (products.has(productId)) throw new Error('لا يمكن تكرار المنتج في أمر الشراء.');
    products.add(productId);
    requirePositiveQuantity(line.quantity, 'الكمية');
    requireNonNegativeFiniteNumber(line.unitCost, 'تكلفة الوحدة');
  }
  if (input.currency !== undefined) requireCurrency(input.currency);
  if (input.notes !== undefined && input.notes.length > 2000) throw new Error('ملاحظات أمر الشراء طويلة جدًا.');
}

export function validateReceiveInput(input: { purchaseOrderId: string; idempotencyKey: string; lines: ReceiveLineInput[]; notes?: string }): void {
  requireUuid(input.purchaseOrderId, 'أمر الشراء');
  requireIdempotencyKey(input.idempotencyKey);
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > MAX_LINES) throw new Error(`يجب أن يحتوي الاستلام على 1 إلى ${MAX_LINES} أصناف.`);
  const items = new Set<string>();
  for (const line of input.lines) {
    const itemId = requireUuid(line.purchaseOrderItemId, 'بند أمر الشراء');
    requireUuid(line.productId, 'المنتج');
    if (items.has(itemId)) throw new Error('لا يمكن تكرار بند أمر الشراء في الاستلام.');
    items.add(itemId);
    requirePositiveQuantity(line.quantity, 'كمية الاستلام');
  }
  if (input.notes !== undefined && input.notes.length > 2000) throw new Error('ملاحظات الاستلام طويلة جدًا.');
}

export async function createSupplier(input: { name: string; phone?: string; email?: string; address?: string; }) {
  const name = input.name.trim();
  if (!name || name.length > 200) throw new Error('اسم المورد مطلوب وبحد أقصى 200 حرف.');
  if (input.email !== undefined && input.email.length > 320) throw new Error('البريد الإلكتروني طويل جدًا.');
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_supplier', {
    p_name: name, p_phone: input.phone?.trim() || null, p_email: input.email?.trim() || null, p_address: input.address?.trim() || null
  });
  if (error) throw error;
  return data;
}

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  validatePurchaseOrderInput(input);
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_purchase_order', {
    p_supplier_id: input.supplierId.trim(), p_warehouse_id: input.warehouseId.trim(), p_idempotency_key: input.idempotencyKey.trim(),
    p_lines: input.lines.map((line) => ({ product_id: line.productId.trim(), quantity: line.quantity, unit_cost: line.unitCost })),
    p_currency: input.currency?.trim().toUpperCase() ?? 'YER', p_notes: input.notes?.trim() || null
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function submitPurchaseOrder(purchaseOrderId: string) {
  const id = requireUuid(purchaseOrderId, 'أمر الشراء');
  const { data, error } = await requireSupabase().rpc('submit_purchase_order', { p_purchase_order_id: id });
  if (error) throw error;
  return data;
}

export async function approvePurchaseOrder(purchaseOrderId: string) {
  const id = requireUuid(purchaseOrderId, 'أمر الشراء');
  const { data, error } = await requireSupabase().rpc('approve_purchase_order', { p_purchase_order_id: id });
  if (error) throw error;
  return data;
}

export async function receivePurchaseOrder(input: { purchaseOrderId: string; idempotencyKey: string; lines: ReceiveLineInput[]; notes?: string; }) {
  validateReceiveInput(input);
  const client = requireSupabase();
  const { data, error } = await client.rpc('receive_purchase_order', {
    p_purchase_order_id: input.purchaseOrderId.trim(), p_idempotency_key: input.idempotencyKey.trim(),
    p_lines: input.lines.map((line) => ({ purchase_order_item_id: line.purchaseOrderItemId.trim(), product_id: line.productId.trim(), quantity: line.quantity })), p_notes: input.notes?.trim() || null
  });
  if (error) throw error;
  return data?.[0] ?? null;
}


export function assertPurchaseReceiptDetailItem(value: unknown): PurchaseReceiptDetailItem {
  if (!value || typeof value !== 'object') throw new Error('بند إيصال الاستلام غير صالح.');
  const item = value as Record<string, unknown>;
  for (const [field,label] of [['id','معرّف البند'],['purchase_order_item_id','بند أمر الشراء'],['product_id','المنتج']] as const) {
    if (typeof item[field] !== 'string' || !UUID_PATTERN.test(item[field] as string)) throw new Error(`${label} في إيصال الاستلام غير صالح.`);
  }
  for (const [field,label] of [['sku','SKU'],['name','اسم الصنف'],['unit','الوحدة']] as const) {
    if (typeof item[field] !== 'string' || !(item[field] as string).trim()) throw new Error(`${label} في إيصال الاستلام غير صالح.`);
  }
  const quantity = typeof item.quantity_received === 'number' ? item.quantity_received : Number(item.quantity_received);
  const unitCost = typeof item.unit_cost === 'number' ? item.unit_cost : Number(item.unit_cost);
  const lineTotal = typeof item.line_total === 'number' ? item.line_total : Number(item.line_total);
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('كمية الاستلام غير صالحة.');
  if (!Number.isFinite(unitCost) || unitCost < 0 || !Number.isFinite(lineTotal) || lineTotal < 0) throw new Error('قيمة بند الاستلام غير صالحة.');
  return { id:item.id as string, purchase_order_item_id:item.purchase_order_item_id as string, product_id:item.product_id as string, sku:item.sku as string, name:item.name as string, unit:item.unit as string, quantity_received:quantity, unit_cost:unitCost, line_total:lineTotal };
}

export async function getPurchaseReceiptDetail(receiptId: string) {
  const id = requireUuid(receiptId, 'إيصال الاستلام');
  const client = requireSupabase();
  const { data: receipt, error: receiptError } = await client.from('purchase_receipts').select('id,receipt_number,purchase_order_id,warehouse_id,received_by,received_at,notes').eq('id', id).maybeSingle();
  if (receiptError) throw receiptError;
  if (!receipt) throw new Error('إيصال الاستلام غير موجود أو غير متاح لهذا الحساب.');
  const [{ data: items, error: itemsError }, { data: order, error: orderError }, { data: warehouse, error: warehouseError }] = await Promise.all([
    client.from('purchase_receipt_items').select('id,purchase_order_item_id,product_id,quantity_received,unit_cost,line_total,products(sku,name,unit)').eq('receipt_id', id).order('created_at'),
    client.from('purchase_orders').select('id,purchase_order_number,supplier_id,warehouse_id,total,currency').eq('id', receipt.purchase_order_id).maybeSingle(),
    client.from('warehouses').select('id,name').eq('id', receipt.warehouse_id).maybeSingle()
  ]);
  if (itemsError) throw itemsError;
  if (orderError) throw orderError;
  if (warehouseError) throw warehouseError;
  let supplierName = 'مورد غير معروف';
  if (order?.supplier_id) {
    const { data: supplier, error: supplierError } = await client.from('suppliers').select('id,name').eq('id', order.supplier_id).maybeSingle();
    if (supplierError) throw supplierError;
    supplierName = supplier?.name ?? supplierName;
  }
  const mappedItems = (items ?? []).map((row) => {
    const value = row as Record<string, unknown>;
    const productRelation = value.products as { sku?: string; name?: string; unit?: string } | Array<{ sku?: string; name?: string; unit?: string }> | null;
    const product = Array.isArray(productRelation) ? productRelation[0] : productRelation;
    return assertPurchaseReceiptDetailItem({
      ...value,
      sku:product?.sku ?? '—',
      name:product?.name ?? 'صنف غير متاح',
      unit:product?.unit ?? 'وحدة'
    });
  });
  return {
    ...receipt,
    receipt_number:Number(receipt.receipt_number),
    purchase_order_number:order?.purchase_order_number ? Number(order.purchase_order_number) : null,
    supplier_name:supplierName,
    warehouse_name:warehouse?.name ?? 'مستودع غير معروف',
    purchase_order_total:order?.total == null ? null : Number(order.total),
    currency:order?.currency ?? 'YER',
    items:mappedItems,
    total:mappedItems.reduce((sum,item)=>sum+item.line_total,0)
  };
}
