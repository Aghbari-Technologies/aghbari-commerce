import { describe, expect, it } from 'vitest';
import { getOrCreateReportingAttempt } from './reportingGateway';

describe('reporting request idempotency', () => {
  it('reuses the same attempt key for retries within the same period', () => {
    const existing = { idempotencyKey: 'retry-key-1234', periodStart: '2026-09-01', periodEnd: '2026-09-18' };
    expect(getOrCreateReportingAttempt(existing, '2026-09-01', '2026-09-18', () => 'new-key')).toEqual(existing);
  });

  it('starts a new attempt when the reporting period changes', () => {
    expect(getOrCreateReportingAttempt(
      { idempotencyKey: 'old-key-1234', periodStart: '2026-08-01', periodEnd: '2026-08-31' },
      '2026-09-01',
      '2026-09-18',
      () => 'new-key-1234'
    )).toEqual({
      idempotencyKey: 'new-key-1234',
      periodStart: '2026-09-01',
      periodEnd: '2026-09-18'
    });
  });
});
