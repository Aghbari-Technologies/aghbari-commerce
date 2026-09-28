import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AGHBARI_ADMIN_LIVE_ITEMS } from './structure/admin-structure';
import { CUSTOMER_PORTAL_SECTIONS } from './structure/customer-structure';

function source(path: string) {
  return readFileSync(resolve(process.cwd(), 'src', path), 'utf8');
}

describe('UI screen-family closure contract', () => {
  it('keeps every live admin target backed by an actual DOM anchor', () => {
    const admin = source('AdminPanel.tsx');
    const missing = [...new Set(
      AGHBARI_ADMIN_LIVE_ITEMS
        .map((item) => item.target)
        .filter((target): target is string => Boolean(target))
        .map((target) => target.replace(/^#/, '')),
    )].filter((id) => !admin.includes(`id="${id}"`));
    expect(missing).toEqual([]);
  });

  it('keeps all six customer portal sections mounted in the canonical app', () => {
    const app = source('AppV3Fixed.tsx');
    for (const section of CUSTOMER_PORTAL_SECTIONS) {
      expect(app).toContain("section==='" + section + "'");
    }
  });

  it('does not silently lose the six customer section model', () => {
    expect(CUSTOMER_PORTAL_SECTIONS).toEqual(['catalog', 'orders', 'finance', 'templates', 'account', 'notifications']);
  });
});

describe('admin dashboard full structure', () => {
  it('does not truncate canonical structure groups before rendering', () => {
    const dashboard = source('AdminExecutiveDashboard.tsx');
    expect(dashboard).not.toContain(".slice(0, 8)");
    expect(dashboard).toContain('const boundaryItems = group.items.filter((item) => item.status !== \'live\');');
    expect(dashboard).toContain('const liveItems = group.items.filter((item) => item.status === \'live\');');
  });
});


describe('collection control parity', () => {
  it('keeps administrative order sorting wired', () => {
    const source = source('AdminPanel.tsx');
    expect(source).toContain('orderSort');
    expect(source).toContain('ترتيب الطلبات الإدارية');
  });

  it('keeps finance, inventory activity and supplier collection sorting wired', () => {
    const finance = source('FinanceOperationsHistoryPanel.tsx');
    const inventory = source('InventoryActivityPanel.tsx');
    const supplier = source('SupplierLedgerPanel.tsx');
    expect(finance).toContain("value={sort}");
    expect(inventory).toContain("value={sort}");
    expect(supplier).toContain("value={sort}");
    expect(finance).toContain("sort==='highest'");
    expect(inventory).toContain("sort==='oldest'");
    expect(supplier).toContain("sort==='highest'");
  });
});
