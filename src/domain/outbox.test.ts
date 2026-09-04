import assert from 'node:assert/strict';
import test from 'node:test';
import { claimEvent, markDeadLetter, markDelivered, markRetryable, type OutboxEvent } from './outbox.js';

const pending: OutboxEvent = {
  id: 'event-1',
  operationId: 'op-1',
  correlationId: 'corr-1',
  eventType: 'order.created',
  eventVersion: 1,
  status: 'PENDING',
  attempts: 0,
};

test('claim increments attempts and moves pending event to processing', () => {
  const claimed = claimEvent(pending, '2026-09-05T00:00:00Z');
  assert.equal(claimed.status, 'PROCESSING');
  assert.equal(claimed.attempts, 1);
});

test('delivered is terminal and cannot be delivered twice', () => {
  const delivered = markDelivered(claimEvent(pending, '2026-09-05T00:00:00Z'));
  assert.equal(delivered.status, 'DELIVERED');
  assert.throws(() => markDelivered(delivered), /CANNOT_DELIVER/);
});

test('retryable preserves error and dead-letter is terminal', () => {
  const processing = claimEvent(pending, '2026-09-05T00:00:00Z');
  const retryable = markRetryable(processing, '2026-09-05T00:05:00Z', 'provider timeout');
  assert.equal(retryable.status, 'RETRYABLE');
  assert.equal(retryable.attempts, 1);
  assert.equal(retryable.lastError, 'provider timeout');

  const dead = markDeadLetter(retryable, 'terminal provider rejection');
  assert.equal(dead.status, 'DEAD_LETTER');
  assert.equal(dead.lastError, 'terminal provider rejection');
  assert.throws(() => claimEvent(dead, '2026-09-05T01:00:00Z'), /CANNOT_CLAIM/);
});
