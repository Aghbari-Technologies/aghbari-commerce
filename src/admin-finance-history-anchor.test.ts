import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { AGHBARI_ADMIN_LIVE_ITEMS, AGHBARI_ADMIN_PATH_TARGETS, adminOrderIdForPath } from './structure/admin-structure';

const root = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(resolve(root, name), 'utf8');

const adminPanelSource = read('AdminPanel.tsx');
const dashboardSource = read('AdminExecutiveDashboard.tsx');
const boundarySource = read('AdminBoundaryCenter.tsx');
const financeHistorySource = read('FinanceOperationsHistoryPanel.tsx');
const runtimeSources = [
  adminPanelSource,
  dashboardSource,
  boundarySource,
  financeHistorySource,
  read('CatalogManagementPanel.tsx'),
  read('PricingMatrixPanel.tsx'),
  read('InventoryHistoryPanel.tsx'),
  read('InventoryActivityPanel.tsx'),
  read('WarehouseDirectoryPanel.tsx'),
  read('SupplierLedgerPanel.tsx'),
  read('PurchaseReceiptHistoryPanel.tsx'),
  read('ExportPanel.tsx'),
  read('ClientControlPanel.tsx'),
  read('NotificationPanel.tsx'),
  read('StaffOperationsPanel.tsx'),
  read('StaffAccessPanel.tsx'),
];

describe('admin finance history workspace contract', () => {
  it('routes the dedicated finance history path to its dedicated anchor', () => {
    expect(AGHBARI_ADMIN_PATH_TARGETS['/admin/finance/history']).toBe('#admin-finance-history');
  });

  it('keeps the dedicated finance history anchor executable in the live Admin panel', () => {
    expect(financeHistorySource).toContain("id='admin-finance-history'");
    expect(adminPanelSource).toContain('href="#admin-finance-history"');
    expect(adminPanelSource).toContain('FinanceOperationsHistoryPanel');
  });

  it('resolves an Admin order deep link to the concrete record id', () => {
    expect(adminOrderIdForPath('/admin/order/order-123')).toBe('order-123');
    expect(adminOrderIdForPath('/admin/orders')).toBeNull();
  });

  it('opens the concrete order when the Admin panel receives a deep-link path', () => {
    expect(adminPanelSource).toContain('const orderId = adminOrderIdForPath(pathname);');
    expect(adminPanelSource).toContain('if (orderId) void openOrderDetail(orderId);');
  });

  it('keeps the dashboard data-center shortcut on the real data workspace', () => {
    expect(dashboardSource).toContain('target="#admin-import"');
    expect(dashboardSource).not.toContain('title="مركز البيانات الموحد" target="#admin-catalog"');
  });

  it('guards every live Admin workspace target against anchor drift', () => {
    for (const item of AGHBARI_ADMIN_LIVE_ITEMS) {
      if (!item.target) continue;
      const id = item.target.slice(1);
      const count = runtimeSources.reduce(
        (total, source) =>
          total +
          Math.max(0, source.split('id="' + id + '"').length - 1) +
          Math.max(0, source.split("id='" + id + "'").length - 1),
        0,
      );
      expect(count, 'expected exactly one DOM owner for #' + id).toBe(1);
    }
  });
});
