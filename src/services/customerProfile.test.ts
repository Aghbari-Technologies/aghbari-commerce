import { describe, expect, it } from 'vitest';
import { normalizeCustomerSelfProfileInput } from './customerProfile';

describe('customer self profile normalization', () => {
  it('trims name and optional phone', () => {
    expect(normalizeCustomerSelfProfileInput({ name: '  عميل الأغبري  ', phone: ' 771234567 ' }))
      .toEqual({ name: 'عميل الأغبري', phone: '771234567' });
  });

  it('rejects blank or oversized input', () => {
    expect(() => normalizeCustomerSelfProfileInput({ name: '   ' })).toThrow('اسم العميل مطلوب');
    expect(() => normalizeCustomerSelfProfileInput({ name: 'عميل', phone: 'x'.repeat(41) })).toThrow('رقم الهاتف طويل جدًا');
  });
});
