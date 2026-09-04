export type UUID = string;

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderLineInput {
  productId: UUID;
  quantity: number;
}

export interface PricedOrderLine {
  productId: UUID;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: UUID;
  orderNumber: string;
  organizationId: UUID;
  customerId: UUID;
  branchId: UUID;
  warehouseId: UUID;
  status: OrderStatus;
  lines: readonly PricedOrderLine[];
  subtotal: number;
  total: number;
  idempotencyKey: string;
  createdAt: string;
}

export interface InventoryBalance {
  warehouseId: UUID;
  productId: UUID;
  available: number;
  reserved: number;
  version: number;
}

export interface PricingContext {
  organizationId: UUID;
  customerId: UUID;
  customerTierId: UUID;
  priceListId: UUID;
}

export interface ProductPrice {
  productId: UUID;
  priceListId: UUID;
  unitPrice: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}
