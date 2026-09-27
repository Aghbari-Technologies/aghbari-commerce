import { describe, expect, it } from 'vitest';
import { AGHBARI_CUSTOMER_STRUCTURE } from './customer-structure';

describe('customer portal information architecture', () => {
  it('keeps Home explicit and preserves the core customer journey surfaces', () => {
    const live = new Set(AGHBARI_CUSTOMER_STRUCTURE.filter((item) => item.status === 'live').map((item) => item.id));
    for (const required of [
      'home', 'store', 'categories', 'search', 'product-detail', 'cart', 'checkout',
      'order-history', 'order-detail', 'templates', 'quick-order', 'account',
      'addresses', 'finance', 'invoice-history', 'invoice-detail', 'notifications', 'offline',
    ]) {
      expect(live.has(required), required + ' must remain a live customer surface').toBe(true);
    }
    expect(AGHBARI_CUSTOMER_STRUCTURE.find((item) => item.id === 'home')?.section).toBe('home');
  });

  it('does not introduce duplicate customer surface identifiers', () => {
    const ids = AGHBARI_CUSTOMER_STRUCTURE.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
