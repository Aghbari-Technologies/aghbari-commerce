import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('saved recent-history cleanup', () => {
  const shelf = readFileSync(resolve(process.cwd(), 'src/CustomerSavedShelf.tsx'), 'utf8');
  const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  it('offers local-only recent-history cleanup with explicit confirmation', () => {
    expect(shelf).toContain('onClearRecent?:()=>void');
    expect(shelf).toContain('مسح السجل');
    expect(app).toContain('setRecentProductIds([])');
    expect(app).toContain('مسح سجل الأصناف المشاهدة مؤخرًا من هذا الجهاز فقط؟');
  });
});
