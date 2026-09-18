import { describe, expect, it } from 'vitest';
import source from '../../supabase/functions/reporting-gateway/index.ts?raw';

describe('reporting gateway recovery contract', () => {
  it('does not reject a publication after the remote ingest has already succeeded', () => {
    expect(source).toContain('const delivery = { externalAccepted: false };');
    expect(source).toContain('delivery.externalAccepted = true;');
    expect(source).toContain('if (exportRow && !delivery.externalAccepted) await markFailure(exportRow, message);');
    expect(source).toContain('REMOTE_ACCEPTED_LOCAL_FINALIZE_PENDING');
    expect(source).toContain('retryable: delivery.externalAccepted');
  });

  it('keeps delivery acceptance scoped to one request', () => {
    expect(source).toContain('async function processExport(exportRow: ExportRow, client: SupabaseClient, delivery: { externalAccepted: boolean })');
    expect(source).not.toContain('let externalAccepted = false');
  });
});
