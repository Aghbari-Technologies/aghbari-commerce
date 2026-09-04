import { requireSupabase } from '../lib/supabase';

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
  const { error } = await requireSupabase().rpc('set_cart_item', {
    p_product_id: productId,
    p_quantity: quantity
  });
  if (error) throw error;
}

export async function removeCartItem(productId: string) {
  const { error } = await requireSupabase().rpc('remove_cart_item', { p_product_id: productId });
  if (error) throw error;
}

export async function clearCart() {
  const { error } = await requireSupabase().rpc('clear_cart');
  if (error) throw error;
}
