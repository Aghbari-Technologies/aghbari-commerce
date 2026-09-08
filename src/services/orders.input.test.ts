import { describe, expect, it } from 'vitest';
import { assertOrderTransitionInput, assertCreatedOrderReference, createOrder } from './orders';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

// Input-boundary tests intentionally exercise the pure validation before any RPC call.
describe('order input boundaries', () => {
  it('normalizes valid transition input', () => {
    expect(assertOrderTransitionInput(`  ${UUID}  `, ' confirmed ')).toEqual({ orderId: UUID, status: 'confirmed' });
  });

  it('rejects malformed transition identifiers and statuses', () => {
    expect(() => assertOrderTransitionInput('not-a-uuid', 'confirmed')).toThrow();
    expect(() => assertOrderTransitionInput(UUID, 'unknown')).toThrow();
  });

  it('rejects duplicate products and invalid quantities before checkout RPC', async () => {
    const draft = {
      idempotencyKey: 'checkout-1',
      lines: [
        { productId: UUID, quantity: 1 },
        { productId: UUID, quantity: 2 },
      ],
    };
    await expect(createOrder(draft, UUID)).rejects.toThrow('لا يمكن تكرار المنتج');
  });

  it('rejects empty, oversized, and malformed checkout inputs before network use', async () => {
    await expect(createOrder({ idempotencyKey: '   ', lines: [{ productId: UUID, quantity: 1 }] }, UUID)).rejects.toThrow();
    await expect(createOrder({ idempotencyKey: 'x'.repeat(129), lines: [{ productId: UUID, quantity: 1 }] }, UUID)).rejects.toThrow();
    await expect(createOrder({ idempotencyKey: 'checkout-2', lines: [{ productId: 'bad', quantity: 1 }] }, UUID)).rejects.toThrow();
    await expect(createOrder({ idempotencyKey: 'checkout-3', lines: [{ productId: UUID, quantity: 0 }] }, UUID)).rejects.toThrow();
  });

  it('keeps the false-success guard strict', () => {
    expect(() => assertCreatedOrderReference(undefined)).toThrow();
    expect(() => assertCreatedOrderReference({ id: UUID, order_number: 0 })).toThrow();
    expect(assertCreatedOrderReference({ id: UUID, order_number: 123 })).toEqual({ id: UUID, order_number: 123 });
  });
});
