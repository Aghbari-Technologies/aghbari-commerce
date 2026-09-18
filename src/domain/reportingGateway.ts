export interface ReportingAttempt {
  idempotencyKey: string;
  periodStart: string;
  periodEnd: string;
}

export function getOrCreateReportingAttempt(
  existing: ReportingAttempt | null,
  periodStart: string,
  periodEnd: string,
  createKey: () => string
): ReportingAttempt {
  if (existing?.periodStart === periodStart && existing.periodEnd === periodEnd && existing.idempotencyKey.trim()) {
    return existing;
  }
  return {
    idempotencyKey: createKey(),
    periodStart,
    periodEnd
  };
}
