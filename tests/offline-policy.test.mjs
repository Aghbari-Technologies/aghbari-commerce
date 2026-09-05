import test from 'node:test';
import assert from 'node:assert/strict';

function canQueueOffline(kind) { return kind === 'cart-draft' || kind === 'order-submit'; }

test('offline policy never grants authority to inventory or pricing mutations', () => {
  assert.equal(canQueueOffline('cart-draft'), true);
  assert.equal(canQueueOffline('order-submit'), true);
  assert.equal(canQueueOffline('inventory-commit'), false);
  assert.equal(canQueueOffline('price-change'), false);
  assert.equal(canQueueOffline('role-change'), false);
});
