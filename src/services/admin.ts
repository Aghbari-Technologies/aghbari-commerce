import { requireSupabase } from '../lib/supabase';
import type { CustomerTier } from '../domain/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertUuid(value: string, operation: string) {
  if (!UUID_PATTERN.test(value)) throw new Error(`معرّف ${operation} غير صالح.`);
  return value;
}

function assertNonBlank(value: string, operation: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${operation} مطلوب.`);
  return normalized;
}

function assertFiniteMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new Error('السعر يجب أن يكون رقمًا غير سالب.');
  return value;
}

function assertInventoryDelta(value: number) {
  if (!Number.isSafeInteger(value) || value === 0) throw new Error('تغيير المخزون يجب أن يكون عددًا صحيحًا غير صفري.');
  return value;
}

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
  const normalizedName = assertNonBlank(name, 'اسم التصنيف');
  const normalizedSlug = assertNonBlank(slug, 'معرف التصنيف');
  if (parentId !== null) assertUuid(parentId, 'التصنيف الأب');
  const { data, error } = await requireSupabase().rpc('create_category', { p_name: normalizedName, p_slug: normalizedSlug, p_parent_id: parentId });
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
  if (input.productId) assertUuid(input.productId, 'المنتج');
  if (input.categoryId) assertUuid(input.categoryId, 'التصنيف');
  const sku = assertNonBlank(input.sku, 'SKU');
  const name = assertNonBlank(input.name, 'اسم المنتج');
  const unit = assertNonBlank(input.unit, 'وحدة المنتج');
  const description = input.description?.trim() || null;
  const { data, error } = await requireSupabase().rpc('upsert_product', {
    p_product_id: input.productId ?? null,
    p_sku: sku,
    p_name: name,
    p_unit: unit,
    p_category_id: input.categoryId ?? null,
    p_description: description,
    p_status: input.status ?? 'active'
  });
  if (error) throw error;
  return assertEntityId(data, 'حفظ المنتج');
}

export async function setProductPrice(productId: string, tier: CustomerTier, amount: number, currency = 'YER') {
  assertUuid(productId, 'المنتج');
  const normalizedCurrency = assertNonBlank(currency, 'العملة').toUpperCase();
  const normalizedAmount = assertFiniteMoney(amount);
  const { data, error } = await requireSupabase().rpc('set_product_price', {
    p_product_id: productId, p_tier: tier, p_amount: normalizedAmount, p_currency: normalizedCurrency
  });
  if (error) throw error;
  return assertMoney(data);
}

export async function adjustInventory(warehouseId: string, productId: string, delta: number, reason: string) {
  assertUuid(warehouseId, 'المستودع');
  assertUuid(productId, 'المنتج');
  const normalizedDelta = assertInventoryDelta(delta);
  const normalizedReason = assertNonBlank(reason, 'سبب تعديل المخزون');
  const { data, error } = await requireSupabase().rpc('adjust_inventory', {
    p_warehouse_id: warehouseId, p_product_id: productId, p_delta: normalizedDelta, p_reason: normalizedReason
  });
  if (error) throw error;
  return assertInventoryQuantity(data);
}
