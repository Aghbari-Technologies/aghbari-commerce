import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer catalog discoverability contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('opens real product details from the primary card affordances', () => {
    expect(source).toContain('className="product-media-button"');
    expect(source).toContain('className="product-title-button"');
    expect(source).toContain('onClick={()=>openProduct(p)}');
    expect(source).toContain('aria-label={"فتح تفاصيل "+p.name}');
  });
});
