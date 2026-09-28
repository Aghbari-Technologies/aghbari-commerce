import { describe, expect, it } from 'vitest';
import { UI_REFERENCE_FILES, UI_REFERENCE_PACKS, UI_REFERENCE_TOTAL, uiReferenceCoverageStatus } from './structure/ui-reference-packs';
import { AGHBARI_ADMIN_LIVE_ITEMS } from './structure/admin-structure';

describe('UI reference corpus contract', () => {
  it('keeps all 84 provenance references represented exactly once', () => {
    expect(UI_REFERENCE_TOTAL).toBe(84);
    expect(UI_REFERENCE_FILES).toHaveLength(84);
    expect(new Set(UI_REFERENCE_FILES).size).toBe(84);
  });

  it('keeps every visual pack mapped to a live admin target or explicit boundary', () => {
    const liveTargets = new Set(AGHBARI_ADMIN_LIVE_ITEMS.map((item) => item.target?.trim()).filter(Boolean));
    for (const pack of UI_REFERENCE_PACKS) {
      if (pack.status === 'external-pattern') expect(pack.target).toBe('#admin-boundaries');
      else expect(liveTargets.has(pack.target.trim())).toBe(true);
    }
  });

  it('keeps every visual pack mapped to an explicit workspace target', () => {
    expect(UI_REFERENCE_PACKS).toHaveLength(8);
    for (const pack of UI_REFERENCE_PACKS) {
      expect(pack.target.startsWith('#admin-')).toBe(true);
      expect(pack.references.length).toBeGreaterThan(0);
      expect(uiReferenceCoverageStatus(pack.status)).toMatch(/^(live|boundary|contract-gap)$/);
    }
  });

  it('does not convert external-pattern packs into executable Commerce screens', () => {
    for (const pack of UI_REFERENCE_PACKS.filter((item) => item.status === 'external-pattern')) {
      expect(uiReferenceCoverageStatus(pack.status)).toBe('boundary');
      expect(['#admin-boundaries']).toContain(pack.target);
    }
  });
});
