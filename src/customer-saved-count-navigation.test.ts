import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer saved count navigation contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');

  it('surfaces the real favorite count next to Saved Products navigation', () => {
    expect(app).toContain("favoriteIds.length>0");
    expect(app).toContain('portal-nav-count-badge');
    expect(css).toContain('.portal-nav-count-badge');
  });
});
