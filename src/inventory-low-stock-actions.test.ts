import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('inventory low-stock quick actions', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/InventoryPanel.tsx'), 'utf8');

  it('binds low-stock threshold action to the real threshold form', () => {
    expect(source).toContain('id="inventory-threshold"');
    expect(source).toContain('low-stock-quick-actions');
    expect(source).toContain('setThresholdProduct(row.product_id)');
    expect(source).toContain('setThresholdWarehouse(row.warehouse_id)');
    expect(source).toContain('setMinQuantity(String(row.min_quantity))');
    expect(source).toContain('setReorderQuantity(String(row.reorder_quantity))');
  });
});
