import { describe, expect, it } from 'vitest';
import { assertStaffOrderDetailItem, assertStaffOrderSummary, getStaffOrderDetail } from './staffOrders';

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';
const UUID_C = '33333333-3333-4333-8333-333333333333';

describe('staff order detail contract', () => {
  it('rejects malformed order identifiers before any network call', async () => {
    await expect(getStaffOrderDetail('invalid-id')).rejects.toThrow('معرّف الطلب غير صالح.');
  });
  it('rejects inconsistent line totals', () => {
    expect(() => assertStaffOrderDetailItem({ id: UUID_A, product_id: UUID_B, sku: 'SKU-1', name: 'منتج', unit: 'كرتون', quantity: 2, unit_price: 10, line_total: 19, pricing_tier: 'wholesale' })).toThrow('بيانات بند الطلب غير صالحة.');
  });
  it('accepts a valid order line and operational summary', () => {
    expect(() => assertStaffOrderDetailItem({ id: UUID_A, product_id: UUID_B, sku: 'SKU-1', name: 'منتج', unit: 'كرتون', quantity: 2, unit_price: 10, line_total: 20, pricing_tier: 'wholesale' })).not.toThrow();
    expect(() => assertStaffOrderSummary({ id: UUID_A, order_number: 1, customer_id: UUID_B, customer_name: 'عميل', warehouse_id: UUID_C, status: 'pending', total: 100, currency: 'YER', created_at: '2026-09-27T00:00:00Z', updated_at: '2026-09-27T00:00:00Z' })).not.toThrow();
  });
});
