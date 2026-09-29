import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('purchasing operational context fields', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/PurchasingPanel.tsx'), 'utf8');

  it('exposes supplier email and passes it to the existing supplier contract', () => {
    expect(source).toContain('aria-label="بريد المورد"');
    expect(source).toContain('email: supplierEmail');
  });

  it('exposes notes for purchase creation and receipt and bounds them to the server contract', () => {
    expect(source).toContain('aria-label="ملاحظات أمر الشراء"');
    expect(source).toContain('notes: purchaseNotes.trim() || undefined');
    expect(source).toContain('aria-label="ملاحظات الاستلام"');
    expect(source).toContain('notes:receiveNotes.trim()||undefined');
    expect(source).toContain('maxLength={2000}');
  });
});
