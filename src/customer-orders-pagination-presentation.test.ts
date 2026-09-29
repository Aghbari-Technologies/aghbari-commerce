import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer order pagination presentation contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/CustomerOrdersPanel.tsx'), 'utf8');

  it('renders server page bounds without a literal dollar sign', () => {
    expect(source).toContain('عرض {((activePage-1)*PAGE_SIZE)+1}–{Math.min(activePage*PAGE_SIZE,filtered.length)} من {filtered.length}');
    expect(source).not.toContain('–${Math.min(activePage*PAGE_SIZE,filtered.length)}');
  });
});
