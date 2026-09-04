import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateFefo, availableQuantity, validateMovement } from './inventory.js';

test('available quantity never becomes greater than on-hand or negative', () => {
  assert.equal(availableQuantity(10, 3), 7);
  assert.throws(() => availableQuantity(2, 3), /reservedQuantity/);
  assert.throws(() => availableQuantity(-1, 0), /quantity/);
});

test('inventory movements require a non-zero delta and operation id', () => {
  validateMovement(-5, 'operation-1');
  assert.throws(() => validateMovement(0, 'operation-1'), /quantityDelta/);
  assert.throws(() => validateMovement(1, ''), /operationId/);
});

test('FEFO allocates earliest non-expired lots first', () => {
  const allocations = allocateFefo(
    [
      { lotId: 'LOT-B', productId: 'P', warehouseId: 'W', quantity: 10, expiresAt: '2026-12-01T00:00:00Z' },
      { lotId: 'LOT-EXPIRED', productId: 'P', warehouseId: 'W', quantity: 20, expiresAt: '2026-01-01T00:00:00Z' },
      { lotId: 'LOT-A', productId: 'P', warehouseId: 'W', quantity: 4, expiresAt: '2026-10-01T00:00:00Z' },
    ],
    12,
    '2026-09-05T00:00:00Z',
  );

  assert.deepEqual(allocations, [
    { lotId: 'LOT-A', quantity: 4 },
    { lotId: 'LOT-B', quantity: 8 },
  ]);
});

test('FEFO refuses an allocation that cannot be satisfied by eligible stock', () => {
  assert.throws(
    () => allocateFefo(
      [{ lotId: 'LOT-1', productId: 'P', warehouseId: 'W', quantity: 3, expiresAt: '2026-10-01T00:00:00Z' }],
      4,
      '2026-09-05T00:00:00Z',
    ),
    /INSUFFICIENT_FEFO_STOCK/,
  );
});
