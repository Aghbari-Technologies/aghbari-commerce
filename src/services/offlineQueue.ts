export const OFFLINE_CART_SET_ITEM = 'cart:set_item';
export const OFFLINE_CART_REMOVE_ITEM = 'cart:remove_item';
export const OFFLINE_SAFE_OPERATION_TYPES = new Set([OFFLINE_CART_SET_ITEM, OFFLINE_CART_REMOVE_ITEM]);

export interface OfflineOperation<T = unknown> {
  operationId: string;
  type: string;
  payload: T;
  createdAt: string;
  attempts: number;
  userId: string;
  nextAttemptAt?: string;
}

const STORAGE_KEY = 'aghbari.offline.operations.v1';
export const MAX_OFFLINE_OPERATIONS = 100;
export const MAX_OFFLINE_ATTEMPTS = 8;
export const MAX_OFFLINE_PAYLOAD_BYTES = 16 * 1024;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 15 * 60_000;
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
      typeof (item as OfflineOperation).userId === 'string' &&
      UUID_PATTERN.test((item as OfflineOperation).userId) &&
      ((item as OfflineOperation).nextAttemptAt === undefined || Number.isFinite(Date.parse((item as OfflineOperation).nextAttemptAt!))) &&
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

export function enqueueOfflineOperation<T>(userId: string, type: string, payload: T): OfflineOperation<T> {
  if (!UUID_PATTERN.test(userId.trim())) throw new Error('هوية المستخدم مطلوبة للعملية غير المتصلة.');
  const normalizedType = type.trim();
  if (!normalizedType) throw new Error('نوع العملية مطلوب.');
  if (!OFFLINE_SAFE_OPERATION_TYPES.has(normalizedType)) {
    throw new Error('هذه العملية لا يُسمح بتأجيلها دون اتصال.');
  }
  if (payloadBytes(payload) > MAX_OFFLINE_PAYLOAD_BYTES) {
    throw new Error(`حجم بيانات العملية يتجاوز ${MAX_OFFLINE_PAYLOAD_BYTES} بايت.`);
  }
  const operation: OfflineOperation<T> = { operationId: crypto.randomUUID(), userId: userId.trim(), type: normalizedType, payload, createdAt: new Date().toISOString(), attempts: 0 };
  const queue = read<unknown>();
  persist([...queue, operation as OfflineOperation<unknown>]);
  return operation;
}

export function pendingOfflineOperations<T = unknown>(userId?: string): OfflineOperation<T>[] {
  const queue = read<T>();
  return userId && UUID_PATTERN.test(userId.trim()) ? queue.filter((item) => item.userId === userId.trim()) : queue;
}

export function removeOfflineOperation(operationId: string): void {
  if (!UUID_PATTERN.test(operationId)) return;
  persist(read<unknown>().filter((item) => item.operationId !== operationId));
}

export function markOfflineOperationAttempt(operationId: string, now = Date.now()): void {
  const queue = read<unknown>();
  const existing = queue.find((item) => item.operationId === operationId);
  if (!existing) return;
  if (existing.attempts >= MAX_OFFLINE_ATTEMPTS) {
    throw new Error(`تجاوزت العملية الحد الأقصى لإعادة المحاولة (${MAX_OFFLINE_ATTEMPTS}).`);
  }
  const attempts = existing.attempts + 1;
  const delay = Math.min(MAX_RETRY_DELAY_MS, INITIAL_RETRY_DELAY_MS * 2 ** (attempts - 1));
  persist(queue.map((item) => item.operationId === operationId
    ? { ...item, attempts, nextAttemptAt: new Date(now + delay).toISOString() }
    : item));
}

export async function drainOfflineOperations(
  processor: (operation: OfflineOperation) => Promise<void>,
  userId?: string,
  now = Date.now(),
): Promise<{ processed: number; failed: number }> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { processed: 0, failed: 0 };
  const operations = pendingOfflineOperations(userId);
  let processed = 0;
  let failed = 0;
  for (const operation of operations) {
    if (operation.nextAttemptAt && Date.parse(operation.nextAttemptAt) > now) continue;
    try {
      await processor(operation);
      removeOfflineOperation(operation.operationId);
      processed += 1;
    } catch {
      markOfflineOperationAttempt(operation.operationId, now);
      failed += 1;
    }
  }
  return { processed, failed };
}

export function clearOfflineQueue(userId?: string): void {
  if (!userId || !UUID_PATTERN.test(userId.trim())) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const normalized = userId.trim();
  persist(read<unknown>().filter((item) => item.userId !== normalized));
}
