import type { CatalogItem } from './catalog';

const STORAGE_KEY = 'aghbari.catalog.cache.v1';
export const MAX_CATALOG_CACHE_ENTRIES = 6;
export const MAX_CATALOG_CACHE_ITEMS = 48;
export const MAX_CATALOG_CACHE_BYTES = 96 * 1024;
export const CATALOG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  key: string;
  scope: string;
  search: string;
  categoryId: string | null;
  fetchedAt: string;
  items: CatalogItem[];
}

function validItem(value: unknown): value is CatalogItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CatalogItem>;
  return typeof item.id === 'string'
    && typeof item.sku === 'string' && item.sku.trim().length > 0
    && (item.barcode === null || typeof item.barcode === 'string')
    && typeof item.name === 'string' && item.name.trim().length > 0
    && typeof item.unit === 'string' && item.unit.trim().length > 0
    && (item.category_id === null || typeof item.category_id === 'string')
    && (item.description === null || typeof item.description === 'string')
    && typeof item.status === 'string'
    && typeof item.available_quantity === 'number' && Number.isFinite(item.available_quantity)
    && (item.image_path === null || typeof item.image_path === 'string')
    && (item.authorized_price === null || (typeof item.authorized_price === 'number' && Number.isFinite(item.authorized_price) && item.authorized_price >= 0))
    && typeof item.currency === 'string' && /^[A-Z]{3}$/.test(item.currency);
}

function readEntries(): CacheEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is CacheEntry => {
      if (!value || typeof value !== 'object') return false;
      const entry = value as Partial<CacheEntry>;
      if (typeof entry.key !== 'string' || typeof entry.scope !== 'string' || entry.scope.trim() === '' || typeof entry.search !== 'string' || (entry.categoryId !== null && typeof entry.categoryId !== 'string')) return false;
      if (typeof entry.fetchedAt !== 'string' || Number.isNaN(Date.parse(entry.fetchedAt))) return false;
      return Array.isArray(entry.items) && entry.items.length <= MAX_CATALOG_CACHE_ITEMS && entry.items.every(validItem);
    });
  } catch {
    return [];
  }
}

function writeEntries(entries: CacheEntry[]) {
  const normalized = entries
    .slice(0, MAX_CATALOG_CACHE_ENTRIES)
    .map((entry) => ({ ...entry, items: entry.items.slice(0, MAX_CATALOG_CACHE_ITEMS) }));

  try {
    let candidate = normalized;
    while (candidate.length) {
      const encoded = JSON.stringify(candidate);
      if (new TextEncoder().encode(encoded).byteLength <= MAX_CATALOG_CACHE_BYTES) {
        localStorage.setItem(STORAGE_KEY, encoded);
        return;
      }
      candidate = candidate.slice(0, -1);
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Cache is an optimization only. A full/unavailable store must never break catalog UX.
  }
}

function cacheKey(scope: string, search: string, categoryId: string | null) {
  return JSON.stringify([scope.trim(), search.trim(), categoryId]);
}

export function cacheCatalogSnapshot(scope: string, search: string, categoryId: string | null, items: CatalogItem[], fetchedAt = new Date()) {
  if (typeof localStorage === 'undefined' || !scope.trim()) return;
  const safeItems = items.filter(validItem).slice(0, MAX_CATALOG_CACHE_ITEMS);
  if (!safeItems.length) return;
  const entry: CacheEntry = {
    key: cacheKey(scope, search, categoryId),
    scope: scope.trim(),
    search: search.trim(),
    categoryId,
    fetchedAt: fetchedAt.toISOString(),
    items: safeItems
  };
  const next = [
    entry,
    ...readEntries().filter((item) => item.key !== entry.key)
  ];
  writeEntries(next);
}

export function getCachedCatalogSnapshot(scope: string, search: string, categoryId: string | null, now = Date.now()): CatalogItem[] {
  if (typeof localStorage === 'undefined' || !scope.trim()) return [];
  const key = cacheKey(scope, search, categoryId);
  const entry = readEntries().find((item) => item.key === key && item.scope === scope.trim());
  if (!entry) return [];
  const age = now - Date.parse(entry.fetchedAt);
  if (age < 0 || age > CATALOG_CACHE_TTL_MS) return [];
  return entry.items.slice(0, MAX_CATALOG_CACHE_ITEMS);
}

export function clearCatalogCache() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
