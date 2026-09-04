export const OFFLINE_CART_SET_ITEM = 'cart:set_item';
export const OFFLINE_CART_REMOVE_ITEM = 'cart:remove_item';
export const OFFLINE_SAFE_OPERATION_TYPES = new Set([OFFLINE_CART_SET_ITEM, OFFLINE_CART_REMOVE_ITEM]);

export interface OfflineOperation<T = unknown> {
  operationId: string;
  type: string;
  payload: T;
  createdAt: string;
  attempts: number;
}

const STORAGE_KEY = 'aghbari.offline.operations.v1';
export const MAX_OFFLINE_OPERATIONS = 100;
export const MAX_OFFLINE_ATTEMPTS = 8;
export const MAX_OFFLINE_PAYLOAD_BYTES = 16 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function payloadBytes(payload: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(payload)).byteLength;
  } catch {
    throw new Error('بيانات العملية غير المتصلة غير قابلة للحفظ.');
  }
}

function read<T>(): OfflineOperation<T>[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is OfflineOperation<T> => Boolean(
      item && typeof item === 'object' &&
      typeof (item as OfflineOperation).operationId === 'string' &&
      UUID_PATTERN.test((item as OfflineOperation).operationId) &&
      typeof (item as OfflineOperation).type === 'string' &&
      OFFLINE_SAFE_OPERATION_TYPES.has((item as OfflineOperation).type) &&
      typeof (item as OfflineOperation).createdAt === 'string' &&
      Number.isFinite(Date.parse((item as OfflineOperation).createdAt)) &&
      Number.isInteger((item as OfflineOperation).attempts) &&
      (item as OfflineOperation).attempts >= 0 &&
      (item as OfflineOperation).attempts <= MAX_OFFLINE_ATTEMPTS &&
      payloadBytes((item as OfflineOperation).payload) <= MAX_OFFLINE_PAYLOAD_BYTES
    ));
  } catch {
    return [];
  }
}

function persist(queue: OfflineOperation<unknown>[]): void {
  if (queue.length > MAX_OFFLINE_OPERATIONS) {
    throw new Error(`لا يمكن الاحتفاظ بأكثر من ${MAX_OFFLINE_OPERATIONS} عملية غير متصلة.`);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    throw new Error('تعذر حفظ العملية غير المتصلة محليًا. قد تكون مساحة التخزين ممتلئة.');
  }
}

export function enqueueOfflineOperation<T>(type: string, payload: T): OfflineOperation<T> {
  const normalizedType = type.trim();
  if (!normalizedType) throw new Error('نوع العملية مطلوب.');
  if (!OFFLINE_SAFE_OPERATION_TYPES.has(normalizedType)) {
    throw new Error('هذه العملية لا يُسمح بتأجيلها دون اتصال.');
  }
  if (payloadBytes(payload) > MAX_OFFLINE_PAYLOAD_BYTES) {
    throw new Error(`حجم بيانات العملية يتجاوز ${MAX_OFFLINE_PAYLOAD_BYTES} بايت.`);
  }
  const operation: OfflineOperation<T> = { operationId: crypto.randomUUID(), type: normalizedType, payload, createdAt: new Date().toISOString(), attempts: 0 };
  const queue = read<unknown>();
  persist([...queue, operation as OfflineOperation<unknown>]);
  return operation;
}

export function pendingOfflineOperations<T = unknown>(): OfflineOperation<T>[] { return read<T>(); }

export function removeOfflineOperation(operationId: string): void {
  if (!UUID_PATTERN.test(operationId)) return;
  persist(read<unknown>().filter((item) => item.operationId !== operationId));
}

export function markOfflineOperationAttempt(operationId: string): void {
  const queue = read<unknown>();
  const existing = queue.find((item) => item.operationId === operationId);
  if (!existing) return;
  if (existing.attempts >= MAX_OFFLINE_ATTEMPTS) {
    throw new Error(`تجاوزت العملية الحد الأقصى لإعادة المحاولة (${MAX_OFFLINE_ATTEMPTS}).`);
  }
  persist(queue.map((item) => item.operationId === operationId ? { ...item, attempts: item.attempts + 1 } : item));
}

export async function drainOfflineOperations(
  processor: (operation: OfflineOperation) => Promise<void>,
): Promise<{ processed: number; failed: number }> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { processed: 0, failed: 0 };
  let processed = 0;
  let failed = 0;
  for (const operation of pendingOfflineOperations()) {
    try {
      await processor(operation);
      removeOfflineOperation(operation.operationId);
      processed += 1;
    } catch {
      markOfflineOperationAttempt(operation.operationId);
      failed += 1;
    }
  }
  return { processed, failed };
}

export function clearOfflineQueue(): void { localStorage.removeItem(STORAGE_KEY); }
