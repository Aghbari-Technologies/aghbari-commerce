import type { Product } from './types';

export function normalizeProductIdentifier(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function findProductByIdentifier(products: Product[], identifier: unknown): Product | null {
  const normalized = normalizeProductIdentifier(identifier);
  if (!normalized) return null;
  return products.find((product) =>
    normalizeProductIdentifier(product.sku) === normalized
    || normalizeProductIdentifier(product.barcode) === normalized
  ) ?? null;
}
