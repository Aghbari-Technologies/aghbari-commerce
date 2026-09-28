import { describe, expect, it } from 'vitest';
import appSource from '../AppV3Fixed.tsx?raw';
import { AGHBARI_CUSTOMER_STRUCTURE, CUSTOMER_PORTAL_SECTIONS } from './customer-structure';

describe('customer portal information architecture', () => {
  it('keeps Home explicit and preserves the canonical customer journey surfaces', () => {
    const live = new Set(AGHBARI_CUSTOMER_STRUCTURE.filter((item) => item.status === 'live').map((item) => item.id));
    for (const required of [
      'home', 'store', 'categories', 'search', 'product-detail', 'cart', 'checkout',
      'order-history', 'order-detail', 'templates', 'quick-order', 'account',
      'addresses', 'finance', 'invoice-history', 'invoice-detail', 'notifications', 'offline',
    ]) {
      expect(live.has(required), required + ' must remain a live customer surface').toBe(true);
    }
    expect(AGHBARI_CUSTOMER_STRUCTURE.find((item) => item.id === 'home')?.section).toBe('home');
    expect(CUSTOMER_PORTAL_SECTIONS[0]).toBe('home');
  });

  it('keeps the active runtime wired to the first-class Home surface', () => {
    expect(appSource).toContain("import CustomerHomeWorkspace from './CustomerHomeWorkspace';");
    expect(appSource).toContain("type PortalSection = 'home' |");
    expect(appSource).toContain("section==='home'&&<CustomerHomeWorkspace");
    expect(appSource).toContain('onClick={()=>navigate("home")}');
    expect(appSource).toContain('navigate("home")');
  });

  it('does not introduce duplicate customer surface identifiers', () => {
    const ids = AGHBARI_CUSTOMER_STRUCTURE.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
