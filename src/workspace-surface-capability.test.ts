import { describe, expect, it } from 'vitest';
import { AGHBARI_CUSTOMER_STRUCTURE, CUSTOMER_PORTAL_SECTIONS } from './structure/customer-structure';
import { getCustomerSurfaceItems } from './WorkspaceSurfaceRail';

describe('workspace surface capability map', () => {
  it('exposes every canonical customer capability under its owning section', () => {
    for (const section of CUSTOMER_PORTAL_SECTIONS) {
      const expected = AGHBARI_CUSTOMER_STRUCTURE.filter((item) => item.section === section);
      const actual = getCustomerSurfaceItems(section);
      expect(actual.map((item) => item.id)).toEqual(expected.map((item) => item.id));
    }
  });

  it('does not expose capabilities for hidden customer sections', () => {
    expect(getCustomerSurfaceItems('finance', ['catalog', 'orders'])).toEqual([]);
    expect(getCustomerSurfaceItems('templates', ['catalog', 'orders'])).toEqual([]);
  });

  it('keeps the capability map presentation-only', () => {
    const items = getCustomerSurfaceItems('orders');
    expect(items.every((item) => item.status === 'live' || item.status === 'boundary')).toBe(true);
    expect(items.some((item) => item.id === 'checkout')).toBe(true);
    expect(items.some((item) => item.id === 'order-detail')).toBe(true);
  });
});
