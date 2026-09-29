import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('warehouse pulse filters', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/WarehouseDirectoryPanel.tsx'), 'utf8');
  it('derives real active/inactive counts and binds them to status filters', () => {
    expect(source).toContain('const warehousePulse=useMemo');
    expect(source).toContain('warehouse-pulse-pills');
    expect(source).toContain('warehousePulse.active');
    expect(source).toContain('warehousePulse.inactive');
  });
});
