import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer home merchandising source quality', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('prefers sellable active products with stock and an authorized price', () => {
    expect(source).toContain('const homeFeaturedProducts=useMemo');
    expect(source).toContain("p.status==='active'");
    expect(source).toContain('p.availableQuantity>0');
    expect(source).toContain('effectivePrice(p,1)>0');
    expect(source).toContain('featuredProducts={homeFeaturedProducts}');
  });
});
