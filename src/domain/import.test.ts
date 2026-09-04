import { describe, expect, it } from 'vitest';
import { fingerprintImport, normalizeSku, validateImportRows, type ImportRow, MAX_IMPORT_CATEGORY_LENGTH, MAX_IMPORT_NAME_LENGTH, MAX_IMPORT_PRICE, MAX_IMPORT_QUANTITY, MAX_IMPORT_SKU_LENGTH } from './import';

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
      { rowNumber: 2, field: 'quantity', message: expect.stringContaining('safe integer') },
      { rowNumber: 2, field: 'price.retail', message: expect.stringContaining('non-negative') },
      { rowNumber: 2, field: 'price.distributor', message: expect.stringContaining('finite') }
    ]));
  });

  it('rejects oversized textual fields before staging', () => {
    const diagnostics = validateImportRows([
      validRow({
        sku: 'S'.repeat(MAX_IMPORT_SKU_LENGTH + 1),
        name: 'N'.repeat(MAX_IMPORT_NAME_LENGTH + 1),
        category: 'C'.repeat(MAX_IMPORT_CATEGORY_LENGTH + 1)
      })
    ]);
    expect(diagnostics).toEqual(expect.arrayContaining([
      { rowNumber: 2, field: 'sku', message: expect.stringContaining(`${MAX_IMPORT_SKU_LENGTH}`) },
      { rowNumber: 2, field: 'name', message: expect.stringContaining(`${MAX_IMPORT_NAME_LENGTH}`) },
      { rowNumber: 2, field: 'category', message: expect.stringContaining(`${MAX_IMPORT_CATEGORY_LENGTH}`) }
    ]));
  });

  it('rejects unsafe inventory quantities', () => {
    expect(validateImportRows([validRow({ quantity: MAX_IMPORT_QUANTITY + 1 })])).toContainEqual({
      rowNumber: 2,
      field: 'quantity',
      message: expect.stringContaining(`${MAX_IMPORT_QUANTITY}`)
    });
    expect(validateImportRows([validRow({ quantity: Number.MAX_SAFE_INTEGER + 1 })])).toHaveLength(1);
  });

  it('rejects money that cannot be represented safely at cent precision', () => {
    expect(validateImportRows([validRow({ prices: { retail: MAX_IMPORT_PRICE + 1, wholesale: 90, distributor: 80 } })])).toContainEqual({
      rowNumber: 2,
      field: 'price.retail',
      message: expect.stringContaining('safe cent precision')
    });
    expect(validateImportRows([validRow({ prices: { retail: 1.001, wholesale: 90, distributor: 80 } })])).toContainEqual({
      rowNumber: 2,
      field: 'price.retail',
      message: expect.stringContaining('safe cent precision')
    });
    expect(validateImportRows([validRow({ prices: { retail: Number.NaN, wholesale: Number.POSITIVE_INFINITY, distributor: 80 } })])).toEqual(expect.arrayContaining([
      { rowNumber: 2, field: 'price.retail', message: expect.any(String) },
      { rowNumber: 2, field: 'price.wholesale', message: expect.any(String) }
    ]));
  });

  it('produces the same SHA-256 fingerprint for equivalent normalized rows', async () => {
    const a = [validRow()];
    const b = [validRow({ sku: 'ABC-001', name: ' منتج تجريبي ', unit: 'كرتون', category: 'إلكترونيات' })];
    expect(await fingerprintImport(a)).toBe(await fingerprintImport(b));
  });

  it('is invariant to spreadsheet row order', async () => {
    const a = [validRow({ sku: 'ABC-001' }), validRow({ sku: 'ABC-002', rowNumber: 3 })];
    const b = [validRow({ sku: 'ABC-002', rowNumber: 99 }), validRow({ sku: 'ABC-001', rowNumber: 100 })];
    expect(await fingerprintImport(a)).toBe(await fingerprintImport(b));
  });

  it('changes the fingerprint when authoritative import data changes', async () => {
    expect(await fingerprintImport([validRow()])).not.toBe(await fingerprintImport([validRow({ quantity: 11 })]));
  });

  it('produces a SHA-256 hexadecimal digest', async () => {
    expect(await fingerprintImport([validRow()])).toMatch(/^[a-f0-9]{64}$/);
  });
});
