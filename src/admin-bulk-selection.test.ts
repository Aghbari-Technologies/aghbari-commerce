import { describe, expect, it } from 'vitest';
import { canSelectBulkOrder, MAX_BULK_ORDER_SELECTION } from './admin-bulk-selection';

describe('bulk order selection contract', () => {
  it('allows selection while the canonical 100-order ceiling is not exceeded', () => {
    expect(MAX_BULK_ORDER_SELECTION).toBe(100);
    expect(canSelectBulkOrder(0)).toBe(true);
    expect(canSelectBulkOrder(99)).toBe(true);
    expect(canSelectBulkOrder(100, 0)).toBe(true);
    expect(canSelectBulkOrder(100)).toBe(false);
  });

  it('fails closed for invalid counts and oversized additions', () => {
    expect(canSelectBulkOrder(-1)).toBe(false);
    expect(canSelectBulkOrder(101)).toBe(false);
    expect(canSelectBulkOrder(95, 6)).toBe(false);
    expect(canSelectBulkOrder(95, 5)).toBe(true);
    expect(canSelectBulkOrder(10, -1)).toBe(false);
  });
});
