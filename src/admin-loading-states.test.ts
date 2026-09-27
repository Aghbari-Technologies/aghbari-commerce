import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('admin loading-state coverage', () => {
  it('keeps visual loading surfaces for orders and customer directory', () => {
    const admin = readFileSync(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');
    const customers = readFileSync(resolve(process.cwd(), 'src/CustomerPanel.tsx'), 'utf8');
    expect(admin).toContain('admin-orders-loading-skeleton');
    expect(customers).toContain('customer-directory-loading-skeleton');
  });

  it('keeps reduced-motion fallbacks on the administrative loading surfaces', () => {
    const adminCss = readFileSync(resolve(process.cwd(), 'src/admin-executive-dashboard.css'), 'utf8');
    const customerCss = readFileSync(resolve(process.cwd(), 'src/customer-directory.css'), 'utf8');
    expect(adminCss).toContain('prefers-reduced-motion:reduce');
    expect(customerCss).toContain('prefers-reduced-motion:reduce');
  });
});
