import { describe, expect, it } from 'vitest';
import { validateImportRows } from './import';
import { nextRetryAt, isTerminalAttempt } from './outbox';
import { validateOrderDraft } from './order';
import { resolveDisplayPrice } from './pricing';

describe('commerce domain invariants', () => {
  it('rejects duplicate SKUs and invalid prices during import validation', () => {
    const diagnostics = validateImportRows([
      { rowNumber: 2, sku: 'a-1', name: 'Rice', unit: 'bag', category: 'Rice', quantity: 5, prices: { retail: 10, wholesale: -1, distributor: 8 } },
      { rowNumber: 3, sku: 'A-1', name: 'Rice 2', unit: 'bag', category: 'Rice', quantity: 4, prices: { retail: 10, wholesale: 9, distributor: 8 } }
    ]);
    expect(diagnostics.some((d) => d.field === 'price.wholesale')).toBe(true);
    expect(diagnostics.some((d) => d.message === 'Duplicate SKU in file')).toBe(true);
  });

  it('validates positive quantities and stock limits', () => {
    const inventory = new Map([['p1', 3]]);
    expect(() => validateOrderDraft({ customerId: 'c1', idempotencyKey: '1234567890123456', lines: [{ productId: 'p1', quantity: 4 }] }, inventory)).toThrow('insufficient stock');
    expect(() => validateOrderDraft({ customerId: 'c1', idempotencyKey: '1234567890123456', lines: [{ productId: 'p1', quantity: 2 }] }, inventory)).not.toThrow();
  });

  it('resolves only the requested effective tier price', () => {
    const price = resolveDisplayPrice([
      { productId: 'p1', tier: 'retail', amount: 12, currency: 'YER', validFrom: '2026-01-01T00:00:00Z' },
      { productId: 'p1', tier: 'wholesale', amount: 10, currency: 'YER', validFrom: '2026-01-01T00:00:00Z' },
      { productId: 'p1', tier: 'wholesale', amount: 9, currency: 'YER', validFrom: '2026-06-01T00:00:00Z' }
    ], 'wholesale', new Date('2026-09-01T00:00:00Z'));
    expect(price?.amount).toBe(9);
    expect(price?.tier).toBe('wholesale');
  });

  it('bounds retry backoff and identifies terminal attempts', () => {
    const now = Date.parse('2026-09-01T00:00:00Z');
    expect(nextRetryAt(1, now)).toBe(now + 2000);
    expect(nextRetryAt(99, now)).toBe(now + 900000);
    expect(isTerminalAttempt(8)).toBe(true);
    expect(isTerminalAttempt(7)).toBe(false);
  });
});
