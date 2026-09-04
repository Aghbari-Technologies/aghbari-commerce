import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Technology proof harness — domain-level transaction invariants only.
 * This is NOT a PostgreSQL/runtime PASS. It proves deterministic business
 * invariants before the database-backed G1 implementation is introduced.
 */

function createOrder(state, { operationId, customerId, productId, quantity, unitPrice }) {
  if (state.idempotency.has(operationId)) {
    return state.idempotency.get(operationId);
  }
  if (quantity <= 0) throw new Error('VALIDATION_FAILED');
  const product = state.products.get(productId);
  if (!product) throw new Error('NOT_FOUND');
  if (product.stock < quantity) throw new Error('INVENTORY_CHANGED');
  if (product.authorizedPrice !== unitPrice) throw new Error('PRICE_CHANGED');

  const order = {
    orderId: `ORD-${state.nextOrder++}`,
    customerId,
    productId,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
  };

  // The mutation is committed as one logical transaction in this harness.
  product.stock -= quantity;
  state.orders.push(order);
  state.idempotency.set(operationId, order);
  return order;
}

function freshState() {
  return {
    nextOrder: 1,
    products: new Map([['SKU-1', { stock: 10, authorizedPrice: 25 }]]),
    orders: [],
    idempotency: new Map(),
  };
}

test('G1: authorized price is server-authoritative', () => {
  const state = freshState();
  assert.throws(
    () => createOrder(state, {
      operationId: 'op-price', customerId: 'c1', productId: 'SKU-1', quantity: 1, unitPrice: 1,
    }),
    /PRICE_CHANGED/,
  );
  assert.equal(state.orders.length, 0);
  assert.equal(state.products.get('SKU-1').stock, 10);
});

test('G1: inventory failure leaves no partial order mutation', () => {
  const state = freshState();
  assert.throws(
    () => createOrder(state, {
      operationId: 'op-stock', customerId: 'c1', productId: 'SKU-1', quantity: 11, unitPrice: 25,
    }),
    /INVENTORY_CHANGED/,
  );
  assert.equal(state.orders.length, 0);
  assert.equal(state.products.get('SKU-1').stock, 10);
});

test('G1: repeated operation_id returns the original result exactly once', () => {
  const state = freshState();
  const input = { operationId: 'op-idempotent', customerId: 'c1', productId: 'SKU-1', quantity: 2, unitPrice: 25 };
  const first = createOrder(state, input);
  const replay = createOrder(state, input);

  assert.deepEqual(replay, first);
  assert.equal(state.orders.length, 1);
  assert.equal(state.products.get('SKU-1').stock, 8);
});

test('G1: committed order total is server-calculated', () => {
  const state = freshState();
  const order = createOrder(state, {
    operationId: 'op-total', customerId: 'c1', productId: 'SKU-1', quantity: 3, unitPrice: 25,
  });
  assert.equal(order.total, 75);
});
