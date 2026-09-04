export interface OfflineOperation<T = unknown> {
  operationId: string;
  type: string;
  payload: T;
  createdAt: string;
  attempts: number;
}

const STORAGE_KEY = 'aghbari.offline.operations.v1';
export const MAX_OFFLINE_OPERATIONS = 100;

function read<T>(): OfflineOperation<T>[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is OfflineOperation<T> => Boolean(
      item && typeof item === 'object' &&
      typeof (item as OfflineOperation).operationId === 'string' &&
      typeof (item as OfflineOperation).type === 'string' &&
      typeof (item as OfflineOperation).createdAt === 'string' &&
      Number.isInteger((item as OfflineOperation).attempts)
    ));
  } catch {
    return [];
  }
}

function persist(queue: OfflineOperation<unknown>[]): void {
  if (queue.length > MAX_OFFLINE_OPERATIONS) {
    throw new Error(`لا يمكن الاحتفاظ بأكثر من ${MAX_OFFLINE_OPERATIONS} عملية غير متصلة.`);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineOperation<T>(type: string, payload: T): OfflineOperation<T> {
  if (!type.trim()) throw new Error('نوع العملية مطلوب.');
  const operation: OfflineOperation<T> = { operationId: crypto.randomUUID(), type: type.trim(), payload, createdAt: new Date().toISOString(), attempts: 0 };
  const queue = read<unknown>();
  persist([...queue, operation as OfflineOperation<unknown>]);
  return operation;
}

export function pendingOfflineOperations<T = unknown>(): OfflineOperation<T>[] { return read<T>(); }

export function removeOfflineOperation(operationId: string): void {
  persist(read<unknown>().filter((item) => item.operationId !== operationId));
}

export function markOfflineOperationAttempt(operationId: string): void {
  persist(read<unknown>().map((item) => item.operationId === operationId ? { ...item, attempts: item.attempts + 1 } : item));
}

export function clearOfflineQueue(): void { localStorage.removeItem(STORAGE_KEY); }
