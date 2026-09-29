import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer compact catalog view', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');
  it('changes actual grid density instead of only changing typography', () => {
    expect(css).toContain('.customer-shell .product-grid-compact{grid-template-columns:repeat(5,minmax(0,1fr))');
    expect(css).toContain('.customer-shell .product-grid-compact .product-visual');
    expect(css).toContain('.customer-shell .product-grid-compact .product-card-secondary-actions');
  });
  it('keeps compact mode responsive', () => {
    expect(css).toContain('@media(max-width:1120px)');
    expect(css).toContain('@media(max-width:860px)');
    expect(css).toContain('@media(max-width:620px)');
  });
});
