import { describe, expect, it } from 'vitest';
import { CUSTOMER_ADDRESS_LIMITS, normalizeCustomerAddressInput } from './customerAddresses';

const valid = {
  label: '  المستودع الرئيسي  ',
  recipientName: '  محمد الأغبري  ',
  phone: '  771234567  ',
  addressLine1: '  شارع تعز، جوار السوق  ',
  addressLine2: '  مبنى 4، طابق 2  ',
  city: ' صنعاء ',
  district: ' حدة ',
  notes: ' اتصل قبل التسليم ',
  isDefault: true,
};

describe('customer address policy', () => {
  it('trims required and optional fields without changing the business meaning', () => {
    expect(normalizeCustomerAddressInput(valid)).toEqual({
      label: 'المستودع الرئيسي',
      recipientName: 'محمد الأغبري',
      phone: '771234567',
      addressLine1: 'شارع تعز، جوار السوق',
      addressLine2: 'مبنى 4، طابق 2',
      city: 'صنعاء',
      district: 'حدة',
      notes: 'اتصل قبل التسليم',
      isDefault: true,
    });
  });

  it('rejects missing required fields', () => {
    expect(() => normalizeCustomerAddressInput({ ...valid, city: '   ' })).toThrow('المدينة مطلوب.');
    expect(() => normalizeCustomerAddressInput({ ...valid, phone: '' })).toThrow('هاتف المستلم مطلوب.');
  });

  it('rejects oversized required fields', () => {
    expect(() => normalizeCustomerAddressInput({
      ...valid,
      label: 'x'.repeat(CUSTOMER_ADDRESS_LIMITS.label + 1),
    })).toThrow('اسم العنوان يتجاوز الحد المسموح.');
  });

  it('bounds optional values instead of persisting arbitrary whitespace', () => {
    expect(normalizeCustomerAddressInput({
      ...valid,
      addressLine2: '   ',
      district: undefined,
      notes: null,
      isDefault: false,
    })).toMatchObject({
      addressLine2: null,
      district: null,
      notes: null,
      isDefault: false,
    });
  });
});
