import { requireSupabase } from '../lib/supabase';
import type { OrderDraft } from '../domain/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES = new Set(['draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
const MAX_ORDER_LINES = 100;

function assertUuid(value: unknown, operation: string) {
  if (typeof value !== 'string') throw new Error(`معرّف ${operation} غير صالح.`);
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error(`معرّف ${operation} غير صالح.`);
  return normalized;
}

function assertIdempotencyKey(value: unknown) {
  if (typeof value !== 'string') throw new Error('مفتاح العملية غير صالح.');
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH) throw new Error('مفتاح العملية غير صالح.');
  return normalized;
}

function assertOrderLines(lines: unknown) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_ORDER_LINES) throw new Error('يجب أن يحتوي الطلب على أصناف صالحة.');
  const seen = new Set<string>();
  return lines.map((line) => {
    if (!line || typeof line !== 'object') throw new Error('بيانات صنف الطلب غير صالحة.');
    const candidate = line as { productId?: unknown; quantity?: unknown };
    const productId = assertUuid(candidate.productId, 'المنتج');
    if (seen.has(productId)) throw new Error('لا يمكن تكرار المنتج داخل الطلب.');
    seen.add(productId);
    const quantity = candidate.quantity;
    if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1) throw new Error('كمية الطلب يجب أن تكون عددًا صحيحًا موجبًا.');
    return { productId, quantity };
  });
}

export interface CreatedOrderReference { id: string; order_number: number; }

export function assertCreatedOrderReference(value: unknown): CreatedOrderReference {
  if (!value || typeof value !== 'object') throw new Error('استجابة إنشاء الطلب غير صالحة. لم يتم إثبات اعتماد الطلب.');
  const candidate = value as Partial<CreatedOrderReference>;
  const orderId = candidate.id;
  const orderNumber = candidate.order_number;
  if (typeof orderId !== 'string' || !UUID_PATTERN.test(orderId) || typeof orderNumber !== 'number' || !Number.isSafeInteger(orderNumber) || orderNumber < 1) {
    throw new Error('استجابة إنشاء الطلب ناقصة أو غير صالحة. لم يتم إثبات اعتماد الطلب.');
  }
  return { id: orderId, order_number: orderNumber };
}

export function assertOrderTransitionInput(orderId: unknown, status: unknown): { orderId: string; status: string } {
  const normalizedOrderId = assertUuid(orderId, 'الطلب');
  if (typeof status !== 'string') throw new Error('حالة الطلب غير صالحة.');
  const normalizedStatus = status.trim();
  if (!ORDER_STATUSES.has(normalizedStatus)) throw new Error('حالة الطلب غير صالحة.');
  return { orderId: normalizedOrderId, status: normalizedStatus };
}

async function resolveOperationalWarehouse(): Promise<string> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('يجب تسجيل الدخول لإرسال الطلب.');
  const { data: profile, error: profileError } = await client.from('profiles').select('organization_id').eq('id', userData.user.id).single();
  if (profileError) throw profileError;
  if (!profile?.organization_id) throw new Error('حساب العميل غير مرتبط بمؤسسة.');
  const { data: warehouse, error: warehouseError } = await client.from('warehouses').select('id').eq('organization_id', profile.organization_id).eq('is_active', true).order('created_at').limit(1).maybeSingle();
  if (warehouseError) throw warehouseError;
  if (!warehouse?.id) throw new Error('لا يوجد مستودع تشغيلي نشط.');
  return assertUuid(warehouse.id, 'المستودع');
}

export async function createOrder(draft: OrderDraft, warehouseId?: unknown) {
  if (!draft || typeof draft !== 'object') throw new Error('بيانات الطلب غير صالحة.');
  const candidate = draft as Partial<OrderDraft>;
  const idempotencyKey = assertIdempotencyKey(candidate.idempotencyKey);
  const normalizedWarehouseId = warehouseId == null ? await resolveOperationalWarehouse() : assertUuid(warehouseId, 'المستودع');
  const lines = assertOrderLines(candidate.lines);
  const { data, error } = await requireSupabase().rpc('create_order', { p_idempotency_key: idempotencyKey, p_warehouse_id: normalizedWarehouseId, p_lines: lines });
  if (error) throw error;
  return assertCreatedOrderReference(data?.[0]);
}

export async function transitionOrder(orderId: string, status: string) {
  const input = assertOrderTransitionInput(orderId, status);
  const { data, error } = await requireSupabase().rpc('transition_order', { p_order_id: input.orderId, p_to_status: input.status });
  if (error) throw error;
  return data;
}
