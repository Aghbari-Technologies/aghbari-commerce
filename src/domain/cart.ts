export interface CartItem {
  readonly productId: string;
  readonly quantity: number;
}

export interface Cart {
  readonly id: string;
  readonly customerId: string;
  readonly organizationId: string;
  readonly branchId: string;
  readonly warehouseId: string;
  readonly items: readonly CartItem[];
  readonly version: number;
}

export function validateCartScope(cart: Pick<Cart, 'organizationId' | 'customerId' | 'branchId' | 'warehouseId'>): void {
  for (const [key, value] of Object.entries(cart)) {
    if (!value) throw new Error(`VALIDATION_FAILED:${key}`);
  }
}

export function upsertCartItem(
  items: readonly CartItem[],
  productId: string,
  quantity: number,
): readonly CartItem[] {
  if (!productId) throw new Error('VALIDATION_FAILED:productId');
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('VALIDATION_FAILED:quantity');

  const next = items.filter((item) => item.productId !== productId);
  return [...next, { productId, quantity }].sort((a, b) => a.productId.localeCompare(b.productId));
}

export function removeCartItem(items: readonly CartItem[], productId: string): readonly CartItem[] {
  if (!productId) throw new Error('VALIDATION_FAILED:productId');
  return items.filter((item) => item.productId !== productId);
}

export function calculateCartQuantity(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
