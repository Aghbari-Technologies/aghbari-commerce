import { describe, expect, it } from 'vitest';
import { validateInventoryTransferInput, validateStockThresholdInput } from './inventory';

const warehouseA = '11111111-1111-4111-8111-111111111111';
const warehouseB = '22222222-2222-4222-8222-222222222222';
const productA = '33333333-3333-4333-8333-333333333333';
const productB = '44444444-4444-4444-8444-444444444444';
const key = 'inventory-idempotency-001';

describe('inventory input boundaries', () => {
  it('accepts a valid transfer', () => expect(() => validateInventoryTransferInput(warehouseA, warehouseB, key, [{ productId: productA, quantity: 2 }])).not.toThrow());
  it('rejects invalid warehouse ids', () => expect(() => validateInventoryTransferInput('bad', warehouseB, key, [{ productId: productA, quantity: 2 }])).toThrow());
  it('rejects same source and destination', () => expect(() => validateInventoryTransferInput(warehouseA, warehouseA, key, [{ productId: productA, quantity: 2 }])).toThrow());
  it('rejects weak idempotency keys', () => expect(() => validateInventoryTransferInput(warehouseA, warehouseB, 'short', [{ productId: productA, quantity: 2 }])).toThrow());
  it('rejects duplicate products', () => expect(() => validateInventoryTransferInput(warehouseA, warehouseB, key, [{ productId: productA, quantity: 1 }, { productId: productA, quantity: 2 }])).toThrow());
  it('rejects non-positive quantities', () => expect(() => validateInventoryTransferInput(warehouseA, warehouseB, key, [{ productId: productA, quantity: 0 }])).toThrow());
  it('accepts ordered distinct products', () => expect(() => validateInventoryTransferInput(warehouseA, warehouseB, key, [{ productId: productA, quantity: 1 }, { productId: productB, quantity: 3 }])).not.toThrow());

  it('accepts valid thresholds', () => expect(() => validateStockThresholdInput(warehouseA, productA, 2, 5, 10)).not.toThrow());
  it('rejects negative thresholds', () => expect(() => validateStockThresholdInput(warehouseA, productA, -1, 5, 10)).toThrow());
  it('rejects max below min', () => expect(() => validateStockThresholdInput(warehouseA, productA, 10, 5, 9)).toThrow());
  it('rejects invalid product id and non-positive reorder quantity', () => {
    expect(() => validateStockThresholdInput(warehouseA, 'bad', 1, 5, null)).toThrow();
    expect(() => validateStockThresholdInput(warehouseA, productA, 1, 0, null)).toThrow();
  });
});

  it('rejects fractional transfer quantities instead of relying on RPC casting', () => {
    expect(() => validateInventoryTransferInput(warehouseA, warehouseB, key, [{ productId: productA, quantity: 1.5 }])).toThrow();
  });
  it('rejects more than the database-supported 100 transfer lines', () => {
    const ids = [
      '55555555-5555-4555-8555-555555555555','66666666-6666-4666-8666-666666666666','77777777-7777-4777-8777-777777777777','88888888-8888-4888-8888-888888888888'
    ];
    const lines = Array.from({ length: 101 }, (_, index) => ({ productId: ids[index % ids.length], quantity: 1 }));
    expect(() => validateInventoryTransferInput(warehouseA, warehouseB, key, lines)).toThrow();
  });
  it('rejects fractional stock count and threshold quantities', () => {
    expect(() => validateStockThresholdInput(warehouseA, productA, 1.5, 2, null)).toThrow();
    expect(() => validateStockThresholdInput(warehouseA, productA, 1, 2.5, null)).toThrow();
  });
