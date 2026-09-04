import { requireSupabase } from '../lib/supabase';
import type { OrderDraft } from '../domain/types';

export async function createOrder(draft: OrderDraft, warehouseId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_order', {
    p_idempotency_key: draft.idempotencyKey,
    p_warehouse_id: warehouseId,
    p_lines: draft.lines
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function transitionOrder(orderId: string, status: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('transition_order', { p_order_id: orderId, p_to_status: status });
  if (error) throw error;
  return data;
}
