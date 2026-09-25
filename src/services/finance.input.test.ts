import { describe, expect, it } from 'vitest';
import { assertOperationalInvoiceDetail, validateCashAccountInput, validateExpenseInput, validatePaymentInput } from './finance';

const branch = '11111111-1111-4111-8111-111111111111';
const cash = '22222222-2222-4222-8222-222222222222';
const invoice = '33333333-3333-4333-8333-333333333333';

describe('finance input boundaries', () => {
  it('accepts a valid cash account', () => expect(() => validateCashAccountInput(branch, 'الخزينة الرئيسية', 'YER', 1000)).not.toThrow());
  it('rejects malformed branch and empty account name', () => {
    expect(() => validateCashAccountInput('bad', 'Cash', 'YER', 0)).toThrow();
    expect(() => validateCashAccountInput(branch, '   ', 'YER', 0)).toThrow();
  });
  it('rejects non-string runtime values instead of leaking TypeError', () => {
    expect(() => validateCashAccountInput(123 as unknown as string, 'Cash', 'YER', 0)).toThrow();
    expect(() => validateCashAccountInput(branch, 123 as unknown as string, 'YER', 0)).toThrow();
    expect(() => validateExpenseInput(123 as unknown as string, cash, 'تشغيل', 10, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(branch, cash, 123 as unknown as string, 10, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(branch, cash, 'تشغيل', 10, 'YER', 123 as unknown as string)).toThrow();
    expect(() => validatePaymentInput(123 as unknown as string, 100, 'cash', cash, 'ref')).toThrow();
    expect(() => validatePaymentInput(invoice, 100, 123 as unknown as string, cash, 'ref')).toThrow();
    expect(() => validatePaymentInput(invoice, 100, 'cash', cash, 123 as unknown as string)).toThrow();
  });
  it('rejects invalid currency and negative opening balance', () => {
    expect(() => validateCashAccountInput(branch, 'Cash', 'Y', 0)).toThrow();
    expect(() => validateCashAccountInput(branch, 'Cash', 'YER', -1)).toThrow();
  });
  it('rejects non-finite and unsafe opening balances', () => {
    expect(() => validateCashAccountInput(branch, 'Cash', 'YER', Infinity)).toThrow();
    expect(() => validateCashAccountInput(branch, 'Cash', 'YER', Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
  it('accepts valid payment methods including surrounding whitespace', () => {
    for (const method of ['cash', 'bank_transfer', 'card', 'other']) {
      expect(() => validatePaymentInput(invoice, 100, method, cash, 'ref-1')).not.toThrow();
    }
    expect(() => validatePaymentInput(invoice, 100, ' cash ', cash, 'ref-1')).not.toThrow();
  });
  it('rejects malformed invoice, zero amount and unsupported method', () => {
    expect(() => validatePaymentInput('bad', 100, 'cash', cash, 'ref')).toThrow();
    expect(() => validatePaymentInput(invoice, 0, 'cash', cash, 'ref')).toThrow();
    expect(() => validatePaymentInput(invoice, 100, 'crypto', cash, 'ref')).toThrow();
  });
  it('rejects non-finite and unsafe payment amounts and malformed cash account', () => {
    expect(() => validatePaymentInput(invoice, Infinity, 'cash', cash, 'ref')).toThrow();
    expect(() => validatePaymentInput(invoice, Number.MAX_SAFE_INTEGER + 1, 'cash', cash, 'ref')).toThrow();
    expect(() => validatePaymentInput(invoice, 100, 'cash', 'bad', 'ref')).toThrow();
  });
  it('rejects overlong payment references', () => expect(() => validatePaymentInput(invoice, 100, 'cash', cash, 'x'.repeat(201))).toThrow());
  it('accepts a valid expense', () => expect(() => validateExpenseInput(branch, cash, 'تشغيل', 250, 'YER', 'مصروف تشغيل')).not.toThrow());
  it('rejects malformed expense ids, empty category, invalid amount and currency', () => {
    expect(() => validateExpenseInput('bad', cash, 'تشغيل', 250, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(branch, 'bad', 'تشغيل', 250, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(branch, cash, '  ', 250, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(branch, cash, 'تشغيل', -1, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(branch, cash, 'تشغيل', 250, 'Y', '')).toThrow();
  });
  it('rejects overlong expense description', () => expect(() => validateExpenseInput(branch, cash, 'تشغيل', 250, 'YER', 'x'.repeat(2001))).toThrow());
  it('rejects unsafe expense amounts', () => expect(() => validateExpenseInput(branch, cash, 'تشغيل', Number.MAX_SAFE_INTEGER + 1, 'YER', '')).toThrow());
});


describe('operational invoice detail response contracts', () => {
  const detail = {
    id:'44444444-4444-4444-8444-444444444444',
    order_id:'55555555-5555-4555-8555-555555555555',
    customer_id:'66666666-6666-4666-8666-666666666666',
    invoice_number:17,
    status:'partially_paid',
    currency:'YER',
    subtotal:1000,
    total:1100,
    due_at:'2026-10-01T00:00:00.000Z',
    created_at:'2026-09-25T00:00:00.000Z',
    items:[{id:'77777777-7777-4777-8777-777777777777',product_id:'88888888-8888-4888-8888-888888888888',description:'أرز',quantity:2,unit_price:550,line_total:1100}],
    payments:[{id:'99999999-9999-4999-8999-999999999999',amount:400,method:'cash',reference:'R-1',paid_at:'2026-09-25T01:00:00.000Z'}],
    paid_total:400,
    balance_due:700
  };
  it('accepts a complete invoice detail',()=>expect(assertOperationalInvoiceDetail(detail)).toEqual(detail));
  it('rejects malformed item and balance data',()=>{
    expect(()=>assertOperationalInvoiceDetail({...detail,items:[{...detail.items[0],product_id:'bad'}]})).toThrow();
    expect(()=>assertOperationalInvoiceDetail({...detail,paid_total:-1})).toThrow();
    expect(()=>assertOperationalInvoiceDetail({...detail,invoice_number:1.5})).toThrow();
  });
});
