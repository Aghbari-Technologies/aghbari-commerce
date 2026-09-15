import { describe, expect, it } from 'vitest';
import { MAX_ORDER_QUANTITY_PER_LINE } from '../domain/order';
import { assertCreatedOrderReference, assertOrderRequestInput, assertOrderTransitionInput } from './orders';

const VALID_PRODUCT_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_WAREHOUSE_ID = '223e4567-e89b-12d3-a456-426614174000';
const VALID_KEY = 'checkout-key-123456';

function validRequest(quantity = 1) {
  return {
    idempotencyKey: VALID_KEY,
    lines: [{ productId: VALID_PRODUCT_ID, quantity }]
  };
}

describe('create-order response contract', () => {
  it('accepts a valid persisted order reference', () => {
    expect(
      assertCreatedOrderReference({
        id: VALID_PRODUCT_ID,
        order_number: 42
      })
    ).toEqual({
      id: VALID_PRODUCT_ID,
      order_number: 42
    });
  });

  it.each([
    null,
    undefined,
    {},
    { id: 'not-a-uuid', order_number: 42 },
    { id: VALID_PRODUCT_ID, order_number: 0 },
    { id: VALID_PRODUCT_ID, order_number: 1.5 },
    { id: VALID_PRODUCT_ID, order_number: Number.MAX_SAFE_INTEGER + 1 }
  ])('rejects an untrustworthy response: %j', (value) => {
    expect(() => assertCreatedOrderReference(value)).toThrow(/استجابة إنشاء الطلب/);
  });
});

describe('create-order request contract', () => {
  it('accepts the canonical boundary values', () => {
    expect(assertOrderRequestInput(validRequest(MAX_ORDER_QUANTITY_PER_LINE), VALID_WAREHOUSE_ID)).toEqual({
      warehouseId: VALID_WAREHOUSE_ID,
      idempotencyKey: VALID_KEY,
      lines: [{ productId: VALID_PRODUCT_ID, quantity: MAX_ORDER_QUANTITY_PER_LINE }]
    });
  });

  it.each([
    [MAX_ORDER_QUANTITY_PER_LINE + 1, 'quantity'],
    [0, 'quantity'],
    [-1, 'quantity'],
    [1.5, 'quantity']
  ])('rejects invalid quantity boundary: %j', (quantity) => {
    expect(() => assertOrderRequestInput(validRequest(quantity), VALID_WAREHOUSE_ID)).toThrow(/كمية الطلب/);
  });

  it('rejects an idempotency key shorter than the domain minimum', () => {
    expect(() => assertOrderRequestInput({ ...validRequest(), idempotencyKey: 'short' }, VALID_WAREHOUSE_ID)).toThrow(/مفتاح العملية/);
  });

  it('rejects duplicate product lines before invoking the backend', () => {
    expect(() => assertOrderRequestInput({
      ...validRequest(),
      lines: [
        { productId: VALID_PRODUCT_ID, quantity: 1 },
        { productId: VALID_PRODUCT_ID, quantity: 2 }
      ]
    }, VALID_WAREHOUSE_ID)).toThrow(/تكرار المنتج/);
  });
});

describe('order-transition input contract', () => {
  it('normalizes and accepts a canonical transition', () => {
    expect(assertOrderTransitionInput(`  ${VALID_PRODUCT_ID}  `, ' cancelled ')).toEqual({
      orderId: VALID_PRODUCT_ID,
      status: 'cancelled'
    });
  });

  it.each([
    ['', 'cancelled'],
    ['not-a-uuid', 'cancelled'],
    [VALID_PRODUCT_ID, ''],
    [VALID_PRODUCT_ID, 'not-a-status']
  ])('rejects unsafe transition input: %j', (orderId, status) => {
    expect(() => assertOrderTransitionInput(orderId, status)).toThrow(/(معرّف الطلب|حالة الطلب)/);
  });
});
