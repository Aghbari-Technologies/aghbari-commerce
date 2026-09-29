import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('public storefront surface', () => {
  it('keeps a real shopper-facing store surface separate from the operations panel', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/Storefront.tsx'), 'utf8');
    const styles = readFileSync(resolve(process.cwd(), 'src/storefront.css'), 'utf8');
    expect(source).toContain('متجر الأغبري');
    expect(source).toContain('ابدأ التسوق');
    expect(source).toContain('السلة');
    expect(source).toContain('دخول الحساب');
    expect(styles).toContain('.storefront-header');
    expect(styles).toContain('.storefront-hero');
    expect(styles).toContain('.storefront-entry-grid');
  });
});
