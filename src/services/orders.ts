import { requireSupabase } from '../lib/supabase';
import type { OrderDraft } from '../domain/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES = new Set(['draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
const MAX_ORDER_LINES = 100;

function assertUuid(value: string, operation: string) {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error(`معرّف ${operation} غير صالح.`);
  return normalized;
}

function assertIdempotencyKey(value: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw new Error('مفتاح العملية غير صالح.');
  }
  return normalized;
}

function assertOrderLines(lines: OrderDraft['lines']) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_ORDER_LINES) {
    throw new Error('يجب أن يحتوي الطلب على أصناف صالحة.');
  }
  const seen = new Set<string>();
  return lines.map((line) => {
    if (!line || typeof line !== 'object') throw new Error('بيانات صنف الطلب غير صالحة.');
    const productId = assertUuid(line.productId, 'المنتج');
    if (seen.has(productId)) throw new Error('لا يمكن تكرار المنتج داخل الطلب.');
    seen.add(productId);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error('كمية الطلب يجب أن تكون عددًا صحيحًا موجبًا.');
    }
    return { productId, quantity: line.quantity };
  });
}

export interface CreatedOrderReference {
  id: string;
  order_number: number;
}

export function assertCreatedOrderReference(value: unknown): CreatedOrderReference {
  if (!value || typeof value !== 'object') {
    throw new Error('استجابة إنشاء الطلب غير صالحة. لم يتم إثبات اعتماد الطلب.');
  }

  const candidate = value as Partial<CreatedOrderReference>;
  if (
    typeof candidate.id !== 'string' ||
    !UUID_PATTERN.test(candidate.id) ||
    !Number.isSafeInteger(candidate.order_number) ||
    candidate.order_number < 1
  ) {
    throw new Error('استجابة إنشاء الطلب ناقصة أو غير صالحة. لم يتم إثبات اعتماد الطلب.');
  }

  return { id: candidate.id, order_number: candidate.order_number };
}

export function assertOrderTransitionInput(orderId: string, status: string): { orderId: string; status: string } {
  const normalizedOrderId = orderId.trim();
  const normalizedStatus = status.trim();
  if (!UUID_PATTERN.test(normalizedOrderId)) throw new Error('معرّف الطلب غير صالح.');
  if (!ORDER_STATUSES.has(normalizedStatus)) throw new Error('حالة الطلب غير صالحة.');
  return { orderId: normalizedOrderId, status: normalizedStatus };
}

export async function createOrder(draft: OrderDraft, warehouseId: string) {
  const idempotencyKey = assertIdempotencyKey(draft.idempotencyKey);
  const normalizedWarehouseId = assertUuid(warehouseId, 'المستودع');
  const lines = assertOrderLines(draft.lines);
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_order', {
    p_idempotency_key: idempotencyKey,
    p_warehouse_id: normalizedWarehouseId,
    p_lines: lines
  });
  if (error) throw error;

  // A successful RPC call with no trustworthy order reference is not a successful checkout.
  // Fail closed so the UI cannot display a false success message or clear the cart.
  return assertCreatedOrderReference(data?.[0]);
}

export async function transitionOrder(orderId: string, status: string) {
  const input = assertOrderTransitionInput(orderId, status);
  const client = requireSupabase();
  const { data, error } = await client.rpc('transition_order', { p_order_id: input.orderId, p_to_status: input.status });
  if (error) throw error;
  return data;
}
