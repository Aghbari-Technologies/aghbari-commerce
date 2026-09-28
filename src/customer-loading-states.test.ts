import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('customer loading-state coverage', () => {
  it('keeps visual loading surfaces for catalog, orders and finance', () => {
    const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    const orders = readFileSync(resolve(process.cwd(), 'src/CustomerOrdersPanel.tsx'), 'utf8');
    const finance = readFileSync(resolve(process.cwd(), 'src/CustomerFinancePanel.tsx'), 'utf8');
    expect(app).toContain('catalog-loading-skeleton');
    expect(orders).toContain('customer-orders-loading-skeleton');
    expect(finance).toContain('customer-finance-loading-skeleton');
  });

  it('keeps reduced-motion fallbacks on the customer loading surfaces', () => {
    const catalogCss = readFileSync(resolve(process.cwd(), 'src/ui-execution-closure.css'), 'utf8');
    const ordersCss = readFileSync(resolve(process.cwd(), 'src/customer-orders.css'), 'utf8');
    const financeCss = readFileSync(resolve(process.cwd(), 'src/customer-finance.css'), 'utf8');
    expect(catalogCss).toContain('prefers-reduced-motion:reduce');
    expect(ordersCss).toContain('prefers-reduced-motion:reduce');
    expect(financeCss).toContain('prefers-reduced-motion:reduce');
  });
});
