export type DeliveryState = 'pending' | 'processing' | 'delivered' | 'dead';

export interface OutboxRecord { id: string; state: DeliveryState; attempts: number; availableAt: number; lockedUntil?: number; }

export function canClaim(record: OutboxRecord, now = Date.now()): boolean {
  return (record.state === 'pending' && record.availableAt <= now) || (record.state === 'processing' && (record.lockedUntil ?? 0) <= now);
}

export function nextRetryAt(attempt: number, now = Date.now()): number {
  const boundedAttempt = Math.min(Math.max(attempt, 1), 8);
  const delay = Math.min(15 * 60_000, 2 ** boundedAttempt * 1000);
  return now + delay;
}

export function isTerminalAttempt(attempt: number, maxAttempts = 8): boolean {
  return attempt >= maxAttempts;
}
