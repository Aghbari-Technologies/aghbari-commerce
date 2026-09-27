import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const files = [
  'CatalogManagementPanel.tsx',
  'CategoryManagementPanel.tsx',
  'WarehouseDirectoryPanel.tsx',
  'SupplierLedgerPanel.tsx',
  'PurchaseReceiptHistoryPanel.tsx',
  'InventoryHistoryPanel.tsx',
  'FinanceOperationsHistoryPanel.tsx',
  'PricingMatrixPanel.tsx',
] as const;

describe('admin collection loading coverage', () => {
  it('uses the shared structural collection skeleton instead of text-only placeholders', () => {
    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), 'src', file), 'utf8');
      expect(source).toContain('<OperationalLoadingSkeleton variant="collection"');
      expect(source).not.toContain('className="portal-loading"');
      expect(source).not.toContain("className='portal-loading'");
    }
  });

  it('keeps one shared responsive skeleton implementation', () => {
    const component = readFileSync(resolve(process.cwd(), 'src/OperationalLoadingSkeleton.tsx'), 'utf8');
    const css = readFileSync(resolve(process.cwd(), 'src/operational-loading-skeleton.css'), 'utf8');
    expect(component).toContain("variant === 'collection'");
    expect(css).toContain('.operational-skeleton-collection');
    expect(css).toContain('prefers-reduced-motion:reduce');
  });
});
