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

  it('does not silently lose the seven customer section model', () => {
    expect(CUSTOMER_PORTAL_SECTIONS).toEqual(['home', 'catalog', 'orders', 'finance', 'templates', 'account', 'notifications']);
  });
});

describe('customer order and notification collection export closure', () => {
  it('keeps customer order export scoped to the filtered collection', () => {
    const sourceText = readRepoSource('CustomerOrdersPanel.tsx');
    expect(sourceText).toContain('exportCurrent');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('filtered.map((order)');
  });

  it('keeps notification export scoped to the visible filtered page', () => {
    const sourceText = readRepoSource('NotificationPanel.tsx');
    expect(sourceText).toContain('exportCurrent');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('visible.map((row)');
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


describe('customer directory export closure', () => {
  it('keeps customer export scoped to the filtered directory', () => {
    const sourceText = readRepoSource('CustomerPanel.tsx');
    expect(sourceText).toContain('exportCurrentCustomers');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('visibleCustomers.map');
  });
});

describe('staff access export closure', () => {
  it('keeps access export scoped to the organization directory without raw ids', () => {
    const sourceText = readRepoSource('StaffAccessPanel.tsx');
    expect(sourceText).toContain('exportCurrentAccess');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('filtered.map');
    expect(sourceText).not.toContain('user.user_id,');
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

  it('keeps the product collection export scoped to the current filtered catalogue', () => {
    const sourceText = readRepoSource('CatalogManagementPanel.tsx');
    expect(sourceText).toContain('exportCurrent');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('filtered.map(product=>');
  });

  it('keeps pricing validity and sorting filters wired to the real price collection', () => {
    const sourceText = readRepoSource('PricingMatrixPanel.tsx');
    expect(sourceText).toContain('فلترة صلاحية السعر');
    expect(sourceText).toContain('ترتيب الأسعار');
    expect(sourceText).toContain('validityMatch');
    expect(sourceText).toContain("sort==='highest'");
  });

  it('keeps pricing export scoped to the current filtered price collection', () => {
    const sourceText = readRepoSource('PricingMatrixPanel.tsx');
    expect(sourceText).toContain('exportCurrent');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('filtered.map(row=>');
  });
});


describe('purchasing, inventory and receiving collection closure', () => {
  it('keeps purchase order sorting tied to server-loaded creation timestamps', () => {
    const sourceText = readRepoSource('PurchasingPanel.tsx');
    expect(sourceText).toContain('created_at');
    expect(sourceText).toContain('ترتيب أوامر الشراء');
    expect(sourceText).toContain("orderSort==='highest'");
  });

  it('keeps inventory history sorting tied to recorded movement timestamps', () => {
    const sourceText = readRepoSource('InventoryHistoryPanel.tsx');
    expect(sourceText).toContain('ترتيب حركات المخزون');
    expect(sourceText).toContain("sort==='oldest'");
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('exportCurrent');
  });

  it('keeps receipt history sorting tied to received_at', () => {
    const sourceText = readRepoSource('PurchaseReceiptHistoryPanel.tsx');
    expect(sourceText).toContain('ترتيب سجل الاستلام');
    expect(sourceText).toContain('received_at');
    expect(sourceText).toContain("sort==='oldest'");
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('exportCsv');
  });

  it('keeps receipt history operationally deep with real receipt lines and export', () => {
    const sourceText = readRepoSource('PurchaseReceiptHistoryPanel.tsx');
    expect(sourceText).toContain("supabase.from('purchase_receipt_items')");
    expect(sourceText).toContain('interface ReceiptItem');
    expect(sourceText).toContain('itemsFor(receipt.id)');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('exportCsv');
  });
});


describe('finance invoice collection closure', () => {
  it('keeps invoice state sorting and collection skeleton wired', () => {
    const sourceText = readRepoSource('FinancePanel.tsx');
    expect(sourceText).toContain('invoiceSort');
    expect(sourceText).toContain('ترتيب سجل الفواتير');
    expect(sourceText).toContain("invoiceSort==='highest'");
    expect(sourceText).toContain('<OperationalLoadingSkeleton variant="collection" />');
  });


  it('keeps finance operations history export scoped to the filtered current tab', () => {
    const sourceText = readRepoSource('FinanceOperationsHistoryPanel.tsx');
    expect(sourceText).toContain('exportCurrent');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('const headers=tab===');
    expect(sourceText).toContain('current.map(row=>');
  });
});


describe('admin command center semantic hygiene', () => {
  it('does not duplicate customer navigation or advertise unsupported smart-sync labels', () => {
    const sourceText = readRepoSource('AdminExecutiveDashboard.tsx');
    expect((sourceText.match(/title="العملاء" target="#admin-customers"/g) ?? []).length).toBe(1);
    expect(sourceText).not.toContain('مزامنة المخزون"');
    expect(sourceText).not.toContain('محرك التسعير الذكي');
    expect(sourceText).toContain('title="مركز البيانات الموحد" target="#admin-import"');
  });
});


describe('inventory and warehouse full collection controls', () => {
  it('does not truncate low-stock results and provides search/filter/pagination', () => {
    const sourceText = readRepoSource('InventoryPanel.tsx');
    expect(sourceText).not.toContain('lowStock.slice(0,20)');
    expect(sourceText).toContain('بحث الأصناف منخفضة المخزون');
    expect(sourceText).toContain('تصفية المستودع للأصناف المنخفضة');
    expect(sourceText).toContain('lowStockActivePage');
  });

  it('keeps warehouse sorting wired to the real created_at/name fields', () => {
    const sourceText = readRepoSource('WarehouseDirectoryPanel.tsx');
    expect(sourceText).toContain('ترتيب المستودعات');
    expect(sourceText).toContain("sort==='name'");
    expect(sourceText).toContain('created_at');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('exportCurrent');
  });
});


describe('inventory movement progressive disclosure', () => {
  it('keeps dense history rows interactive through a real detail drawer', () => {
    const sourceText = readRepoSource('InventoryHistoryPanel.tsx');
    expect(sourceText).toContain('history-row-button');
    expect(sourceText).toContain('selectedMovement');
    expect(sourceText).toContain('<RecordDetailDrawer');
    expect(sourceText).toContain('selectedMovement.source_type');
  });
});


describe('governance export closure', () => {
  it('keeps governance export redacted and scoped to the active tab', () => {
    const sourceText = readRepoSource('StaffOperationsPanel.tsx');
    expect(sourceText).toContain('exportCurrentGovernance');
    expect(sourceText).toContain('تصدير CSV');
    expect(sourceText).toContain('redactAuditMetadata');
    expect(sourceText).toContain('redactSensitiveText');
  });
});

describe('governance collection closure', () => {
  it('keeps audit/outbox sorting tied to created_at and retains a real loading surface', () => {
    const sourceText = readRepoSource('StaffOperationsPanel.tsx');
    expect(sourceText).toContain('ترتيب سجل الحوكمة');
    expect(sourceText).toContain("sort === 'oldest'");
    expect(sourceText).toContain('created_at');
    expect(sourceText).toContain('<OperationalLoadingSkeleton variant="collection" />');
  });
});


describe('supplier and history sort type safety', () => {
  it('keeps supplier history sorting free of explicit any', () => {
    const sourceText = readRepoSource('SupplierLedgerPanel.tsx');
    expect(sourceText).not.toContain('sort((a:any,b:any)');
    expect(sourceText).toContain('type SupplierHistoryRow = Supplier | Bill | Ledger');
  });

  it('keeps supplier ledger export scoped to the active tab', () => {
    const sourceText = readRepoSource('SupplierLedgerPanel.tsx');
    expect(sourceText).toContain('exportCurrent');
    expect(sourceText).toContain('(current as Supplier[])');
    expect(sourceText).toContain('downloadRows(headers,rows');
    expect(sourceText).toContain('tab===\'suppliers\'');
  });
  it('keeps financial and inventory history rows typed', () => {
    expect(readRepoSource('FinanceOperationsHistoryPanel.tsx')).not.toContain('(x:any)');
    expect(readRepoSource('InventoryActivityPanel.tsx')).not.toContain('(row:any)');
  });
});


describe('customer finance single-surface closure', () => {
  it('keeps the customer finance workspace unified without a duplicate legacy ledger', () => {
    const app = readRepoSource('AppV3Fixed.tsx');
    const finance = readRepoSource('CustomerFinancePanel.tsx');
    expect(app).toContain("<CustomerFinancePanel customerId={customerId} online={online} openFirstInvoiceRequest={customerInvoiceOpenRequest} />");
    expect(app).not.toContain('visibleFinanceEntries');
    expect(app).not.toContain('downloadStatement');
    expect(finance).toContain('تنزيل العرض');
    expect(finance).toContain('downloadCurrentView');
    expect(finance).toContain('الفواتير والمدفوعات');
    expect(finance).toContain('كشف الحساب');
    expect(finance).toContain('سجل الدفعات');
  });
});
