import { beforeEach, describe, expect, it } from 'vitest';
import {
  cacheCatalogSnapshot,
  clearCatalogCache,
  getCachedCatalogSnapshot,
  MAX_CATALOG_CACHE_BYTES,
  MAX_CATALOG_CACHE_ENTRIES
} from './catalogCache';
import type { CatalogItem } from './catalog';

const item = (id: string, name = 'منتج') : CatalogItem => ({
  id,
  sku: 'SKU-'+id.slice(0, 4),
  barcode: null,
  name,
  unit: 'حبة',
  category_id: null,
  description: null,
  status: 'active',
  available_quantity: 10,
  image_path: null,
  authorized_price: 100,
  currency: 'YER'
});

const storage = new Map<string,string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key:string) => storage.get(key) ?? null,
    setItem: (key:string,value:string) => storage.set(key,value),
    removeItem: (key:string) => storage.delete(key)
  }
});

describe('bounded offline catalog cache', () => {
  beforeEach(() => {
    storage.clear();
    clearCatalogCache();
  });

  it('round-trips a validated catalog snapshot while preserving the requested key', () => {
    cacheCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'سكر', null, [item('11111111-1111-4111-8111-111111111111')], new Date(1000));
    expect(getCachedCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'سكر', null, 2000)).toHaveLength(1);
    expect(getCachedCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'زيت', null, 2000)).toHaveLength(0);
  });


  it('isolates snapshots by authenticated tenant/customer/warehouse/user context', () => {
    cacheCatalogSnapshot('org-a:customer-a:warehouse-a:user-a', 'سكر', null, [item('11111111-1111-4111-8111-111111111111', 'عميل أ')]);
    cacheCatalogSnapshot('org-b:customer-b:warehouse-b:user-b', 'سكر', null, [item('22222222-2222-4222-8222-222222222222', 'عميل ب')]);
    expect(getCachedCatalogSnapshot('org-a:customer-a:warehouse-a:user-a', 'سكر', null)[0]?.name).toBe('عميل أ');
    expect(getCachedCatalogSnapshot('org-b:customer-b:warehouse-b:user-b', 'سكر', null)[0]?.name).toBe('عميل ب');
    expect(getCachedCatalogSnapshot('org-c:customer-c:warehouse-c:user-c', 'سكر', null)).toHaveLength(0);
  });

  it('expires stale snapshots instead of treating them as authoritative', () => {
    cacheCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'سكر', null, [item('11111111-1111-4111-8111-111111111111')], new Date(1000));
    expect(getCachedCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'سكر', null, 1000 + 24*60*60*1000)).toHaveLength(1);
    expect(getCachedCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'سكر', null, 1000 + 24*60*60*1000 + 1)).toHaveLength(0);
  });

  it('rejects malformed persisted records', () => {
    storage.set('aghbari.catalog.cache.v1', JSON.stringify([{
      key: 'bad', search: '', categoryId: null, fetchedAt: new Date().toISOString(),
      items: [{ id: 'bad', sku: '', barcode: null, name: '', unit: '', category_id: null, description: null, status: 'active', available_quantity: 1, image_path: null, authorized_price: 1, currency: 'YER' }]
    }]));
    expect(getCachedCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', '', null)).toHaveLength(0);
  });

  it('bounds cache entry count and never exceeds the storage budget', () => {
    for (let i=0;i<MAX_CATALOG_CACHE_ENTRIES+3;i++) {
      const id = '00000000-0000-4000-8000-'+String(i).padStart(12,'0');
      cacheCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'q'+i, null, [item(id)]);
    }
    const raw = storage.get('aghbari.catalog.cache.v1') ?? '';
    expect(JSON.parse(raw)).toHaveLength(MAX_CATALOG_CACHE_ENTRIES);
    expect(new TextEncoder().encode(raw).byteLength).toBeLessThanOrEqual(MAX_CATALOG_CACHE_BYTES);
  });

  it('does not fail catalog caching when the storage budget is too small for an oversized item set', () => {
    const huge = item('99999999-9999-4999-8999-999999999999', 'x'.repeat(MAX_CATALOG_CACHE_BYTES));
    expect(() => cacheCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'huge', null, [huge])).not.toThrow();
    expect(getCachedCatalogSnapshot('org-1:customer-1:warehouse-1:user-1', 'huge', null)).toHaveLength(0);
  });
});
