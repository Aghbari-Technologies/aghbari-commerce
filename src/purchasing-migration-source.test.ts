import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260927041500_normalize_purchase_receipt_idempotency_bound.sql'),
  'utf8',
);

describe('purchase/receipt 128-bound migration source contract', () => {
  it('keeps both commands at the canonical 16..128 bound', () => {
    const checks = migration.match(/length\(key\)<16\s+or\s+length\(key\)>128/g) ?? [];
    expect(checks.length).toBeGreaterThanOrEqual(2);
    expect(migration).not.toContain('length(key)>200');
  });

  it('keeps reviewed security and same-key serialization', () => {
    expect((migration.match(/set search_path to ''/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(o::text||':purchase:'||key,0))");
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(o::text||':receipt:'||key,0))");
    expect(migration).toContain("revoke execute on function public.create_purchase_order");
    expect(migration).toContain("revoke execute on function public.receive_purchase_order");
  });

  it('keeps payload conflicts fail-closed', () => {
    expect((migration.match(/idempotency key payload conflict/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect((migration.match(/errcode='40001'/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});


describe('purchase receipt outbox aggregate contract', () => {
  it('keeps purchase.received bound to the created receipt aggregate', () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260927041500_normalize_purchase_receipt_idempotency_bound.sql'), 'utf8');
    expect(source).toContain("o,'purchase_receipt',rec.id,'purchase.received'");
    expect(source).not.toContain("o,'purchase_order',po.id,'purchase.received'");
  });
});
