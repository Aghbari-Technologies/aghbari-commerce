import { describe, expect, it } from 'vitest';
import source from '../../supabase/functions/reporting-gateway/index.ts?raw';

describe('reporting gateway browser contract', () => {
  it('declares the required CORS preflight headers for browser invocation', () => {
    expect(source).toContain("'Access-Control-Allow-Origin': '*'");
    expect(source).toContain("'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key, x-aghbari-tenant, x-aghbari-contract'");
    expect(source).toContain("'Access-Control-Allow-Methods': 'POST, OPTIONS'");
    expect(source).toContain("if (request.method === 'OPTIONS')");
  });
});
