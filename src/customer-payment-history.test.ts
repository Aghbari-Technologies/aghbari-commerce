import { describe, expect, it } from 'vitest';
import { buildCustomerPaymentHistory, type CustomerInvoiceSummary, type CustomerPayment } from './services/customerFinance';

const makeInvoice = (id: string, number: number): CustomerInvoiceSummary => ({
  id, order_id: '00000000-0000-4000-8000-000000000001', invoice_number: number, status: 'issued',
  currency: 'YER', subtotal: 100, total: 100, due_at: null,
  created_at: '2026-09-28T00:00:00.000Z', updated_at: '2026-09-28T00:00:00.000Z',
});
const makePayment = (id: string, invoiceId: string): CustomerPayment => ({
  id, invoice_id: invoiceId, amount: 25, method: 'cash', reference: 'REF-1', paid_at: '2026-09-28T01:00:00.000Z',
});

describe('customer payment history aggregation', () => {
  it('joins only payments belonging to the authorized invoice set', () => {
    const one = makeInvoice('00000000-0000-4000-8000-000000000010', 10);
    const two = makeInvoice('00000000-0000-4000-8000-000000000011', 11);
    const inside = makePayment('00000000-0000-4000-8000-000000000012', one.id);
    const foreign = makePayment('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000099');
    const rows = buildCustomerPaymentHistory([one, two], [inside, foreign]);
    expect(rows).toHaveLength(1);
    expect(rows[0].invoice.id).toBe(one.id);
    expect(rows[0].payment.id).toBe(inside.id);
  });
  it('preserves currency and payment identity for display', () => {
    const one = makeInvoice('00000000-0000-4000-8000-000000000020', 20);
    const inside = makePayment('00000000-0000-4000-8000-000000000021', one.id);
    const row = buildCustomerPaymentHistory([one], [inside])[0];
    expect(row.invoice.currency).toBe('YER');
    expect(row.payment.reference).toBe('REF-1');
    expect(row.payment.amount).toBe(25);
  });
});
