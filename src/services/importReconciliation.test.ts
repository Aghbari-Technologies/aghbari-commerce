import { describe, expect, it } from 'vitest';
import { buildImportReconciliationReport } from './importExcel';

describe('import reconciliation report', () => {
  it('builds a complete post-commit reconciliation from preview + server result', () => {
    const report = buildImportReconciliationReport({
      sourceName: 'products.xlsx',
      sourceFingerprint: 'sha256:abc123',
      correlationId: '11111111-1111-4111-8111-111111111111',
      inputRows: 10,
      invalidRows: 2,
      result: {
        imported_rows: 8,
        products_created: 3,
        products_updated: 5,
        inventory_changed: 8
      },
      completedAt: '2026-09-27T02:00:00.000Z'
    });
    expect(report).toMatchObject({
      sourceName: 'products.xlsx',
      contractVersion: 'xlsx-v1',
      sourceFingerprint: 'sha256:abc123',
      correlationId: '11111111-1111-4111-8111-111111111111',
      inputRows: 10,
      invalidRows: 2,
      committedRows: 8,
      productsCreated: 3,
      productsUpdated: 5,
      inventoryChanged: 8,
      status: 'committed'
    });
  });

  it('fails closed when server counts exceed the source row population', () => {
    expect(() => buildImportReconciliationReport({
      sourceName: 'products.xlsx',
      sourceFingerprint: 'sha256:abc123',
      correlationId: '11111111-1111-4111-8111-111111111111',
      inputRows: 5,
      invalidRows: 2,
      result: {
        imported_rows: 4,
        products_created: 1,
        products_updated: 3,
        inventory_changed: 4
      }
    })).toThrow();
  });

  it('fails closed when the correlation identity is missing', () => {
    expect(() => buildImportReconciliationReport({
      sourceName: 'products.xlsx',
      sourceFingerprint: 'sha256:abc123',
      correlationId: ' ',
      inputRows: 5,
      invalidRows: 0,
      result: {
        imported_rows: 5,
        products_created: 1,
        products_updated: 4,
        inventory_changed: 5
      }
    })).toThrow();
  });
});
