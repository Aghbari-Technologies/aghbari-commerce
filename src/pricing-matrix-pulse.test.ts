import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('pricing matrix pulse filters', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/PricingMatrixPanel.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/pricing-matrix.css'), 'utf8');

  it('derives real validity and tier counts and exposes quick filters', () => {
    expect(source).toContain('const pricingPulse=useMemo');
    expect(source).toContain('pricing-pulse-pills');
    expect(source).toContain('pricingPulse.current');
    expect(source).toContain('pricingPulse.future');
    expect(source).toContain('pricingPulse.expired');
  });

  it('keeps the pulse row horizontally usable on dense screens', () => {
    expect(css).toContain('pricing-pulse-pills');
  });
});
