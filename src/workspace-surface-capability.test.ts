import { describe, expect, it } from 'vitest';
import { AGHBARI_CUSTOMER_STRUCTURE, CUSTOMER_PORTAL_SECTIONS } from './structure/customer-structure';
import { getCustomerSurfaceItems, getStaffBoundaryItems, getStaffSurfaceItems, STAFF_PACKS } from './WorkspaceSurfaceRail';
import { getAdminStructureForRole } from './structure/admin-structure';

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


describe('staff workspace surface closure', () => {
  it('surfaces every live capability for each enabled staff pack without truncation', () => {
    for (const role of ['owner', 'admin', 'sales', 'warehouse'] as const) {
      for (const pack of STAFF_PACKS.filter((item) => item.tone !== 'boundary')) {
        const expected = getAdminStructureForRole(role)
          .flatMap((group) => group.items)
          .filter((item) => item.status === 'live' && item.target === pack.target);
        expect(getStaffSurfaceItems(role, pack.target).map((item) => item.id)).toEqual(expected.map((item) => item.id));
      }
    }
  });

  it('keeps all visible non-live capabilities reachable from the explicit boundary workspace', () => {
    for (const role of ['owner', 'admin', 'sales', 'warehouse', 'viewer'] as const) {
      const expected = getAdminStructureForRole(role)
        .flatMap((group) => group.items)
        .filter((item) => item.status !== 'live');
      expect(getStaffBoundaryItems(role).map((item) => item.id)).toEqual(expected.map((item) => item.id));
    }
  });
});
