import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260925110000_harden_finance_payment_idempotency.sql'),
  'utf8',
);

describe('record_payment migration contract', () => {
  it('keeps the six-argument identity while satisfying PostgreSQL default-parameter rules', () => {
    expect(migration).toContain('p_cash_account_id uuid DEFAULT NULL');
    expect(migration).toContain('p_reference text DEFAULT NULL');
    expect(migration).toContain('p_idempotency_key text DEFAULT NULL');
    expect(migration).toContain('uuid, numeric, public.payment_method, uuid, text, text');
  });

  it('still enforces idempotency at execution time', () => {
    expect(migration).toContain("IF v_key IS NULL OR pg_catalog.length(v_key) < 16 OR pg_catalog.length(v_key) > 128");
    expect(migration).toContain("payment idempotency payload conflict");
    expect(migration).toContain("pg_catalog.pg_advisory_xact_lock");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.record_payment");
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.record_payment');
  });
});
