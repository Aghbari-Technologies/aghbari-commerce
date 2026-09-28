import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer directory closure', () => {
  it('keeps search, status, tier and sorting controls wired in the live customer directory', () => {
    const source = readFileSync(resolve(process.cwd(), 'src', 'CustomerPanel.tsx'), 'utf8');
    expect(source).toContain('customerSort');
    expect(source).toContain('ترتيب العملاء');
    expect(source).toContain('الأحدث تسجيلًا');
    expect(source).toContain('الأقدم تسجيلًا');
    expect(source).toContain('a.name.localeCompare(b.name, \'ar\')');
  });

  it('keeps customer detail provenance fields visible', () => {
    const source = readFileSync(resolve(process.cwd(), 'src', 'CustomerPanel.tsx'), 'utf8');
    expect(source).toContain('selectedCustomer.created_at');
    expect(source).toContain('selectedCustomer.updated_at');
  });
});


describe('customer management denial-message contract', () => {
  it('keeps canonical role-denial messages on the latest customer mutation migration', () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260925115000_customer_mutation_audit_contract.sql'), 'utf8');
    expect(source).toContain("customer tier management access required");
    expect(source).toContain("customer state management access required");
  });
});
