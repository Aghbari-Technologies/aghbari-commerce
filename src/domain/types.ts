export type CustomerTier = 'retail' | 'wholesale' | 'distributor';
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Product {
  id: string;
  sku: string;
  name: string;
  imageUrl?: string;
  unit: string;
  category: string;
  subcategory?: string;
  description?: string;
  availableQuantity: number;
  status: 'active' | 'inactive';
}

export interface ProductPrice {
  productId: string;
  tier: CustomerTier;
  amount: number;
  currency: string;
  validFrom: string;
  validTo?: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface OrderDraft {
  // Customer identity is intentionally absent from the client command.
  // The authenticated server context is the sole authority for customer binding.
  idempotencyKey: string;
  lines: Array<{ productId: string; quantity: number }>;
}
