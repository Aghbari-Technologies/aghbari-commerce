import { describe, expect, it } from 'vitest';
import { DEFAULT_CUSTOMER_PORTAL_CONFIG, firstEnabledPaymentMethod, isPaymentMethodEnabled, validateCheckoutPolicy } from './customerPolicy';

describe('customer checkout policy', () => {
  it('selects a usable default payment method', () => {
    expect(firstEnabledPaymentMethod(DEFAULT_CUSTOMER_PORTAL_CONFIG)).toBe('credit');
    expect(isPaymentMethodEnabled(DEFAULT_CUSTOMER_PORTAL_CONFIG, 'cash')).toBe(true);
  });
  it('rejects disabled payment methods', () => {
    const config = { ...DEFAULT_CUSTOMER_PORTAL_CONFIG, paymentCash: false };
    expect(validateCheckoutPolicy({ config, paymentMethod:'cash', total:100, lineProductIds:['p1'], confirmedProductIds:new Set(['p1']) })).toContain('غير متاحة');
  });
  it('enforces minimum and maximum order values', () => {
    const config = { ...DEFAULT_CUSTOMER_PORTAL_CONFIG, minOrderValue:50, maxOrderValue:100 };
    expect(validateCheckoutPolicy({ config, paymentMethod:'credit', total:49, lineProductIds:['p1'], confirmedProductIds:new Set(['p1']) })).toContain('الحد الأدنى');
    expect(validateCheckoutPolicy({ config, paymentMethod:'credit', total:101, lineProductIds:['p1'], confirmedProductIds:new Set(['p1']) })).toContain('الحد الأعلى');
  });
  it('requires confirmation for every line when configured', () => {
    expect(validateCheckoutPolicy({ config:DEFAULT_CUSTOMER_PORTAL_CONFIG, paymentMethod:'credit', total:100, lineProductIds:['p1','p2'], confirmedProductIds:new Set(['p1']) })).toContain('تأكيد كمية كل صنف');
  });

  it('wires the selected payment method into the real customer order submission path', async () => {
    const { readFile } = await import('node:fs/promises');
    const source = await readFile(new URL('../AppV3Fixed.tsx', import.meta.url), 'utf8');
    expect(source).toContain('{ paymentMethod: payment }');
  });
});
