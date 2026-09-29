import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer global search suggestions contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('derives bounded suggestions from loaded authorized catalog data', () => {
    expect(source).toContain('globalSearchMatches=useMemo');
    expect(source).toContain('slice(0,6)');
    expect(source).toContain('portal-search-suggestions');
    expect(source).toContain('openProduct(product)');
    expect(source).toContain('aria-autocomplete="list"');
  });
});
