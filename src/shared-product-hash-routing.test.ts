import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('shared product hash routing contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  it('routes catalog product deep-links to Catalog and exposes a safe id parser', () => {
    expect(source).toContain("function sharedProductIdFromHash(): string | null");
    expect(source).toContain("raw.startsWith('#catalog-product-')");
    expect(source).toContain("if (raw.startsWith('#catalog-product-')) return 'catalog';");
    expect(source).toContain('decodeURIComponent(raw.slice(prefix.length))');
  });
});
