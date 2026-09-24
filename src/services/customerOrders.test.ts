import { describe, expect, it } from 'vitest';
import { assertCustomerOrderSummary, buildCustomerOrderTimeline } from './customerOrders';

describe('customer order runtime contracts', () => {
  const valid = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    order_number: 42,
    status: 'confirmed',
    total: 1250,
    currency: 'YER',
    created_at: '2026-09-25T00:00:00+03:00'
  };

  it('accepts a valid order summary', () => {
    expect(assertCustomerOrderSummary(valid)).toMatchObject(valid);
  });

  it.each([
    { ...valid, id: 'not-a-uuid' },
    { ...valid, order_number: 0 },
    { ...valid, order_number: 1.2 },
    { ...valid, status: 'unknown' },
    { ...valid, total: -1 },
    { ...valid, total: Number.POSITIVE_INFINITY },
    { ...valid, currency: 'YER1' },
    { ...valid, created_at: 'not-a-date' }
  ])('rejects an untrustworthy order summary: %j', (value) => {
    expect(() => assertCustomerOrderSummary(value)).toThrow();
  });
});

describe('customer order timeline', () => {
  it('does not mark pending as reached for a draft order with no history', () => {
    const timeline = buildCustomerOrderTimeline('draft', []);
    expect(timeline.map((step) => step.active)).toEqual([false, false, false, false, false]);
  });

  it('marks the current completed flow as reached', () => {
    const timeline = buildCustomerOrderTimeline('completed', [
      { from_status: 'pending', to_status: 'confirmed', created_at: '2026-09-25T00:01:00Z' },
      { from_status: 'confirmed', to_status: 'preparing', created_at: '2026-09-25T00:02:00Z' },
      { from_status: 'preparing', to_status: 'ready', created_at: '2026-09-25T00:03:00Z' },
      { from_status: 'ready', to_status: 'completed', created_at: '2026-09-25T00:04:00Z' }
    ]);
    expect(timeline.map((step) => step.active)).toEqual([true, true, true, true, true]);
  });

  it('keeps cancelled orders from claiming future operational stages', () => {
    const timeline = buildCustomerOrderTimeline('cancelled', [
      { from_status: 'pending', to_status: 'confirmed', created_at: '2026-09-25T00:01:00Z' }
    ]);
    expect(timeline.find((step) => step.status === 'pending')?.active).toBe(true);
    expect(timeline.find((step) => step.status === 'confirmed')?.active).toBe(true);
    expect(timeline.find((step) => step.status === 'preparing')?.active).toBe(false);
    expect(timeline.find((step) => step.status === 'ready')?.active).toBe(false);
    expect(timeline.find((step) => step.status === 'completed')?.active).toBe(false);
  });
});
