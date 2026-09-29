import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer product detail quick actions', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('keeps favorite and compare actions available inside product details', () => {
    expect(source).toContain('selectedProduct&&<div className="modal-backdrop"');
    expect(source).toContain('toggleFavorite(selectedProduct.id)');
    expect(source).toContain('toggleCompare(selectedProduct.id)');
    expect(source).toContain('aria-pressed={favoriteIds.includes(selectedProduct.id)}');
    expect(source).toContain('aria-pressed={compareIds.includes(selectedProduct.id)}');
  });

  it('preserves the three-product comparison guard', () => {
    expect(source).toContain('if(current.length>=3)');
    expect(source).toContain('يمكن مقارنة 3 أصناف فقط');
  });
});
