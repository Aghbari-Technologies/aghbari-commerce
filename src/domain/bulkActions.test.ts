import { describe, expect, it } from 'vitest';
import { buildBulkTransitionPlan, allowedNextOrderStatuses } from './bulkActions';
import type { OrderStatus } from './types';

const orders = [
  { id: 'a', order_number: 101, status: 'pending' as OrderStatus },
  { id: 'b', order_number: 102, status: 'confirmed' as OrderStatus },
  { id: 'c', order_number: 103, status: 'ready' as OrderStatus },
];

describe('bulk order actions', () => {
  it('keeps the role boundary identical to the server workflow', () => {
    expect(allowedNextOrderStatuses('pending', 'viewer')).toEqual([]);
    expect(allowedNextOrderStatuses('pending', 'sales')).toEqual(['confirmed', 'cancelled']);
    expect(allowedNextOrderStatuses('confirmed', 'warehouse')).toEqual(['preparing', 'cancelled']);
  });

  it('previews only eligible transitions for a homogeneous selection', () => {
    const plan = buildBulkTransitionPlan(orders, ['a'], 'sales', 'confirmed');
    expect(plan.selected).toHaveLength(1);
    expect(plan.eligible.map((x) => x.order_number)).toEqual([101]);
    expect(plan.blocked).toHaveLength(0);
  });

  it('flags mixed selections that would partially fail', () => {
    const plan = buildBulkTransitionPlan(orders, ['a', 'b'], 'sales', 'confirmed');
    expect(plan.selected).toHaveLength(2);
    expect(plan.eligible.map((x) => x.order_number)).toEqual([101]);
    expect(plan.blocked.map((x) => x.order_number)).toEqual([102]);
  });

  it('never treats an empty selection as executable', () => {
    const plan = buildBulkTransitionPlan(orders, [], 'owner', 'cancelled');
    expect(plan.selected).toEqual([]);
    expect(plan.eligible).toEqual([]);
    expect(plan.blocked).toEqual([]);
  });
});
