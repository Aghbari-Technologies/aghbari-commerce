export const OUTBOX_STATUSES = ['PENDING', 'PROCESSING', 'DELIVERED', 'RETRYABLE', 'DEAD_LETTER'] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export interface OutboxEvent {
  readonly id: string;
  readonly operationId: string;
  readonly correlationId: string;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly status: OutboxStatus;
  readonly attempts: number;
  readonly nextAttemptAt?: string;
  readonly lastError?: string;
}

export function claimEvent(event: OutboxEvent, now: string): OutboxEvent {
  if (event.status !== 'PENDING' && event.status !== 'RETRYABLE') {
    throw new Error(`CONFLICT:CANNOT_CLAIM:${event.status}`);
  }
  return { ...event, status: 'PROCESSING', attempts: event.attempts + 1, nextAttemptAt: now };
}

export function markDelivered(event: OutboxEvent): OutboxEvent {
  if (event.status !== 'PROCESSING') throw new Error(`CONFLICT:CANNOT_DELIVER:${event.status}`);
  const { lastError: _lastError, nextAttemptAt: _nextAttemptAt, ...stable } = event;
  return { ...stable, status: 'DELIVERED' };
}

export function markRetryable(event: OutboxEvent, nextAttemptAt: string, error: string): OutboxEvent {
  if (event.status !== 'PROCESSING') throw new Error(`CONFLICT:CANNOT_RETRY:${event.status}`);
  if (!error) throw new Error('VALIDATION_FAILED:error');
  return { ...event, status: 'RETRYABLE', nextAttemptAt, lastError: error };
}

export function markDeadLetter(event: OutboxEvent, error: string): OutboxEvent {
  if (event.status !== 'PROCESSING' && event.status !== 'RETRYABLE') {
    throw new Error(`CONFLICT:CANNOT_DEAD_LETTER:${event.status}`);
  }
  if (!error) throw new Error('VALIDATION_FAILED:error');
  const { nextAttemptAt: _nextAttemptAt, ...stable } = event;
  return { ...stable, status: 'DEAD_LETTER', lastError: error };
}
