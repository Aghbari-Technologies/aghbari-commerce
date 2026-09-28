import { describe, expect, it } from 'vitest';
import { AGHBARI_ADMIN_LIVE_ITEMS } from './structure/admin-structure';
import { SAFE_ALTERNATIVES } from './AdminBoundaryCenter';

describe('admin boundary workspace links', () => {
  it('keeps every safe alternative on a real live anchor', () => {
    const liveTargets = new Set(AGHBARI_ADMIN_LIVE_ITEMS.map((item) => item.target).filter(Boolean));
    for (const alternative of Object.values(SAFE_ALTERNATIVES)) {
      expect(liveTargets.has(alternative.target) || alternative.target === '#admin-recovery').toBe(true);
    }
  });

  it('does not use an executable alternative for the explicit boundary workspace itself', () => {
    expect(Object.values(SAFE_ALTERNATIVES).some((item) => item.target === '#admin-boundaries')).toBe(false);
  });
});
