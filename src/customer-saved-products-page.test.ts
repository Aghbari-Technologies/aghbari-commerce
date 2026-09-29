import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer saved products page shell', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('renders dedicated saved-page context without duplicating the saved shelf implementation', () => {
    expect(source).toContain('className="customer-saved-page"');
    expect(source).toContain('Saved Products');
    expect(source).toContain('favoriteIds.length.toLocaleString');
    expect(source).toContain('recentProductIds.length.toLocaleString');
    expect(source).toContain('<CustomerSavedShelf');
  });
});
