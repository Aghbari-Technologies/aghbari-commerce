import { requireSupabase } from '../lib/supabase';

export type QuickOrderCommitLine = { productId: string; quantity: number };
export type QuickOrderInput = {
  idempotencyKey: string;
  warehouseId: string;
  lines: QuickOrderCommitLine[];
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MIN_IDEMPOTENCY_KEY_LENGTH = 16;
const MAX_IDEMPOTENCY_KEY_LENGTH = 200;
const MAX_LINES = 100;
const MAX_QUANTITY = 100_000;

export function validateQuickOrderInput(input: QuickOrderInput): {
  idempotencyKey: string;
  warehouseId: string;
  lines: QuickOrderCommitLine[];
} {
  if (!input || typeof input !== 'object') throw new Error('بيانات الطلب السريع غير صالحة.');
  if (typeof input.idempotencyKey !== 'string') throw new Error('معرف العملية مطلوب.');
  const idempotencyKey = input.idempotencyKey.trim();
  if (idempotencyKey.length < MIN_IDEMPOTENCY_KEY_LENGTH || idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw new Error('معرف العملية يجب أن يكون بين 16 و200 حرف.');
  }
  if (typeof input.warehouseId !== 'string' || !UUID_PATTERN.test(input.warehouseId.trim())) throw new Error('المستودع غير صالح.');
  const warehouseId = input.warehouseId.trim();
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > MAX_LINES) {
    throw new Error(`يجب أن يحتوي الطلب السريع على 1 إلى ${MAX_LINES} أصناف.`);
  }
  const seen = new Set<string>();
  const lines = input.lines.map((line) => {
    if (!line || typeof line !== 'object') throw new Error('بيانات صنف الطلب السريع غير صالحة.');
    if (typeof line.productId !== 'string' || !UUID_PATTERN.test(line.productId.trim())) throw new Error('معرّف المنتج غير صالح.');
    const productId = line.productId.trim();
    if (seen.has(productId)) throw new Error('لا يمكن تكرار المنتج داخل الطلب السريع.');
    seen.add(productId);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
      throw new Error(`كمية الطلب السريع يجب أن تكون عددًا صحيحًا بين 1 و${MAX_QUANTITY}.`);
    }
    return { productId, quantity: line.quantity };
  });
  return { idempotencyKey, warehouseId, lines };
}

export async function applyQuickOrder(input: QuickOrderInput): Promise<string> {
  const normalized = validateQuickOrderInput(input);
  const { data, error } = await requireSupabase().rpc('apply_quick_order', {
    p_idempotency_key: normalized.idempotencyKey,
    p_warehouse_id: normalized.warehouseId,
    p_lines: normalized.lines.map((line) => ({ product_id: line.productId, quantity: line.quantity }))
  });
  if (error) throw error;
  if (typeof data !== 'string' || !data.trim()) throw new Error('تعذر تأكيد الطلب السريع.');
  return data;
}
