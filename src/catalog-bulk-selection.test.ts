import { describe, expect, it } from 'vitest';
import { MAX_BULK_PRODUCT_SELECTION, canSelectBulkProduct } from './catalog-bulk-selection';

describe('catalog bulk selection guard', () => {
  it('allows selections up to the canonical batch ceiling', () => {
    expect(canSelectBulkProduct(0)).toBe(true);
    expect(canSelectBulkProduct(49)).toBe(true);
    expect(canSelectBulkProduct(50)).toBe(false);
  });

  it('rejects additions that would cross the ceiling', () => {
    expect(canSelectBulkProduct(40, 10)).toBe(true);
    expect(canSelectBulkProduct(40, 11)).toBe(false);
    expect(canSelectBulkProduct(50, 0)).toBe(true);
  });

  it('fails closed for invalid selection counts', () => {
    expect(canSelectBulkProduct(-1)).toBe(false);
    expect(canSelectBulkProduct(1, -1)).toBe(false);
    expect(canSelectBulkProduct(Number.NaN)).toBe(false);
    expect(canSelectBulkProduct(Number.POSITIVE_INFINITY)).toBe(false);
    expect(canSelectBulkProduct(49, 1.5)).toBe(false);
  });

  it('keeps the canonical ceiling explicit', () => {
    expect(MAX_BULK_PRODUCT_SELECTION).toBe(50);
  });
});
