import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('customer order timeline current state', () => {
  it('marks the active status as current rather than complete', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/CustomerOrdersPanel.tsx'), 'utf8');
    expect(source).toContain("const current=index===progress-1; const complete=index<progress-1;");
    expect(source).toContain("className={current ? 'is-current' : complete ? 'is-complete' : ''}");
    expect(source).not.toContain("index < progress ? 'is-complete' : index === progress-1 ? 'is-current'");
  });
});
