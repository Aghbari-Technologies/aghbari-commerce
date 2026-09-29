import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer cart clear contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const cart = readFileSync(resolve(process.cwd(), 'src/services/cart.ts'), 'utf8');

  it('uses the authoritative clear_cart service with destructive confirmation', () => {
    expect(source).toContain('async function emptyCart()');
    expect(source).toContain('clearCart()');
    expect(source).toContain('تفريغ السلة بالكامل؟');
    expect(source).toContain('cart-clear-button');
  });

  it('keeps clear-cart unavailable offline', () => {
    expect(source).toContain('!online');
    expect(source).toContain('تفريغ السلة يحتاج اتصالًا بالخادم.');
    expect(cart).toContain(".rpc('clear_cart')");
  });
});
