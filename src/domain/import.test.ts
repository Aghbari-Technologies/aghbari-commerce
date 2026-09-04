import { describe, expect, it } from 'vitest';
import { fingerprintImport, normalizeSku, validateImportRows, type ImportRow } from './import';

const validRow = (overrides: Partial<ImportRow> = {}): ImportRow => ({
  rowNumber: 2,
  sku: ' abc-001 ',
  name: 'منتج تجريبي',
  unit: 'كرتون',
  category: 'إلكترونيات',
  quantity: 10,
  prices: { retail: 100, wholesale: 90, distributor: 80 },
  ...overrides
});

describe('import domain', () => {
  it('normalizes SKU deterministically', () => {
    expect(normalizeSku('  abC-001  ')).toBe('ABC-001');
    expect(normalizeSku(null)).toBe('');
  });

  it('rejects duplicate SKUs after normalization', () => {
    const diagnostics = validateImportRows([
      validRow(),
      validRow({ rowNumber: 3, sku: 'ABC-001' })
    ]);
    expect(diagnostics).toContainEqual({ rowNumber: 3, field: 'sku', message: 'Duplicate SKU in file' });
  });

  it('rejects malformed quantity and negative prices', () => {
    const diagnostics = validateImportRows([
      validRow({ quantity: 1.5, prices: { retail: -1, wholesale: 0, distributor: Number.NaN } })
    ]);
    expect(diagnostics).toEqual(expect.arrayContaining([
      { rowNumber: 2, field: 'quantity', message: 'Quantity must be a non-negative integer' },
      { rowNumber: 2, field: 'price.retail', message: 'Price must be a non-negative number' },
      { rowNumber: 2, field: 'price.distributor', message: 'Price must be a non-negative number' }
    ]));
  });

  it('produces the same fingerprint for equivalent normalized rows', () => {
    const a = [validRow()];
    const b = [validRow({ sku: 'ABC-001', name: ' منتج تجريبي ', unit: 'كرتون', category: 'إلكترونيات' })];
    expect(fingerprintImport(a)).toBe(fingerprintImport(b));
  });

  it('changes the fingerprint when authoritative import data changes', () => {
    expect(fingerprintImport([validRow()])).not.toBe(fingerprintImport([validRow({ quantity: 11 })]));
  });
});
