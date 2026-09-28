import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer visible section safety', () => {
  it('normalizes stale hidden sections to the first visible section', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    expect(source).toContain('if(!visible.includes(section) && visible.length) navigate(visible[0]);');
  });
});
