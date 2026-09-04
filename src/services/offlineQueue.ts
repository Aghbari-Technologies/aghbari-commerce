export interface OfflineOperation<T = unknown> { operationId: string; type: string; payload: T; createdAt: string; attempts: number; }

const STORAGE_KEY = 'aghbari.offline.operations.v1';

function read<T>(): OfflineOperation<T>[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as OfflineOperation<T>[]; } catch { return []; }
}

export function enqueueOfflineOperation<T>(type: string, payload: T): OfflineOperation<T> {
  const operation: OfflineOperation<T> = { operationId: crypto.randomUUID(), type, payload, createdAt: new Date().toISOString(), attempts: 0 };
  const queue = read<unknown>();
  queue.push(operation as OfflineOperation<unknown>);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return operation;
}

export function pendingOfflineOperations<T = unknown>(): OfflineOperation<T>[] { return read<T>(); }

export function removeOfflineOperation(operationId: string): void {
  const queue = read<unknown>().filter((item) => item.operationId !== operationId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function markOfflineOperationAttempt(operationId: string): void {
  const queue = read<unknown>().map((item) => item.operationId === operationId ? { ...item, attempts: item.attempts + 1 } : item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void { localStorage.removeItem(STORAGE_KEY); }
