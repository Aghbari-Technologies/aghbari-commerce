import { describe, expect, it } from 'vitest';
import { assertEntityId, assertInventoryQuantity, assertMoney } from './admin';

describe('admin command response contracts', () => {
  it('accepts only an object with a valid entity UUID', () => {
    const value = { id: '15151515-1515-4515-8515-151515151515', name: 'Example' };
    expect(assertEntityId(value, 'إنشاء')).toBe(value);
    expect(() => assertEntityId(null, 'إنشاء')).toThrow('لم يتم إثبات نجاح العملية');
    expect(() => assertEntityId({ id: 'not-a-uuid' }, 'إنشاء')).toThrow('لم يتم إثبات نجاح العملية');
  });

  it('rejects non-finite and negative price responses', () => {
    expect(assertMoney(100)).toBe(100);
    expect(assertMoney(100.25)).toBe(100.25);
    expect(() => assertMoney(null)).toThrow('استجابة تحديث السعر غير صالحة');
    expect(() => assertMoney(Number.NaN)).toThrow('استجابة تحديث السعر غير صالحة');
    expect(() => assertMoney(-1)).toThrow('استجابة تحديث السعر غير صالحة');
  });

  it('accepts only non-negative safe integer inventory quantities', () => {
    expect(assertInventoryQuantity(0)).toBe(0);
    expect(assertInventoryQuantity(12)).toBe(12);
    expect(() => assertInventoryQuantity(null)).toThrow('استجابة تعديل المخزون غير صالحة');
    expect(() => assertInventoryQuantity(1.5)).toThrow('استجابة تعديل المخزون غير صالحة');
    expect(() => assertInventoryQuantity(-1)).toThrow('استجابة تعديل المخزون غير صالحة');
  });
});
