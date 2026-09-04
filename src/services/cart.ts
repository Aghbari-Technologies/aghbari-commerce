import { requireSupabase } from '../lib/supabase';
import { MAX_ORDER_QUANTITY_PER_LINE } from '../domain/order';

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  authorized_price: number | null;
  currency: string;
}

export async function getCart() {
  const { data, error } = await requireSupabase().rpc('get_cart');
  if (error) throw error;
  return (data ?? []) as CartItem[];
}

export async function setCartItem(productId: string, quantity: number) {
  if (!productId) throw new Error('المنتج مطلوب.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_QUANTITY_PER_LINE) {
    throw new Error(`الكمية يجب أن تكون بين 1 و${MAX_ORDER_QUANTITY_PER_LINE}.`);
  }
  const { error } = await requireSupabase().rpc('set_cart_item', {
    p_product_id: productId,
    p_quantity: quantity
  });
  if (error) throw error;
}

export async function removeCartItem(productId: string) {
  if (!productId) throw new Error('المنتج مطلوب.');
  const { error } = await requireSupabase().rpc('remove_cart_item', { p_product_id: productId });
  if (error) throw error;
}

export async function clearCart() {
  const { error } = await requireSupabase().rpc('clear_cart');
  if (error) throw error;
}
