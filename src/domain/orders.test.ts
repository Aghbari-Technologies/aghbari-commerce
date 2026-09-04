import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateOrderTotal, resolveAuthorizedPrice } from './pricing.js';
import {
  assertValidOrderCommand,
  canTransition,
  transitionOrder,
  type Order,
} from './orders.js';

test('order command rejects duplicate product lines', () => {
  assert.throws(
    () =>
      assertValidOrderCommand({
        operationId: 'op-1',
        customerId: 'customer-1',
        organizationId: 'org-1',
        branchId: 'branch-1',
        warehouseId: 'warehouse-1',
        lines: [
          { productId: 'product-1', quantity: 1 },
          { productId: 'product-1', quantity: 2 },
        ],
      }),
    /CONFLICT:DUPLICATE_PRODUCT/,
  );
});

test('server-authoritative pricing selects only the authorized tier and effective period', () => {
  const price = resolveAuthorizedPrice(
    'product-1',
    { customerId: 'customer-1', tierId: 'tier-wholesale', at: '2026-09-05T00:00:00Z' },
    [
      { productId: 'product-1', priceListId: 'tier-retail', unitPrice: 20, effectiveFrom: '2026-01-01T00:00:00Z', active: true },
      { productId: 'product-1', priceListId: 'tier-wholesale', unitPrice: 15, effectiveFrom: '2026-01-01T00:00:00Z', active: true },
      { productId: 'product-1', priceListId: 'tier-wholesale', unitPrice: 12, effectiveFrom: '2026-10-01T00:00:00Z', active: true },
    ],
  );

  assert.equal(price.unitPrice, 15);
  assert.equal(price.priceListId, 'tier-wholesale');
});

test('client-provided totals cannot become canonical totals', () => {
  const lines = [{ quantity: 3, unitPrice: 15 }];
  assert.equal(calculateOrderTotal(lines), 45);
  assert.notEqual(999, calculateOrderTotal(lines));
});

function order(status: Order['status']): Order {
  return {
    id: 'order-1',
    orderNumber: 'AGH-000001',
    operationId: 'op-1',
    customerId: 'customer-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    warehouseId: 'warehouse-1',
    lines: [{ productId: 'product-1', quantity: 1, unitPrice: 15 }],
    subtotal: 15,
    total: 15,
    status,
    version: 1,
    createdAt: '2026-09-05T00:00:00Z',
  };
}

test('order state machine rejects unauthorized or skipped transitions', () => {
  assert.equal(canTransition('NEW', 'CONFIRMED', 'sales_employee'), true);
  assert.equal(canTransition('NEW', 'DELIVERED', 'sales_employee'), false);
  assert.equal(canTransition('CONFIRMED', 'DELIVERED', 'sales_employee'), false);
  assert.equal(canTransition('DELIVERED', 'CANCELLED', 'system_admin'), false);
});

test('valid transition increments version and changes only the workflow state', () => {
  const before = order('NEW');
  const after = transitionOrder(before, 'CONFIRMED', 'sales_employee');

  assert.equal(after.status, 'CONFIRMED');
  assert.equal(after.version, 2);
  assert.equal(after.total, before.total);
  assert.equal(after.operationId, before.operationId);
  assert.equal(before.status, 'NEW');
});

test('cancelled and delivered orders are terminal', () => {
  assert.throws(() => transitionOrder(order('CANCELLED'), 'CONFIRMED', 'sales_manager'), /FORBIDDEN_OR_INVALID_TRANSITION/);
  assert.throws(() => transitionOrder(order('DELIVERED'), 'CANCELLED', 'system_admin'), /FORBIDDEN_OR_INVALID_TRANSITION/);
});
