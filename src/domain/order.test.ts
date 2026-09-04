import { describe, expect, it } from 'vitest';
import { OrderValidationError, validateOrderDraft } from './order';

const inventory = new Map([['p1', 10], ['p2', 20]]);

const draft = (lines: Array<{ productId: string; quantity: number }>) => ({
  customerId: 'customer-1',
  idempotencyKey: 'order-key-1234567890',
  lines
});

describe('order domain validation', () => {
  it('accepts a valid multi-line order', () => {
    expect(() => validateOrderDraft(draft([
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 3 }
    ]), inventory)).not.toThrow();
  });

  it('rejects duplicate product lines before command execution', () => {
    expect(() => validateOrderDraft(draft([
      { productId: 'p1', quantity: 2 },
      { productId: 'p1', quantity: 1 }
    ]), inventory)).toThrowError(new OrderValidationError('duplicate product line'));
  });

  it('rejects an oversized order payload', () => {
    const lines = Array.from({ length: 101 }, (_, index) => ({ productId: `p-${index}`, quantity: 1 }));
    expect(() => validateOrderDraft(draft(lines), inventory)).toThrowError(
      new OrderValidationError('order cannot contain more than 100 lines')
    );
  });

  it('rejects quantities above available inventory', () => {
    expect(() => validateOrderDraft(draft([{ productId: 'p1', quantity: 11 }]), inventory))
      .toThrowError(new OrderValidationError('insufficient stock'));
  });
});
