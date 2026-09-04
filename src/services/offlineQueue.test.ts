import { beforeEach, describe, expect, it } from 'vitest';
import { clearOfflineQueue, enqueueOfflineOperation, markOfflineOperationAttempt, MAX_OFFLINE_OPERATIONS, pendingOfflineOperations } from './offlineQueue';

describe('offline operation queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('rejects empty operation types and preserves bounded entries', () => {
    expect(() => enqueueOfflineOperation('   ', {})).toThrow('نوع العملية مطلوب');
    enqueueOfflineOperation('cart:update', { productId: 'p1', quantity: 1 });
    expect(pendingOfflineOperations()).toHaveLength(1);
  });

  it('tracks attempts without losing operation identity', () => {
    const operation = enqueueOfflineOperation('order:submit', { orderId: 'o1' });
    markOfflineOperationAttempt(operation.operationId);
    expect(pendingOfflineOperations()[0]).toMatchObject({ operationId: operation.operationId, attempts: 1, type: 'order:submit' });
  });

  it('enforces a hard queue ceiling', () => {
    for (let index = 0; index < MAX_OFFLINE_OPERATIONS; index += 1) enqueueOfflineOperation(`op:${index}`, { index });
    expect(() => enqueueOfflineOperation('op:overflow', { overflow: true })).toThrow('100');
    clearOfflineQueue();
    expect(pendingOfflineOperations()).toHaveLength(0);
  });
});
