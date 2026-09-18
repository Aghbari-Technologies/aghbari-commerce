import { describe, expect, it } from 'vitest';
import { filterCommandActions } from './commandPalette';

describe('filterCommandActions', () => {
  const actions = [
    { label: 'الكتالوج', hint: 'الأصناف والأسعار', keywords: ['منتجات', 'sku'] },
    { label: 'إعادة تجهيز آخر طلب', hint: 'repeat order', keywords: ['إعادة', 'reorder'] },
    { label: 'المركز المالي', hint: 'الرصيد والكشف', keywords: ['مالية'] },
  ];

  it('returns all actions for an empty query', () => {
    expect(filterCommandActions(actions, '')).toEqual(actions);
  });

  it('matches Arabic labels and keywords case-insensitively', () => {
    expect(filterCommandActions(actions, 'إعادة').map((x) => x.label)).toEqual(['إعادة تجهيز آخر طلب']);
    expect(filterCommandActions(actions, 'SKU').map((x) => x.label)).toEqual(['الكتالوج']);
  });

  it('ignores surrounding whitespace', () => {
    expect(filterCommandActions(actions, '  مالية  ').map((x) => x.label)).toEqual(['المركز المالي']);
  });

  it('returns no results when nothing matches', () => {
    expect(filterCommandActions(actions, 'غير موجود')).toEqual([]);
  });
});
