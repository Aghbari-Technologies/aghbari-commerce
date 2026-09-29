import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CUSTOMER_PACKS, STAFF_PACKS } from './WorkspaceSurfaceRail';

const source = readFileSync(resolve(process.cwd(), 'src/WorkspaceSurfaceRail.tsx'), 'utf8');

describe('workspace surface rail contracts', () => {
  it('keeps customer workspaces aligned with the canonical portal sections', () => {
    expect(CUSTOMER_PACKS.map((pack) => pack.id)).toEqual([
      'home', 'catalog', 'saved', 'orders', 'finance', 'templates', 'account', 'notifications',
    ]);
    expect(source).toContain("variant: 'customer'");
    expect(source).toContain('visibleSections');
    expect(source).toContain('aria-current={active ? \'page\' : undefined}');
  });

  it('keeps every staff workspace bound to a real admin target or explicit boundary', () => {
    expect(STAFF_PACKS).toHaveLength(11);
    for (const pack of STAFF_PACKS) {
      expect(pack.target.startsWith('#')).toBe(true);
      expect(['live', 'mixed', 'boundary']).toContain(pack.tone);
    }
    expect(STAFF_PACKS.find((pack) => pack.id === 'boundaries')?.target).toBe('#admin-boundaries');
    expect(STAFF_PACKS.find((pack) => pack.id === 'inventory')).toMatchObject({ target: '#admin-inventory-activity', targets: ['#admin-inventory-activity', '#admin-inventory-history', '#admin-warehouses'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'purchasing')).toMatchObject({ target: '#admin-purchasing', targets: ['#admin-purchasing', '#admin-suppliers', '#admin-receipts'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'sales')).toMatchObject({ targets: ['#admin-orders', '#admin-customers'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'catalog')).toMatchObject({ targets: ['#admin-catalog', '#admin-pricing-matrix', '#admin-product-image'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'data')).toMatchObject({ targets: ['#admin-import', '#admin-export'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'governance')).toMatchObject({ targets: ['#admin-governance', '#admin-notifications'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'access')).toMatchObject({ target: '#admin-access', targets: ['#admin-access'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'settings')).toMatchObject({ target: '#admin-settings', targets: ['#admin-settings'] });
    expect(STAFF_PACKS.find((pack) => pack.id === 'finance')).toMatchObject({ target: '#admin-finance', targets: ['#admin-finance', '#admin-finance-history'] });
    expect(source).toContain("pack.tone === 'boundary' && boundaryVisible");
  });

  it('keeps the responsive rail stylesheet attached to the component', () => {
    expect(source).toContain("import './workspace-surface.css';");
  });
});
