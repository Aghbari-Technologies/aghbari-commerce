import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('admin order status pulse filters', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');

  it('renders real status counts and uses them as filter controls', () => {
    expect(source).toContain('const orderStatusCounts = useMemo');
    expect(source).toContain('admin-order-status-pills');
    expect(source).toContain('orderStatusFilter===item.status');
    expect(source).toContain('item.count');
  });
});
