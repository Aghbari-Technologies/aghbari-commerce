import { describe, expect, it } from 'vitest';
import { validateQuickOrderInput } from './quickOrder';

const warehouseId = '123e4567-e89b-12d3-a456-426614174000';
const productId = '223e4567-e89b-12d3-a456-426614174000';

describe('quick-order input contract', () => {
  it('normalizes valid identifiers and preserves bounded quantities', () => {
    expect(validateQuickOrderInput({
      idempotencyKey: '  1234567890abcdef  ',
      warehouseId: `  ${warehouseId}  `,
      lines: [{ productId: `  ${productId}  `, quantity: 12 }]
    })).toEqual({
      idempotencyKey: '1234567890abcdef',
      warehouseId,
      lines: [{ productId, quantity: 12 }]
    });
  });

  it('accepts the canonical maximum idempotency key length', () => {
    expect(() => validateQuickOrderInput({
      idempotencyKey: 'x'.repeat(128),
      warehouseId,
      lines: [{ productId, quantity: 1 }]
    })).not.toThrow();
  });

  it('accepts the canonical maximum quantity', () => {
    expect(() => validateQuickOrderInput({
      idempotencyKey: '1234567890abcdef',
      warehouseId,
      lines: [{ productId, quantity: 10_000 }]
    })).not.toThrow();
  });

  it('rejects a quantity above the canonical maximum', () => {
    expect(() => validateQuickOrderInput({
      idempotencyKey: '1234567890abcdef',
      warehouseId,
      lines: [{ productId, quantity: 10_001 }]
    })).toThrow();
  });

  it('rejects an idempotency key beyond the canonical maximum', () => {
    expect(() => validateQuickOrderInput({
      idempotencyKey: 'x'.repeat(129),
      warehouseId,
      lines: [{ productId, quantity: 1 }]
    })).toThrow();
  });

  it.each([
    { name: 'short idempotency key', input: { idempotencyKey: 'short', warehouseId, lines: [{ productId, quantity: 1 }] } },
    { name: 'invalid warehouse id', input: { idempotencyKey: '1234567890abcdef', warehouseId: 'not-a-uuid', lines: [{ productId, quantity: 1 }] } },
    { name: 'empty lines', input: { idempotencyKey: '1234567890abcdef', warehouseId, lines: [] } },
    { name: 'invalid product id', input: { idempotencyKey: '1234567890abcdef', warehouseId, lines: [{ productId: 'bad', quantity: 1 }] } },
    { name: 'zero quantity', input: { idempotencyKey: '1234567890abcdef', warehouseId, lines: [{ productId, quantity: 0 }] } },
    { name: 'fractional quantity', input: { idempotencyKey: '1234567890abcdef', warehouseId, lines: [{ productId, quantity: 1.5 }] } },
    
    { name: 'duplicate product', input: { idempotencyKey: '1234567890abcdef', warehouseId, lines: [{ productId, quantity: 1 }, { productId, quantity: 2 }] } }
  ])('rejects $name', ({ input }) => {
    expect(() => validateQuickOrderInput(input)).toThrow();
  });
});
