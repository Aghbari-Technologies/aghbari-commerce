import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer tier quantity shortcut contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('derives bounded quantity shortcuts from authorized tiers', () => {
    expect(source).toContain('detail-tier-actions');
    expect(source).toContain('t.min_quantity>1');
    expect(source).toContain('t.min_quantity<=Math.min(selectedProduct.availableQuantity,MAX_ORDER_QUANTITY_PER_LINE)');
    expect(source).toContain('setCatalogQuantityDrafts(current=>({...current,[selectedProduct.id]:String(t.min_quantity)}))');
  });
});
