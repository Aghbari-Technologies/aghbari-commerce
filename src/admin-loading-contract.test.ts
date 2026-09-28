import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('admin operational loading surfaces', () => {
  it('uses the shared structural skeleton for finance data', () => {
    const source = read('src/FinancePanel.tsx');
    expect(source).toContain('OperationalLoadingSkeleton variant="collection"');
    expect(source).not.toContain('جارٍ تحميل البيانات المالية…');
  });

  it('uses the shared structural skeleton for staff access data', () => {
    const source = read('src/StaffAccessPanel.tsx');
    expect(source).toContain("OperationalLoadingSkeleton variant="collection"");
    expect(source).not.toContain('جارٍ تحميل دليل المستخدمين…');
  });
});
