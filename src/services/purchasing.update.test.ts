import { describe, expect, it } from 'vitest';
import { validatePurchaseOrderInput, validateReceiveInput } from './purchasing';

describe('purchasing validation contracts', () => {
  it('rejects malformed purchase and receive identifiers before network access', () => {
    expect(() => validatePurchaseOrderInput({
      supplierId: 'bad',
      warehouseId: 'bad',
      idempotencyKey: '0123456789abcdef',
      lines: [{ productId: 'bad', quantity: 1, unitCost: 1 }],
    })).toThrow('المورد غير صالح.');

    expect(() => validateReceiveInput({
      purchaseOrderId: 'bad',
      idempotencyKey: '0123456789abcdef',
      lines: [{ purchaseOrderItemId: 'bad', productId: 'bad', quantity: 1 }],
    })).toThrow('أمر الشراء غير صالح.');
  });

  it('keeps purchase and receipt boundaries strict', () => {
    const uuid = '00000000-0000-4000-8000-000000000001';

    expect(() => validatePurchaseOrderInput({
      supplierId: uuid,
      warehouseId: uuid,
      idempotencyKey: 'short',
      lines: [{ productId: uuid, quantity: 1, unitCost: 1 }],
    })).toThrow('بين 16 و128');

    expect(() => validateReceiveInput({
      purchaseOrderId: uuid,
      idempotencyKey: '0123456789abcdef',
      lines: Array.from({ length: 101 }, () => ({
        purchaseOrderItemId: uuid,
        productId: uuid,
        quantity: 1,
      })),
    })).toThrow('1 إلى 100');
  });
});
