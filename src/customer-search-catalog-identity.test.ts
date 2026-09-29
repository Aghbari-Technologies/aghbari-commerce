import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer search catalog identity contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('keeps barcode available on priced catalog products', () => {
    expect(source).toContain('barcode?: string | null');
    expect(source).toContain('barcode:item.barcode ?? null');
  });
});
