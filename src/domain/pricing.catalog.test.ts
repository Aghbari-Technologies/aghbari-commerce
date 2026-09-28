import { describe, expect, it } from 'vitest';
import { effectiveCatalogPrice } from './pricing';

describe('effectiveCatalogPrice', () => {
  it('uses the highest eligible quantity tier', () => {
    expect(effectiveCatalogPrice([
      { min_quantity: 10, unit_price: 95 },
      { min_quantity: 1, unit_price: 110 },
      { min_quantity: 50, unit_price: 90 },
    ], 125, 25)).toBe(95);
  });

  it('falls back to the server-authorized base price when no tier matches', () => {
    expect(effectiveCatalogPrice([{ min_quantity: 25, unit_price: 90 }], 125, 5)).toBe(125);
  });

  it('rejects invalid quantities and invalid base prices safely', () => {
    expect(effectiveCatalogPrice([], 125, 0)).toBe(0);
    expect(effectiveCatalogPrice([], -10, 1)).toBe(0);
    expect(effectiveCatalogPrice([{ min_quantity: 1, unit_price: 80 }], 125, 2)).toBe(80);
  });
});
