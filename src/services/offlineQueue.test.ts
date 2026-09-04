import { beforeEach, describe, expect, it } from 'vitest';
import { clearOfflineQueue, enqueueOfflineOperation, markOfflineOperationAttempt, MAX_OFFLINE_ATTEMPTS, MAX_OFFLINE_OPERATIONS, pendingOfflineOperations } from './offlineQueue';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
    clear: () => storage.clear()
  }
});

describe('offline operation queue', () => {
  beforeEach(() => storage.clear());

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

  it('caps retry attempts instead of allowing an endless local retry loop', () => {
    const operation = enqueueOfflineOperation('cart:update', { productId: 'p1', quantity: 1 });
    for (let index = 0; index < MAX_OFFLINE_ATTEMPTS; index += 1) markOfflineOperationAttempt(operation.operationId);
    expect(pendingOfflineOperations()[0].attempts).toBe(MAX_OFFLINE_ATTEMPTS);
    expect(() => markOfflineOperationAttempt(operation.operationId)).toThrow(/الحد الأقصى/);
  });

  it('discards malformed persisted records rather than replaying them', () => {
    storage.set('aghbari.offline.operations.v1', JSON.stringify([
      { operationId: 'not-a-uuid', type: 'order:submit', createdAt: new Date().toISOString(), attempts: 0 },
      { operationId: crypto.randomUUID(), type: 'cart:update', createdAt: new Date().toISOString(), attempts: 0 }
    ]));
    expect(pendingOfflineOperations()).toHaveLength(1);
  });

  it('enforces a hard queue ceiling', () => {
    for (let index = 0; index < MAX_OFFLINE_OPERATIONS; index += 1) enqueueOfflineOperation(`op:${index}`, { index });
    expect(() => enqueueOfflineOperation('op:overflow', { overflow: true })).toThrow('100');
    clearOfflineQueue();
    expect(pendingOfflineOperations()).toHaveLength(0);
  });
});
