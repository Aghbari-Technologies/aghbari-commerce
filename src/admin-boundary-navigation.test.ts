import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const adminSource = readFileSync(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');
const boundarySource = readFileSync(resolve(process.cwd(), 'src/AdminBoundaryCenter.tsx'), 'utf8');

describe('admin boundary navigation contracts', () => {
  it('keeps every declared safe alternative bound to a live Admin anchor', () => {
    const targets = [...boundarySource.matchAll(/target:s*'(#[^']+)'/g)].map((match) => match[1]);
    expect(targets.length).toBeGreaterThan(0);
    for (const target of [...new Set(targets)]) {
      expect(adminSource).toContain(`id="${target.slice(1)}"`);
    }
  });

  it('keeps the boundary center itself mounted in the Admin runtime', () => {
    expect(adminSource).toContain('<AdminBoundaryCenter role={role} />');
  });
});
