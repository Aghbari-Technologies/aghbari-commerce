import { describe, expect, it } from 'vitest';
import { canClaim, isTerminalAttempt, nextRetryAt, type OutboxRecord } from './outbox';

describe('outbox delivery policy', () => {
  it('claims pending records only when available', () => {
    const now = 1_000;
    const pending: OutboxRecord = { id: 'pending', state: 'pending', attempts: 0, availableAt: now };
    expect(canClaim(pending, now)).toBe(true);
    expect(canClaim({ ...pending, availableAt: now + 1 }, now)).toBe(false);
  });

  it('reclaims processing records only after lease expiry', () => {
    const now = 10_000;
    const processing: OutboxRecord = { id: 'processing', state: 'processing', attempts: 2, availableAt: 0, lockedUntil: now + 1 };
    expect(canClaim(processing, now)).toBe(false);
    expect(canClaim({ ...processing, lockedUntil: now }, now)).toBe(true);
  });

  it('does not claim terminal deliveries', () => {
    const record: OutboxRecord = { id: 'done', state: 'delivered', attempts: 8, availableAt: 0 };
    expect(canClaim(record, Date.now())).toBe(false);
    expect(isTerminalAttempt(8)).toBe(true);
    expect(isTerminalAttempt(7)).toBe(false);
  });

  it('keeps retry scheduling bounded and strictly future', () => {
    const now = 50_000;
    expect(nextRetryAt(1, now)).toBe(now + 2_000);
    expect(nextRetryAt(8, now)).toBe(now + 15 * 60_000);
    expect(nextRetryAt(100, now)).toBe(now + 15 * 60_000);
  });
});
