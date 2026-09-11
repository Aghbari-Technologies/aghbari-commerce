import { requireSupabase } from '../lib/supabase';

export type QuickOrderCommitLine = { productId: string; quantity: number };

export async function applyQuickOrder(input: {
  idempotencyKey: string;
  warehouseId: string;
  lines: QuickOrderCommitLine[];
}): Promise<string> {
  const client = requireSupabase();
  if (!input.idempotencyKey.trim()) throw new Error('معرف العملية مطلوب.');
  if (!input.warehouseId) throw new Error('المستودع مطلوب.');
  if (!input.lines.length || input.lines.length > 100) throw new Error('يجب أن يحتوي الطلب السريع على 1 إلى 100 صنف.');
  const { data, error } = await client.rpc('apply_quick_order', {
    p_idempotency_key: input.idempotencyKey,
    p_warehouse_id: input.warehouseId,
    p_lines: input.lines.map((line) => ({ product_id: line.productId, quantity: line.quantity }))
  });
  if (error) throw error;
  if (typeof data !== 'string' || !data) throw new Error('تعذر تأكيد الطلب السريع.');
  return data;
}
