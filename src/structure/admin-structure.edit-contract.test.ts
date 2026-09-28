import { describe, expect, it } from 'vitest';
import { AGHBARI_ADMIN_STRUCTURE } from './admin-structure';

describe('admin supplier and warehouse edit contract', () => {
  it('keeps supported edit surfaces live and pointed at their real workspaces', () => {
    const items = AGHBARI_ADMIN_STRUCTURE.flatMap((group) => group.items);
    const warehouse = items.find((item) => item.id === 'warehouse-edit');
    const supplier = items.find((item) => item.id === 'supplier-edit');

    expect(warehouse).toMatchObject({
      status: 'live',
      permission: 'stock.manage',
      target: '#admin-warehouses',
    });
    expect(supplier).toMatchObject({
      status: 'live',
      permission: 'purchasing.manage',
      target: '#admin-suppliers',
    });
  });
});
