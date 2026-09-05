import { requireSupabase } from '../lib/supabase';
import { MAX_ORDER_QUANTITY_PER_LINE } from '../domain/order';
import {
  drainOfflineOperations,
  enqueueOfflineOperation,
  OFFLINE_CART_REMOVE_ITEM,
  OFFLINE_CART_SET_ITEM,
  type OfflineOperation
} from './offlineQueue';

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  authorized_price: number | null;
  currency: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OfflineCartPayload = { productId: string; quantity?: number };

function finiteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isOfflineCartPayload(payload: unknown): payload is OfflineCartPayload {
  if (!payload || typeof payload !== 'object') return false;
  const value = payload as OfflineCartPayload;
  if (typeof value.productId !== 'string' || !UUID_PATTERN.test(value.productId)) return false;
  return value.quantity === undefined || (Number.isInteger(value.quantity) && value.quantity >= 1 && value.quantity <= MAX_ORDER_QUANTITY_PER_LINE);
}

async function replayCartOperation(operation: OfflineOperation): Promise<void> {
  if (!isOfflineCartPayload(operation.payload)) throw new Error('بيانات عملية السلة غير المتصلة غير صالحة.');
  const client = requireSupabase();
  const payload = operation.payload;
  if (operation.type === OFFLINE_CART_SET_ITEM) {
    const { error } = await client.rpc('set_cart_item', { p_product_id: payload.productId, p_quantity: payload.quantity });
    if (error) throw error;
    return;
  }
  if (operation.type === OFFLINE_CART_REMOVE_ITEM) {
    const { error } = await client.rpc('remove_cart_item', { p_product_id: payload.productId });
    if (error) throw error;
    return;
  }
  throw new Error('نوع عملية غير متوقع في طابور السلة.');
}

export async function syncOfflineCart() {
  return drainOfflineOperations(replayCartOperation);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { void syncOfflineCart(); });
}

export async function getCart() {
  const { data, error } = await requireSupabase().rpc('get_cart');
  if (error) throw error;
  return (data ?? []).map((item) => ({
    ...(item as Omit<CartItem, 'quantity' | 'authorized_price'>),
    quantity: finiteNumber(item.quantity),
    authorized_price: item.authorized_price == null ? null : finiteNumber(item.authorized_price, 0)
  })) as CartItem[];
}

export async function setCartItem(productId: string, quantity: number) {
  if (!productId) throw new Error('المنتج مطلوب.');
  if (!UUID_PATTERN.test(productId.trim())) throw new Error('معرّف المنتج غير صالح.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_QUANTITY_PER_LINE) {
    throw new Error(`الكمية يجب أن تكون بين 1 و${MAX_ORDER_QUANTITY_PER_LINE}.`);
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: productId.trim(), quantity });
    return;
  }
  const { error } = await requireSupabase().rpc('set_cart_item', {
    p_product_id: productId.trim(),
    p_quantity: quantity
  });
  if (error) throw error;
}

export async function removeCartItem(productId: string) {
  if (!productId) throw new Error('المنتج مطلوب.');
  if (!UUID_PATTERN.test(productId.trim())) throw new Error('معرّف المنتج غير صالح.');
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    enqueueOfflineOperation(OFFLINE_CART_REMOVE_ITEM, { productId: productId.trim() });
    return;
  }
  const { error } = await requireSupabase().rpc('remove_cart_item', { p_product_id: productId.trim() });
  if (error) throw error;
}

export async function clearCart() {
  const { error } = await requireSupabase().rpc('clear_cart');
  if (error) throw error;
}
