import { describe, expect, it } from 'vitest';
import { catalogQuantityError } from './AppV3Fixed';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer direct quantity contract', () => {
  it('accepts positive integer quantities inside both stock and central line bounds', () => {
    expect(catalogQuantityError('1', 10)).toBeNull();
    expect(catalogQuantityError('10', 10)).toBeNull();
    expect(catalogQuantityError('10000', 12000)).toBeNull();
  });

  it('fails closed for invalid, unavailable and over-cap quantities', () => {
    expect(catalogQuantityError('', 10)).toContain('عددًا صحيحًا موجبًا');
    expect(catalogQuantityError('1.5', 10)).toContain('عددًا صحيحًا موجبًا');
    expect(catalogQuantityError('11', 10)).toContain('المخزون المتاح 10');
    expect(catalogQuantityError('10001', 20000)).toContain('الحد التشغيلي (10000)');
  });

  it('keeps the live catalog and cart wired to the same real quantity application path', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    expect(source).toContain('className="product-qty-input"');
    expect(source).toContain('applyCatalogQuantity(p');
    expect(source).toContain('applyCatalogQuantity(l.product as PricedProduct');
    expect(source).toContain('catalogQuantityError(raw, p.availableQuantity)');
  });
});
