import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer saved shelf accessibility contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/CustomerSavedShelf.tsx'), 'utf8');

  it('exposes favorite state for assistive technology', () => {
    expect(source).toContain('aria-pressed={canRemoveFavorite}');
    expect(source).toContain("aria-label={canRemoveFavorite?'إزالة من المفضلة':'حفظ في المفضلة'}");
  });
});
