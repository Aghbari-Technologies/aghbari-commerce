import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCartQuantity, removeCartItem, upsertCartItem, validateCartScope } from './cart.js';

test('cart scope requires all trusted identifiers', () => {
  validateCartScope({ organizationId: 'org', customerId: 'customer', branchId: 'branch', warehouseId: 'warehouse' });
  assert.throws(
    () => validateCartScope({ organizationId: '', customerId: 'customer', branchId: 'branch', warehouseId: 'warehouse' }),
    /organizationId/,
  );
});

test('cart upsert replaces an existing product instead of creating duplicate lines', () => {
  const first = upsertCartItem([], 'P-2', 3);
  const second = upsertCartItem(first, 'P-1', 2);
  const replaced = upsertCartItem(second, 'P-2', 7);
  assert.deepEqual(replaced, [
    { productId: 'P-1', quantity: 2 },
    { productId: 'P-2', quantity: 7 },
  ]);
  assert.equal(calculateCartQuantity(replaced), 9);
});

test('cart rejects zero/negative/non-integer quantities and removes cleanly', () => {
  assert.throws(() => upsertCartItem([], 'P', 0), /quantity/);
  assert.throws(() => upsertCartItem([], 'P', -1), /quantity/);
  assert.throws(() => upsertCartItem([], 'P', 1.5), /quantity/);
  assert.deepEqual(removeCartItem([{ productId: 'P', quantity: 2 }], 'P'), []);
});
