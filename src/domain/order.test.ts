import { describe, expect, it } from 'vitest';
import { MAX_ORDER_LINES, MAX_ORDER_QUANTITY_PER_LINE, OrderValidationError, validateOrderDraft } from './order';

const product = (id: string, quantity = 10) => [id, quantity] as const;

function draft(lines: Array<{ productId: string; quantity: number }>) {
  return { idempotencyKey: '0123456789abcdef', lines };
}

describe('validateOrderDraft', () => {
  it('accepts a bounded multi-line order with sufficient stock', () => {
    const [first, second] = [product('product-1', 5), product('product-2', 8)];
    validateOrderDraft(draft([{ productId: first[0], quantity: first[1] }, { productId: second[0], quantity: second[1] }]), new Map([first, second]));
  });

  it('rejects duplicate product lines', () => {
    expect(() => validateOrderDraft(draft([{ productId: 'product-1', quantity: 1 }, { productId: 'product-1', quantity: 2 }]), new Map([product('product-1')]))).toThrow(OrderValidationError);
  });

  it('does not require client-supplied customer identity', () => {
    const order = draft([{ productId: 'product-1', quantity: 1 }]);
    expect(order).not.toHaveProperty('customerId');
    validateOrderDraft(order, new Map([product('product-1')]));
  });

  it('rejects blank product and idempotency fields at the client boundary', () => {
    expect(() => validateOrderDraft(draft([{ productId: '   ', quantity: 1 }]), new Map([product('product-1')]))).toThrow(/productId/);
    expect(() => validateOrderDraft({ ...draft([{ productId: 'product-1', quantity: 1 }]), idempotencyKey: '                ' }, new Map([product('product-1')]))).toThrow(/idempotencyKey/);
  });

  it('rejects quantities above the domain limit', () => {
    expect(() => validateOrderDraft(draft([{ productId: 'product-1', quantity: MAX_ORDER_QUANTITY_PER_LINE + 1 }]), new Map([product('product-1', MAX_ORDER_QUANTITY_PER_LINE + 1)]))).toThrow(/cannot exceed/);
  });

  it('rejects more than the maximum number of lines', () => {
    const lines = Array.from({ length: MAX_ORDER_LINES + 1 }, (_, index) => ({ productId: `product-${index}`, quantity: 1 }));
    const inventory = new Map(lines.map((line) => [line.productId, 1] as const));
    expect(() => validateOrderDraft(draft(lines), inventory)).toThrow(/more than/);
  });

  it('rejects a quantity greater than available stock', () => {
    expect(() => validateOrderDraft(draft([{ productId: 'product-1', quantity: 11 }]), new Map([product('product-1', 10)]))).toThrow(/insufficient stock/);
  });

  it('rejects invalid negative inventory instead of treating it as usable stock', () => {
    expect(() => validateOrderDraft(draft([{ productId: 'product-1', quantity: 1 }]), new Map([product('product-1', -1)]))).toThrow(/invalid inventory/);
  });
});
