import { describe, expect, it } from 'vitest';
import source from '../../supabase/functions/reporting-gateway/index.ts?raw';

describe('reporting gateway recovery contract', () => {
  it('does not reject a publication after the remote ingest has already succeeded', () => {
    expect(source).toContain('let externalAccepted = false');
    expect(source).toContain('externalAccepted = true');
    expect(source).toContain('if (exportRow && !externalAccepted) await markFailure(exportRow, message);');
    expect(source).toContain('REMOTE_ACCEPTED_LOCAL_FINALIZE_PENDING');
    expect(source).toContain('retryable: externalAccepted');
  });
});
