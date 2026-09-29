import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer catalog floating cart contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');

  it('shows only for a non-empty real cart and exposes both cart actions', () => {
    expect(source).toContain("section==='catalog'&&cartCount>0");
    expect(source).toContain('catalog-floating-cart');
    expect(source).toContain('setCartOpen(true)');
    expect(source).toContain('setCheckoutOpen(true)');
    expect(source).toContain('cartCount.toLocaleString');
  });

  it('keeps the floating surface responsive', () => {
    expect(css).toContain('.catalog-floating-cart');
    expect(css).toContain('@media(max-width:620px)');
  });
});
