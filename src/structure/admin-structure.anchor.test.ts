import { describe, expect, it } from 'vitest';
import adminPanelSource from '../AdminPanel.tsx?raw';
import { AGHBARI_ADMIN_LIVE_ITEMS } from './admin-structure';

describe('admin live navigation anchors', () => {
  it('keeps every live structure target represented by a real AdminPanel DOM id', () => {
    const source = adminPanelSource;
    for (const item of AGHBARI_ADMIN_LIVE_ITEMS) {
      const target = item.target;
      if (!target || !target.startsWith('#')) continue;
      const id = target.slice(1);
      const present = source.includes('id="' + id + '"') || source.includes("id='" + id + "'");
      expect(present, item.id + ' must resolve to a live AdminPanel anchor').toBe(true);
    }
  });
});
