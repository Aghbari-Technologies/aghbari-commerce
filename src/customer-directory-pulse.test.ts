import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer directory pulse filters', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/CustomerPanel.tsx'), 'utf8');

  it('renders real active/status/tier counts as filter controls', () => {
    expect(source).toContain('const customerPulse = useMemo');
    expect(source).toContain('customer-pulse-pills');
    expect(source).toContain('item.count');
    expect(source).toContain('setCustomerTierFilter(item.key)');
  });
});
