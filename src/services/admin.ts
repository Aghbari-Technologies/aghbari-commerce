import { requireSupabase } from '../lib/supabase';
import type { CustomerTier } from '../domain/types';

export async function createCategory(name: string, slug: string, parentId: string | null = null) {
  const { data, error } = await requireSupabase().rpc('create_category', { p_name: name, p_slug: slug, p_parent_id: parentId });
  if (error) throw error;
  return data;
}

export async function upsertProduct(input: {
  productId?: string | null;
  sku: string;
  name: string;
  unit: string;
  categoryId?: string | null;
  description?: string | null;
  status?: 'active' | 'inactive';
}) {
  const { data, error } = await requireSupabase().rpc('upsert_product', {
    p_product_id: input.productId ?? null,
    p_sku: input.sku,
    p_name: input.name,
    p_unit: input.unit,
    p_category_id: input.categoryId ?? null,
    p_description: input.description ?? null,
    p_status: input.status ?? 'active'
  });
  if (error) throw error;
  return data;
}

export async function setProductPrice(productId: string, tier: CustomerTier, amount: number, currency = 'YER') {
  const { data, error } = await requireSupabase().rpc('set_product_price', {
    p_product_id: productId, p_tier: tier, p_amount: amount, p_currency: currency
  });
  if (error) throw error;
  return data as number;
}

export async function adjustInventory(warehouseId: string, productId: string, delta: number, reason: string) {
  const { data, error } = await requireSupabase().rpc('adjust_inventory', {
    p_warehouse_id: warehouseId, p_product_id: productId, p_delta: delta, p_reason: reason
  });
  if (error) throw error;
  return data as number;
}
