import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SAFE_ALTERNATIVES } from './AdminBoundaryCenter';

describe('admin boundary workspace links', () => {
  it('keeps every safe alternative on a real AdminPanel DOM anchor', () => {
    const adminSource = read(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');
    const boundarySource = readFile(resolve(process.cwd(), 'src/AdminBoundaryCenter.tsx'), 'utf8');
    const liveDom = adminSource + '\n' + boundarySource;
    for (const alternative of Object.values(SAFE_ALTERNATIVES)) {
      const id = alternative.target.startsWith('#') ? alternative.target.slice(1) : '';
      expect(id.length).toBeGreaterThan(0);
      expect(liveDom.includes('id="' + id + '"') || liveDom.includes("id='" + id + "'"), alternative.target + ' must resolve to a live Admin/Boundary anchor').toBe(true);
    }
  });

  it('never routes a safe alternative into the boundary workspace itself', () => {
    expect(Object.values(SAFE_ALTERNATIVES).some((item) => item.target === '#admin-boundaries')).toBe(false);
  });
});
