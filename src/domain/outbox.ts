export type DeliveryState = 'pending' | 'processing' | 'delivered' | 'dead';

export interface OutboxRecord { id: string; state: DeliveryState; attempts: number; availableAt: number; lockedUntil?: number; }

export function canClaim(record: OutboxRecord, now = Date.now()): boolean {
  return (record.state === 'pending' && record.availableAt <= now) || (record.state === 'processing' && (record.lockedUntil ?? 0) <= now);
}

export function nextRetryAt(attempt: number, now = Date.now()): number {
  const normalizedAttempt = Math.max(Math.trunc(attempt), 1);
  // Keep exponential growth bounded independently from the terminal-attempt policy.
  // This guarantees the configured 15-minute ceiling even for very large retry counts.
  const exponent = Math.min(normalizedAttempt, 20);
  const delay = Math.min(15 * 60_000, 2 ** exponent * 1000);
  return now + delay;
}

export function isTerminalAttempt(attempt: number, maxAttempts = 8): boolean {
  return attempt >= maxAttempts;
}
