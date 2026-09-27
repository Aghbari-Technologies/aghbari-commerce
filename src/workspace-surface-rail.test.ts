import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CUSTOMER_PACKS, STAFF_PACKS } from './WorkspaceSurfaceRail';

const source = readFileSync(resolve(process.cwd(), 'src/WorkspaceSurfaceRail.tsx'), 'utf8');

describe('workspace surface rail contracts', () => {
  it('keeps the six customer workspaces aligned with the canonical portal sections', () => {
    expect(CUSTOMER_PACKS.map((pack) => pack.id)).toEqual([
      'catalog', 'orders', 'finance', 'templates', 'account', 'notifications',
    ]);
    expect(source).toContain("variant: 'customer'");
    expect(source).toContain('visibleSections');
    expect(source).toContain('aria-current={active ? \'page\' : undefined}');
  });

  it('keeps every staff workspace bound to a real admin target or explicit boundary', () => {
    expect(STAFF_PACKS).toHaveLength(8);
    for (const pack of STAFF_PACKS) {
      expect(pack.target.startsWith('#')).toBe(true);
      expect(['live', 'mixed', 'boundary']).toContain(pack.tone);
    }
    expect(STAFF_PACKS.find((pack) => pack.id === 'boundaries')?.target).toBe('#admin-boundaries');
    expect(source).toContain("pack.tone === 'boundary' && boundaryVisible");
  });

  it('keeps the responsive rail stylesheet attached to the component', () => {
    expect(source).toContain("import './workspace-surface.css';");
  });
});
