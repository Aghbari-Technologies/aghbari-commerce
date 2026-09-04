import { describe, expect, it } from 'vitest';
import { createOrder, type CreateOrderDeps } from '../src/application/create-order.js';
import { DomainError } from '../src/domain/errors.js';
import { reserveInventory, type InventoryRepository } from '../src/domain/inventory.js';
import { transitionOrderStatus } from '../src/domain/order.js';
import type { InventoryBalance, Order, ProductPrice } from '../src/domain/types.js';

const basePrice: ProductPrice = {
  productId: 'product-1',
  priceListId: 'tier-wholesale',
  unitPrice: 12.5,
  currency: 'YER',
  effectiveFrom: '2026-01-01T00:00:00Z',
};

function orderDeps(existing?: Order): CreateOrderDeps {
  let saved: Order | undefined = existing;
  let id = 0;
  return {
    orders: {
      findByIdempotencyKey: () => saved,
      insert: (order) => { saved = order; },
    },
    prices: { findEffectivePrice: () => basePrice },
    transaction: { run: (work) => work() },
    now: () => '2026-09-05T19:00:00Z',
    newId: () => `order-${++id}`,
    nextOrderNumber: () => `AGH-${1000 + id}`,
  };
}

describe('operational core invariants', () => {
  it('uses server-resolved price and ignores any client price field', () => {
    const order = createOrder(orderDeps(), {
      actorId: 'actor-1', organizationId: 'org-1', customerId: 'customer-1',
      branchId: 'branch-1', warehouseId: 'warehouse-1',
      pricingContext: {
        organizationId: 'org-1', customerId: 'customer-1',
        customerTierId: 'tier-wholesale', priceListId: 'tier-wholesale',
      },
      lines: [{ productId: 'product-1', quantity: 2 }],
      idempotencyKey: 'op-1',
    });
    expect(order.lines[0]?.unitPrice).toBe(12.5);
    expect(order.total).toBe(25);
  });

  it('replays the same canonical order for the same operation key', () => {
    const deps = orderDeps();
    const command = {
      actorId: 'actor-1', organizationId: 'org-1', customerId: 'customer-1',
      branchId: 'branch-1', warehouseId: 'warehouse-1',
      pricingContext: {
        organizationId: 'org-1', customerId: 'customer-1',
        customerTierId: 'tier-wholesale', priceListId: 'tier-wholesale',
      },
      lines: [{ productId: 'product-1', quantity: 2 }], idempotencyKey: 'op-1',
    } as const;
    const first = createOrder(deps, command);
    const second = createOrder(deps, command);
    expect(second.id).toBe(first.id);
    expect(second.orderNumber).toBe(first.orderNumber);
  });

  it('rejects an illegal order transition', () => {
    expect(() => transitionOrderStatus('pending', 'delivered')).toThrowError(DomainError);
  });

  it('prevents inventory oversell and increments the concurrency version', () => {
    let balance: InventoryBalance = {
      warehouseId: 'warehouse-1', productId: 'product-1', available: 5, reserved: 0, version: 7,
    };
    const repository: InventoryRepository = {
      getForUpdate: () => balance,
      save: (next) => { balance = next; },
    };
    const next = reserveInventory(repository, 'warehouse-1', 'product-1', 3);
    expect(next.available).toBe(2);
    expect(next.reserved).toBe(3);
    expect(next.version).toBe(8);
    expect(() => reserveInventory(repository, 'warehouse-1', 'product-1', 3)).toThrowError(DomainError);
  });
});
