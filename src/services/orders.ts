import { requireSupabase } from '../lib/supabase';
import type { OrderDraft } from '../domain/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES = new Set(['draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

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
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_order', {
    p_idempotency_key: draft.idempotencyKey,
    p_warehouse_id: warehouseId,
    p_lines: draft.lines
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
