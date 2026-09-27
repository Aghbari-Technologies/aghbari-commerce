import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { UI_REFERENCE_FILES, UI_REFERENCE_PACKS, UI_REFERENCE_TOTAL } from './ui-reference-packs';

describe('ui reference screen-pack coverage', () => {
  it('accounts for all 84 current PNG references exactly once', () => {
    expect(UI_REFERENCE_TOTAL).toBe(84);
    expect(UI_REFERENCE_FILES).toHaveLength(84);
    expect(new Set(UI_REFERENCE_FILES).size).toBe(84);
  });

  it('keeps every reference inside a non-empty implementation pack with an explicit target', () => {
    expect(UI_REFERENCE_PACKS).toHaveLength(8);
    for (const pack of UI_REFERENCE_PACKS) {
      expect(pack.references.length).toBeGreaterThan(0);
      expect(pack.target.startsWith('#')).toBe(true);
      expect(pack.note.trim().length).toBeGreaterThan(10);
    }
  });

  it('does not duplicate references across packs', () => {
    const seen = new Set<string>();
    for (const pack of UI_REFERENCE_PACKS) {
      for (const reference of pack.references) {
        expect(seen.has(reference)).toBe(false);
        seen.add(reference);
      }
    }
  });

  it('resolves every registry member to the tracked reference asset', () => {
    for (const reference of UI_REFERENCE_FILES) {
      expect(reference.endsWith('.png')).toBe(true);
      expect(existsSync(resolve(process.cwd(), 'docs/ui-reference', reference))).toBe(true);
    }
  });
});
