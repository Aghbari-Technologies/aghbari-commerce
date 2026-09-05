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

export async function transferInventory(
  sourceWarehouseId: string,
  destinationWarehouseId: string,
  idempotencyKey: string,
  lines: Array<{ productId: string; quantity: number }>,
  notes?: string
) {
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

export async function setStockThreshold(
  warehouseId: string,
  productId: string,
  minQuantity: number,
  reorderQuantity: number,
  maxQuantity?: number | null
) {
  const { data, error } = await requireSupabase().rpc('set_stock_threshold', {
    p_warehouse_id: warehouseId,
    p_product_id: productId,
    p_min_quantity: minQuantity,
    p_reorder_quantity: reorderQuantity,
    p_max_quantity: maxQuantity ?? null
  });
  if (error) throw error;
  return data;
}

export async function getLowStock() {
  const { data, error } = await requireSupabase().rpc('get_low_stock');
  if (error) throw error;
  return (data ?? []) as LowStockRow[];
}
