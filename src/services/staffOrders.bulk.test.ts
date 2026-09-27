import { describe, expect, it } from 'vitest';
import { MAX_BULK_ORDER_TRANSITIONS, validateBulkOrderTransitionInput } from './staffOrders';

const ORDER_A = '11111111-1111-4111-8111-111111111111';
const ORDER_B = '22222222-2222-4222-8222-222222222222';

describe('bulk order transition input contract', () => {
  it('accepts bounded unique order ids and a valid status', () => {
    expect(validateBulkOrderTransitionInput([ORDER_A, ORDER_B], 'confirmed')).toEqual([ORDER_A, ORDER_B]);
  });

  it('rejects empty, oversized, malformed and duplicate selections', () => {
    expect(() => validateBulkOrderTransitionInput([], 'confirmed')).toThrow();
    expect(() => validateBulkOrderTransitionInput(Array.from({ length: MAX_BULK_ORDER_TRANSITIONS + 1 }, () => ORDER_A), 'confirmed')).toThrow();
    expect(() => validateBulkOrderTransitionInput(['bad'], 'confirmed')).toThrow();
    expect(() => validateBulkOrderTransitionInput([ORDER_A, ORDER_A], 'confirmed')).toThrow();
    expect(() => validateBulkOrderTransitionInput([ORDER_A], 'not-a-status' as never)).toThrow();
  });

  it('normalizes surrounding whitespace without changing the request identity', () => {
    expect(validateBulkOrderTransitionInput(['  '+ORDER_A+'  '], 'confirmed')).toEqual([ORDER_A]);
  });
});
