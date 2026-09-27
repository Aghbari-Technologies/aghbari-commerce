import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('customer nested loading surfaces', () => {
  it('uses structural address loading rather than a text-only placeholder', () => {
    const source = read('src/CustomerAccountWorkspace.tsx');
    expect(source).toContain('customer-address-loading-skeleton');
    expect(source).toContain('aria-label="جارٍ تحميل عناوين التسليم"');
    expect(source).not.toContain('<div className="customer-address-list-state" role="status">جارٍ تحميل عناوين التسليم…</div>');
  });

  it('uses structural invoice-detail loading rather than a text-only placeholder', () => {
    const source = read('src/CustomerFinancePanel.tsx');
    expect(source).toContain('invoice-detail-loading-skeleton');
    expect(source).toContain('aria-label="جارٍ تحميل بنود ومدفوعات الفاتورة"');
    expect(source).not.toContain('<div className="portal-loading" role="status">جارٍ تحميل بنود ومدفوعات الفاتورة…</div>');
  });

  it('keeps both skeleton surfaces in their responsive style contracts', () => {
    expect(read('src/customer-account-workspace.css')).toContain('.customer-address-loading-skeleton');
    expect(read('src/customer-portal-v3.css')).toContain('.invoice-detail-loading-skeleton');
  });
});
