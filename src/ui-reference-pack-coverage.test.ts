import { describe, expect, it } from 'vitest';
import { UI_REFERENCE_FILES, UI_REFERENCE_PACKS, UI_REFERENCE_TOTAL, uiReferenceCoverageStatus } from './structure/ui-reference-packs';
import { AGHBARI_ADMIN_STRUCTURE } from './structure/admin-structure';

describe('UI reference corpus accounting', () => {
  it('keeps the supplied 84 references fully accounted exactly once', () => {
    expect(UI_REFERENCE_TOTAL).toBe(84);
    expect(UI_REFERENCE_FILES).toHaveLength(84);
    expect(new Set(UI_REFERENCE_FILES).size).toBe(UI_REFERENCE_FILES.length);
  });

  it('keeps every pack mapped to an explicit, non-empty implementation target', () => {
    expect(UI_REFERENCE_PACKS).toHaveLength(8);
    for (const pack of UI_REFERENCE_PACKS) {
      expect(pack.target).toMatch(/^#admin-/);
      expect(pack.references.length).toBeGreaterThan(0);
      expect(uiReferenceCoverageStatus(pack.status)).toMatch(/live|boundary|contract-gap/);
    }
  });

  it('keeps every in-scope visual pack on a canonical Admin surface', () => {
    const targets = new Set(
      AGHBARI_ADMIN_STRUCTURE.flatMap((group) => group.items.map((item) => item.target).filter(Boolean)),
    );
    for (const pack of UI_REFERENCE_PACKS) {
      if (pack.status === 'external-pattern') continue;
      expect(targets.has(pack.target)).toBe(true);
    }
  });
});
