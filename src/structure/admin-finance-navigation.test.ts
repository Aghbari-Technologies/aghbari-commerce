import { describe, expect, it } from 'vitest';
import { AGHBARI_ADMIN_LIVE_ITEMS, adminTargetForPath, getAdminStructureForRole } from './admin-structure';

describe('admin finance navigation contract', () => {
  const paths = [
    '/admin/finance/statements',
    '/admin/finance/invoices',
    '/admin/finance/payments',
    '/admin/finance/expenses',
  ];

  it('maps every financial surface to the real finance workspace', () => {
    for (const path of paths) {
      expect(adminTargetForPath(path)).toBe('#admin-finance');
    }
  });

  it('keeps the four financial surfaces in the live navigation registry', () => {
    for (const id of ['statements', 'invoices', 'payments', 'expenses']) {
      expect(AGHBARI_ADMIN_LIVE_ITEMS.some((item) => item.id === id)).toBe(true);
    }
  });

  it('does not invent a new permission for sales finance access', () => {
    const sales = getAdminStructureForRole('sales').flatMap((group) => group.items);
    expect(sales.filter((item) => item.permission === 'finance.view').map((item) => item.id)).toEqual(
      expect.arrayContaining(['statements', 'invoices', 'payments', 'expenses'])
    );
  });

  it('keeps finance navigation hidden from warehouse without finance.view', () => {
    const warehouse = getAdminStructureForRole('warehouse').flatMap((group) => group.items);
    expect(warehouse.some((item) => ['statements', 'invoices', 'payments', 'expenses'].includes(item.id))).toBe(false);
  });
});
