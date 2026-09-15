import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateCashAccountInput, validateExpenseInput, validatePaymentInput } from './finance';

const UUID = '67676767-6767-4676-8676-676767676767';

describe('finance client contracts', () => {
  it('uses the operational invoice schema rather than the retired sales_invoices surface', () => {
    const source = readFileSync(new URL('./finance.ts', import.meta.url), 'utf8');
    expect(source).toContain("from('operational_invoices')");
    expect(source).not.toContain("from('sales_invoices')");
    expect(source).toContain("due_at");
    expect(source).not.toContain("paid_amount,due_date");
  });

  it('rejects invalid payment amounts and invoice identifiers', () => {
    expect(() => validatePaymentInput(UUID, 0, 'cash', UUID, '')).toThrow();
    expect(() => validatePaymentInput('bad', 1, 'cash', UUID, '')).toThrow();
    expect(() => validatePaymentInput(UUID, Number.NaN, 'cash', UUID, '')).toThrow();
    expect(() => validatePaymentInput(UUID, 1, 'forged', UUID, '')).toThrow();
  });

  it('rejects invalid expense and cash-account boundaries', () => {
    expect(() => validateExpenseInput(UUID, UUID, '', 1, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(UUID, UUID, 'تشغيل', -1, 'YER', '')).toThrow();
    expect(() => validateExpenseInput(UUID, UUID, 'تشغيل', 1, 'BAD', '')).toThrow();
    expect(() => validateCashAccountInput(UUID, 'Main', 'YER', -1)).toThrow();
    expect(() => validateCashAccountInput(UUID, 'Main', 'YER', Number.POSITIVE_INFINITY)).toThrow();
    expect(() => validateCashAccountInput(UUID, 'Main', 'YER', 0)).not.toThrow();
  });
});
