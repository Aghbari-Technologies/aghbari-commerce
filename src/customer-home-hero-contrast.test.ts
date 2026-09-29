import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer Home hero contrast', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');

  it('keeps the Home hero text readable over a deliberate dark surface', () => {
    expect(css).toContain('.customer-home-workspace .customer-home-hero');
    expect(css).toContain('color:#fff');
    expect(css).toContain('.customer-home-workspace .customer-home-hero h2{color:#fff');
    expect(css).toContain('.customer-home-workspace .customer-home-hero p{color:#e1f5f7}');
  });
});
