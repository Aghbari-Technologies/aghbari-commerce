import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer product secondary actions layout contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('keeps one shared secondary-actions wrapper per product card', () => {
    expect(source).toContain('<div className="product-card-secondary-actions"><button type="button" className="ghost" onClick={()=>openProduct(p)}>');
    expect(source).not.toContain('<div className="product-card-secondary-actions"><div className="product-card-secondary-actions">');
  });
});
