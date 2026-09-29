import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer saved capability dispatcher', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  it('routes saved-products directly to the dedicated Saved workspace', () => {
    expect(source).toContain("case 'saved-products':");
    expect(source).toContain("navigate('saved');");
  });
});
