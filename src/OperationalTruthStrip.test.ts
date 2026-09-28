import { describe, expect, it } from 'vitest';
import { getOperationalTruth } from './OperationalTruthStrip';

describe('operational trust model', () => {
  it('identifies server-authoritative online sources', () => {
    expect(getOperationalTruth(true, 'wholesale', 'المستودع الرئيسي')).toEqual({
      connection: 'متصل بالمصدر الخادمي',
      pricingSource: 'قائمة الحساب المصرح بها · جملة',
      stockSource: 'رصيد المستودع · المستودع الرئيسي',
      authority: 'الخادم هو صاحب القرار النهائي'
    });
  });

  it('identifies cached offline data as non-authoritative', () => {
    const truth = getOperationalTruth(false, 'wholesale', 'المستودع الرئيسي');
    expect(truth.connection).toBe('وضع اتصال محدود');
    expect(truth.pricingSource).toBe('قائمة الحساب المصرح بها · جملة');
    expect(truth.stockSource).toBe('نسخة محلية للعرض فقط');
    expect(truth.authority).toBe('الخادم هو صاحب القرار النهائي');
  });

  it('keeps unknown tier labels descriptive without inventing a rule', () => {
    expect(getOperationalTruth(true, 'custom', 'فرع صنعاء').pricingSource)
      .toBe('قائمة الحساب المصرح بها · custom');
  });
});
