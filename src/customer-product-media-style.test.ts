import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer product media styling contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');

  it('keeps the primary product media at the intended card aspect ratio', () => {
    expect(css).toContain('.customer-shell .product-card .product-media-button>img');
    expect(css).toContain('aspect-ratio:1.08');
    expect(css).toContain('.customer-shell .product-card .product-media-button>.product-placeholder');
  });
});
