import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('purchasing operational acceleration contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/PurchasingPanel.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/purchasing-form-context.css'), 'utf8');

  it('shows real receipt progress per order', () => {
    expect(source).toContain('const receiptProgress = useMemo');
    expect(source).toContain('item.quantity_ordered');
    expect(source).toContain('item.quantity_received');
    expect(source).toContain('purchase-receipt-progress');
    expect(source).toContain('progress.received/progress.ordered');
  });

  it('offers direct receive navigation for approved orders', () => {
    expect(source).toContain("order.status==='approved'||order.status==='partially_received'");
    expect(source).toContain("setSelectedOrderId(order.id)");
    expect(source).toContain('id="purchase-receiving"');
  });

  it('keeps the progress indicator compact on mobile', () => {
    expect(css).toContain('.purchase-receipt-progress');
    expect(css).toContain('@media(max-width:650px)');
  });
});
