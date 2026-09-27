import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Exact current-main proof marker.
describe('admin operational loading surfaces', () => {
  it('keeps visual skeletons for inventory and purchasing instead of text-only loading placeholders', () => {
    const inventory = readFileSync(resolve(process.cwd(), 'src/InventoryPanel.tsx'), 'utf8');
    const purchasing = readFileSync(resolve(process.cwd(), 'src/PurchasingPanel.tsx'), 'utf8');
    expect(inventory).toContain('<OperationalLoadingSkeleton variant="inventory"');
    expect(purchasing).toContain('<OperationalLoadingSkeleton variant="purchasing"');
    expect(inventory).not.toContain('جارٍ تحميل بيانات المخزون…');
    expect(purchasing).not.toContain('جارٍ تحميل أوامر الشراء…');
  });

  it('keeps reduced-motion behavior in the shared skeleton stylesheet', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/operational-loading-skeleton.css'), 'utf8');
    expect(css).toContain('prefers-reduced-motion:reduce');
    expect(css).toContain('operational-skeleton-block');
  });
});
