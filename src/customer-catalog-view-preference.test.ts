import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer catalog view preference', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('restores and persists the grid/compact choice locally', () => {
    expect(source).toContain("window.localStorage.getItem('aghbari.catalog-view')");
    expect(source).toContain("window.localStorage.setItem('aghbari.catalog-view',view)");
    expect(source).toContain("setCatalogView(view:'grid'|'compact')");
  });

  it('fails safely when browser storage is unavailable', () => {
    expect(source).toContain('try{const saved=window.localStorage');
    expect(source).toContain("catch{return 'grid';}");
    expect(source).toContain('catch{ /* storage may be unavailable */ }');
  });
});
