import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AGHBARI_ADMIN_LIVE_ITEMS } from './structure/admin-structure';
import { CUSTOMER_PORTAL_SECTIONS } from './structure/customer-structure';

function readRepoSource(path: string) {
  return readFileSync(resolve(process.cwd(), 'src', path), 'utf8');
}

describe('UI screen-family closure contract', () => {
  it('keeps every live admin target backed by an actual DOM anchor', () => {
    const admin = readRepoSource('AdminPanel.tsx');
    const missing = [...new Set(
      AGHBARI_ADMIN_LIVE_ITEMS
        .map((item) => item.target)
        .filter((target): target is string => Boolean(target))
        .map((target) => target.replace(/^#/, '')),
    )].filter((id) => !admin.includes(`id="${id}"`));
    expect(missing).toEqual([]);
  });

  it('keeps all six customer portal sections mounted in the canonical app', () => {
    const app = readRepoSource('AppV3Fixed.tsx');
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
    const dashboard = readRepoSource('AdminExecutiveDashboard.tsx');
    expect(dashboard).not.toContain(".slice(0, 8)");
    expect(dashboard).toContain('const boundaryItems = group.items.filter((item) => item.status !== \'live\');');
    expect(dashboard).toContain('const liveItems = group.items.filter((item) => item.status === \'live\');');
  });
});


describe('collection control parity', () => {
  it('keeps administrative order sorting wired', () => {
    const sourceText = readRepoSource('AdminPanel.tsx');
    expect(sourceText).toContain('orderSort');
    expect(sourceText).toContain('ترتيب الطلبات الإدارية');
  });

  it('keeps finance, inventory activity and supplier collection sorting wired', () => {
    const finance = readRepoSource('FinanceOperationsHistoryPanel.tsx');
    const inventory = readRepoSource('InventoryActivityPanel.tsx');
    const supplier = readRepoSource('SupplierLedgerPanel.tsx');
    expect(finance).toContain("value={sort}");
    expect(inventory).toContain("value={sort}");
    expect(supplier).toContain("value={sort}");
    expect(finance).toContain("sort==='highest'");
    expect(inventory).toContain("sort==='oldest'");
    expect(supplier).toContain("sort==='highest'");
  });
});


describe('staff access collection closure', () => {
  it('keeps account-type, role and sort filters wired to the live access directory', () => {
    const sourceText = readRepoSource('StaffAccessPanel.tsx');
    expect(sourceText).toContain('accountType');
    expect(sourceText).toContain('roleFilter');
    expect(sourceText).toContain('sort');
    expect(sourceText).toContain('فلترة نوع الحساب');
    expect(sourceText).toContain('فلترة دور الحساب');
    expect(sourceText).toContain('ترتيب الحسابات');
  });
});


describe('catalog and pricing surface closure', () => {
  it('keeps category details as progressive disclosure instead of hiding hierarchy', () => {
    const sourceText = readRepoSource('CategoryManagementPanel.tsx');
    expect(sourceText).toContain('category-detail-button');
    expect(sourceText).toContain('<RecordDetailDrawer');
    expect(sourceText).toContain('selectedCategory');
  });

  it('keeps pricing validity and sorting filters wired to the real price collection', () => {
    const sourceText = readRepoSource('PricingMatrixPanel.tsx');
    expect(sourceText).toContain('فلترة صلاحية السعر');
    expect(sourceText).toContain('ترتيب الأسعار');
    expect(sourceText).toContain('validityMatch');
    expect(sourceText).toContain("sort==='highest'");
  });
});
