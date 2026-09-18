import { describe, expect, it } from 'vitest';
import appSource from '../AppV3Fixed.tsx?raw';

describe('customer offline reconnect contract', () => {
  it('registers an online listener and drains the authenticated offline cart queue', () => {
    expect(appSource).toContain("import { getCart, removeCartItem, setCartItem, syncOfflineCart } from './services/cart';");
    expect(appSource).toContain("window.addEventListener('online',sync);");
    expect(appSource).toContain('const result=await syncOfflineCart();');
  });
});
