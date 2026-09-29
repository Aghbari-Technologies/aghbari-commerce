import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('saved products cross-page resolution', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  it('resolves saved IDs that are not present on the current catalog page', () => {
    expect(source).toContain('savedProductsById');
    expect(source).toContain('getCatalogProductById(id,warehouseId??undefined)');
    expect(source).toContain('products.find(p=>p.id===id)??savedProductsById[id]');
    expect(source).toContain('جارٍ استرجاع المحفوظات');
  });
  it('bounds saved-product resolution to twelve local entries', () => {
    expect(source).toContain('slice(0,12)');
  });
});
