import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearOfflineQueue,
  drainOfflineOperations,
  enqueueOfflineOperation,
  markOfflineOperationAttempt,
  MAX_OFFLINE_ATTEMPTS,
  MAX_OFFLINE_OPERATIONS,
  MAX_OFFLINE_PAYLOAD_BYTES,
  OFFLINE_CART_SET_ITEM,
  pendingOfflineOperations
} from './offlineQueue';

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

  it('rejects empty and unsafe operation types', () => {
    expect(() => enqueueOfflineOperation('   ', {})).toThrow('نوع العملية مطلوب');
    expect(() => enqueueOfflineOperation('order:submit', {})).toThrow('لا يُسمح بتأجيلها');
    enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 });
    expect(pendingOfflineOperations()).toHaveLength(1);
  });

  it('tracks attempts without losing operation identity', () => {
    const operation = enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 });
    markOfflineOperationAttempt(operation.operationId, 1_000);
    expect(pendingOfflineOperations()[0]).toMatchObject({ operationId: operation.operationId, attempts: 1, type: OFFLINE_CART_SET_ITEM });
    expect(Date.parse(pendingOfflineOperations()[0].nextAttemptAt!)).toBe(3_000);
  });

  it('caps retry attempts instead of allowing an endless local retry loop', () => {
    const operation = enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 });
    for (let index = 0; index < MAX_OFFLINE_ATTEMPTS; index += 1) markOfflineOperationAttempt(operation.operationId);
    expect(pendingOfflineOperations()[0].attempts).toBe(MAX_OFFLINE_ATTEMPTS);
    expect(() => markOfflineOperationAttempt(operation.operationId)).toThrow(/الحد الأقصى/);
  });

  it('does not replay a failed operation before its next-attempt time', async () => {
    const operation = enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 });
    markOfflineOperationAttempt(operation.operationId, 10_000);
    let calls = 0;
    const early = await drainOfflineOperations(async () => { calls += 1; }, 11_999);
    expect(early).toEqual({ processed: 0, failed: 0 });
    expect(calls).toBe(0);
    const ready = await drainOfflineOperations(async () => { calls += 1; }, 12_000);
    expect(ready).toEqual({ processed: 1, failed: 0 });
    expect(calls).toBe(1);
  });

  it('discards malformed persisted records rather than replaying them', () => {
    storage.set('aghbari.offline.operations.v1', JSON.stringify([
      { operationId: 'not-a-uuid', type: OFFLINE_CART_SET_ITEM, createdAt: new Date().toISOString(), attempts: 0, payload: {} },
      { operationId: crypto.randomUUID(), type: 'order:submit', createdAt: new Date().toISOString(), attempts: 0, payload: {} },
      { operationId: crypto.randomUUID(), type: OFFLINE_CART_SET_ITEM, createdAt: new Date().toISOString(), attempts: 0, payload: { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 } }
    ]));
    expect(pendingOfflineOperations()).toHaveLength(1);
  });

  it('enforces a payload size ceiling', () => {
    expect(() => enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', blob: 'x'.repeat(MAX_OFFLINE_PAYLOAD_BYTES) })).toThrow(/حجم بيانات/);
  });

  it('enforces a hard queue ceiling', () => {
    for (let index = 0; index < MAX_OFFLINE_OPERATIONS; index += 1) {
      enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 });
    }
    expect(() => enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 })).toThrow('100');
    clearOfflineQueue();
    expect(pendingOfflineOperations()).toHaveLength(0);
  });

  it('drains successful operations and retains failed operations for recovery', async () => {
    const success = enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '11111111-1111-4111-8111-111111111111', quantity: 2 });
    const failed = enqueueOfflineOperation(OFFLINE_CART_SET_ITEM, { productId: '22222222-2222-4222-8222-222222222222', quantity: 3 });
    const seen: string[] = [];
    const result = await drainOfflineOperations(async (operation) => {
      seen.push(operation.operationId);
      if (operation.operationId === failed.operationId) throw new Error('transient');
    }, 20_000);
    expect(result).toEqual({ processed: 1, failed: 1 });
    expect(seen).toEqual([success.operationId, failed.operationId]);
    expect(pendingOfflineOperations()).toHaveLength(1);
    expect(pendingOfflineOperations()[0].operationId).toBe(failed.operationId);
    expect(pendingOfflineOperations()[0].attempts).toBe(1);
  });
});
