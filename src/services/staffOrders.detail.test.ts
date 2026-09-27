import { describe, expect, it } from 'vitest';
import { assertStaffOrderSummary, getStaffOrderDetail } from './staffOrders';

describe('staff order detail contract', () => {
  it('rejects malformed order identifiers before any network call', async () => {
    await expect(getStaffOrderDetail('invalid-id')).rejects.toThrow('معرّف الطلب غير صالح.');
  });

  it('accepts a valid operational order summary', () => {
    expect(() => assertStaffOrderSummary({
      id: '11111111-1111-4111-8111-111111111111',
      order_number: 1,
      customer_id: '22222222-2222-4222-8222-222222222222',
      customer_name: 'عميل',
      warehouse_id: '33333333-3333-4333-8333-333333333333',
      status: 'pending',
      total: 100,
      currency: 'YER',
      created_at: '2026-09-27T00:00:00Z',
      updated_at: '2026-09-27T00:00:00Z'
    })).not.toThrow();
  });
});
