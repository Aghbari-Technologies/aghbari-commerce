import { describe, expect, it } from 'vitest';
import { findProductByIdentifier, normalizeProductIdentifier } from './productIdentifier';
import type { Product } from './types';

const product = (sku: string, barcode?: string): Product => ({
  id: sku,
  sku,
  barcode,
  name: sku,
  unit: 'كرتون',
  category: 'اختبار',
  availableQuantity: 10,
  status: 'active',
});

describe('product identifiers', () => {
  it('normalizes whitespace and case', () => {
    expect(normalizeProductIdentifier('  AbC-123  ')).toBe('abc-123');
  });

  it('matches exact SKU or barcode', () => {
    const products = [product('SKU-1', '6280001112223'), product('SKU-2', '6280009998887')];
    expect(findProductByIdentifier(products, 'sku-1')?.sku).toBe('SKU-1');
    expect(findProductByIdentifier(products, ' 6280001112223 ')?.sku).toBe('SKU-1');
    expect(findProductByIdentifier(products, 'missing')).toBeNull();
  });
});
