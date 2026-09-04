export type OfflineCommandKind = 'cart-draft' | 'order-submit';
export type QueuedCommand = { operationId: string; kind: OfflineCommandKind; payload: unknown; createdAt: string; attempts: number };

const DB_NAME = 'aghbari-commerce';
const STORE = 'offline_commands';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'operationId' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('OFFLINE_DB_OPEN_FAILED'));
  });
}

export function canQueueOffline(kind: OfflineCommandKind) {
  return kind === 'cart-draft' || kind === 'order-submit';
}

export async function enqueueOffline(command: Omit<QueuedCommand, 'createdAt' | 'attempts'>) {
  if (!canQueueOffline(command.kind)) throw new Error('OFFLINE_COMMAND_NOT_ALLOWED');
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...command, createdAt: new Date().toISOString(), attempts: 0 });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('OFFLINE_QUEUE_WRITE_FAILED')); };
  });
}

export async function listOfflineCommands(): Promise<QueuedCommand[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => { db.close(); resolve(request.result as QueuedCommand[]); };
    request.onerror = () => { db.close(); reject(request.error ?? new Error('OFFLINE_QUEUE_READ_FAILED')); };
  });
}

export async function removeOfflineCommand(operationId: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(operationId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('OFFLINE_QUEUE_DELETE_FAILED')); };
  });
}
