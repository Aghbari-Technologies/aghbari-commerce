import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AGHBARI_ADMIN_LIVE_ITEMS } from './admin-structure';

describe('admin live navigation anchors', () => {
  it('keeps every live structure target represented by a real AdminPanel DOM id', () => {
    const source = readFileSync(new URL('../AdminPanel.tsx', import.meta.url), 'utf8');
    for (const item of AGHBARI_ADMIN_LIVE_ITEMS) {
      const target = item.target;
      if (!target || !target.startsWith('#')) continue;
      const id = target.slice(1);
      const present = source.includes('id="' + id + '"') || source.includes("id='" + id + "'");
      expect(present, item.id + ' must resolve to a live AdminPanel anchor').toBe(true);
    }
  });
});
