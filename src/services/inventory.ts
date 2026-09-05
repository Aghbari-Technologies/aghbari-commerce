import { requireSupabase } from '../lib/supabase';

export interface LowStockRow {
  warehouse_id: string;
  warehouse_name: string;
  product_id: string;
  sku: string;
  product_name: string;
  current_quantity: number;
  min_quantity: number;
  reorder_quantity: number;
}

export interface StockCountSession {
  id: string;
  organization_id: string;
  warehouse_id: string;
  status: 'open' | 'completed' | 'cancelled';
  idempotency_key: string;
  started_by: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface StockCountLine {
  id: string;
  session_id: string;
  product_id: string;
  expected_quantity: number;
  counted_quantity: number | null;
  completed_quantity: number | null;
  variance: number | null;
  counted_at: string | null;
}

export async function transferInventory(sourceWarehouseId: string, destinationWarehouseId: string, idempotencyKey: string, lines: Array<{ productId: string; quantity: number }>, notes?: string) {
  const { data, error } = await requireSupabase().rpc('transfer_inventory', {
    p_source_warehouse_id: sourceWarehouseId,
    p_destination_warehouse_id: destinationWarehouseId,
    p_idempotency_key: idempotencyKey,
    p_lines: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
    p_notes: notes || null
  });
  if (error) throw error;
  return data;
}

export async function setStockThreshold(warehouseId: string, productId: string, minQuantity: number, reorderQuantity: number, maxQuantity?: number | null) {
  const { data, error } = await requireSupabase().rpc('set_stock_threshold', {
    p_warehouse_id: warehouseId, p_product_id: productId, p_min_quantity: minQuantity,
    p_reorder_quantity: reorderQuantity, p_max_quantity: maxQuantity ?? null
  });
  if (error) throw error;
  return data;
}

export async function getLowStock() {
  const { data, error } = await requireSupabase().rpc('get_low_stock');
  if (error) throw error;
  return (data ?? []) as LowStockRow[];
}

export async function startStockCount(warehouseId: string, idempotencyKey: string, notes?: string) {
  const { data, error } = await requireSupabase().rpc('start_stock_count', {
    p_warehouse_id: warehouseId, p_idempotency_key: idempotencyKey, p_notes: notes || null
  });
  if (error) throw error;
  return data as StockCountSession;
}

export async function getOpenStockCount() {
  const { data, error } = await requireSupabase().from('stock_count_sessions').select('*').eq('status', 'open').order('started_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return (data ?? null) as StockCountSession | null;
}

export async function getStockCountLines(sessionId: string) {
  const { data, error } = await requireSupabase().from('stock_count_lines').select('id,session_id,product_id,expected_quantity,counted_quantity,completed_quantity,variance,counted_at').eq('session_id', sessionId).order('product_id');
  if (error) throw error;
  return (data ?? []) as StockCountLine[];
}

export async function setStockCountLine(sessionId: string, productId: string, countedQuantity: number) {
  const { data, error } = await requireSupabase().rpc('set_stock_count_line', { p_session_id: sessionId, p_product_id: productId, p_counted_quantity: countedQuantity });
  if (error) throw error;
  return data as StockCountLine;
}

export async function completeStockCount(sessionId: string) {
  const { data, error } = await requireSupabase().rpc('complete_stock_count', { p_session_id: sessionId });
  if (error) throw error;
  return data as { status: string; session_id: string; adjusted_lines: number };
}
