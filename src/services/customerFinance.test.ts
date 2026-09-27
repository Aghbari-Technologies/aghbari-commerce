import { describe, expect, it } from 'vitest';
import { calculateInvoicePaid } from './customerFinance';

describe('customer finance calculations', () => {
  it('totals recorded payments exactly', () => {
    expect(calculateInvoicePaid([
      { id: '11111111-1111-4111-8111-111111111111', invoice_id: '22222222-2222-4222-8222-222222222222', amount: 100, method: 'cash', reference: null, paid_at: '2026-01-01T00:00:00Z' },
      { id: '33333333-3333-4333-8333-333333333333', invoice_id: '22222222-2222-4222-8222-222222222222', amount: 25.5, method: 'card', reference: 'A-1', paid_at: '2026-01-02T00:00:00Z' }
    ])).toBe(125.5);
  });
});
