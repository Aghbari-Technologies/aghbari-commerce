import { requireSupabase } from '../lib/supabase';
import type { CustomerTier } from '../domain/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertEntityId(value: unknown, operation: string) {
  const id = value && typeof value === 'object' ? (value as { id?: unknown }).id : undefined;
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    throw new Error(`استجابة ${operation} غير صالحة. لم يتم إثبات نجاح العملية.`);
  }
  return value;
}

export function assertMoney(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('استجابة تحديث السعر غير صالحة. لم يتم إثبات نجاح العملية.');
  }
  return value;
}

export function assertInventoryQuantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('استجابة تعديل المخزون غير صالحة. لم يتم إثبات نجاح العملية.');
  }
  return value;
}

export async function createCategory(name: string, slug: string, parentId: string | null = null) {
  const { data, error } = await requireSupabase().rpc('create_category', { p_name: name, p_slug: slug, p_parent_id: parentId });
  if (error) throw error;
  return assertEntityId(data, 'إنشاء التصنيف');
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
  return assertEntityId(data, 'حفظ المنتج');
}

export async function setProductPrice(productId: string, tier: CustomerTier, amount: number, currency = 'YER') {
  const { data, error } = await requireSupabase().rpc('set_product_price', {
    p_product_id: productId, p_tier: tier, p_amount: amount, p_currency: currency
  });
  if (error) throw error;
  return assertMoney(data);
}

export async function adjustInventory(warehouseId: string, productId: string, delta: number, reason: string) {
  const { data, error } = await requireSupabase().rpc('adjust_inventory', {
    p_warehouse_id: warehouseId, p_product_id: productId, p_delta: delta, p_reason: reason
  });
  if (error) throw error;
  return assertInventoryQuantity(data);
}
