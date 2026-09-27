import { describe, expect, it } from 'vitest';
import { getAdminStructureForRole } from './admin-structure';
import { CUSTOMER_PORTAL_SECTIONS } from './customer-structure';

const STAFF_TARGETS = [
  '#admin-dashboard',
  '#admin-orders',
  '#admin-import',
  '#admin-inventory',
  '#admin-catalog',
  '#admin-finance',
  '#admin-governance',
  '#admin-boundaries',
] as const;

describe('shared workspace surface registry', () => {
  it('keeps the eight visual staff surfaces unique', () => {
    expect(new Set(STAFF_TARGETS).size).toBe(STAFF_TARGETS.length);
  });

  it('maps live role-visible staff surfaces to real registered anchors', () => {
    for (const role of ['owner', 'admin', 'sales', 'warehouse', 'viewer']) {
      const items = getAdminStructureForRole(role).flatMap((group) => group.items);
      const liveTargets = new Set(items.filter((item) => item.status === 'live' && item.target).map((item) => item.target));
      expect(liveTargets.has('#admin-dashboard')).toBe(true);
      expect(liveTargets.has('#admin-boundaries')).toBe(false);
    }
    expect(STAFF_TARGETS).toContain('#admin-governance');
    expect(STAFF_TARGETS).toContain('#admin-boundaries');
  });

  it('keeps customer navigation aligned with the six canonical portal sections', () => {
    expect(CUSTOMER_PORTAL_SECTIONS).toEqual(['catalog', 'orders', 'finance', 'templates', 'account', 'notifications']);
    expect(new Set(CUSTOMER_PORTAL_SECTIONS).size).toBe(6);
  });
});
