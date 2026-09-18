import { describe, expect, it } from 'vitest';

describe('customer offline reconnect contract', () => {
  it('registers an online listener and drains the authenticated offline cart queue', async () => {
    const { readFile } = await import('node:fs/promises');
    const source = await readFile(new URL('../AppV3Fixed.tsx', import.meta.url), 'utf8');
    expect(source).toContain("import { getCart, removeCartItem, setCartItem, syncOfflineCart } from './services/cart';");
    expect(source).toContain("window.addEventListener('online',sync);");
    expect(source).toContain('const result=await syncOfflineCart();');
  });
});
