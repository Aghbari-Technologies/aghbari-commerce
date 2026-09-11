import { describe, expect, it } from 'vitest';

function validateTemplateInput(name: string, lines: Array<{ productId: string; sku: string; name: string; unit: string; quantity: number }>) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 120) throw new Error('اسم المسحة يجب أن يكون بين 1 و120 حرفًا.');
  if (!lines.length || lines.length > 100) throw new Error('المسحة يجب أن تحتوي على أصناف صحيحة.');
  for (const line of lines) {
    if (!line.productId || !line.sku || !line.name || !line.unit || !Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error('بيانات أصناف المسحة غير صالحة.');
    }
  }
}

describe('order template input contract', () => {
  const valid = [{ productId: 'p1', sku: 'SKU-1', name: 'منتج', unit: 'كرتون', quantity: 2 }];
  it('accepts a valid template', () => expect(() => validateTemplateInput('طلب أسبوعي', valid)).not.toThrow());
  it('rejects blank names', () => expect(() => validateTemplateInput('   ', valid)).toThrow());
  it('rejects invalid quantities', () => expect(() => validateTemplateInput('طلب', [{ ...valid[0], quantity: 0 }])).toThrow());
  it('rejects fractional quantities', () => expect(() => validateTemplateInput('طلب', [{ ...valid[0], quantity: 1.5 }])).toThrow());
  it('rejects empty lines', () => expect(() => validateTemplateInput('طلب', [])).toThrow());
  it('accepts the maximum template line boundary', () => expect(() => validateTemplateInput('طلب', Array.from({ length: 100 }, (_, i) => ({ ...valid[0], productId: `p${i}` })))).not.toThrow());
  it('rejects one line beyond the maximum boundary', () => expect(() => validateTemplateInput('طلب', Array.from({ length: 101 }, (_, i) => ({ ...valid[0], productId: `p${i}` })))).toThrow());
  it('accepts a name of exactly 120 characters', () => expect(() => validateTemplateInput('أ'.repeat(120), valid)).not.toThrow());
  it('rejects a name of 121 characters', () => expect(() => validateTemplateInput('أ'.repeat(121), valid)).toThrow());
});
