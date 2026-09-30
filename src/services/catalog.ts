import { requireSupabase } from '../lib/supabase';
import { normalizeCatalogQuery } from '../domain/catalog';
import { retryRead } from '../lib/retry';
import { cacheCatalogSnapshot, getCachedCatalogSnapshot } from './catalogCache';

export interface CatalogItem {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  unit: string;
  category_id: string | null;
  description: string | null;
  status: string;
  available_quantity: number;
  image_path: string | null;
  authorized_price: number | null;
  currency: string;
}

const SIGNED_URL_TTL_SECONDS = 3600;
const SIGNED_URL_REUSE_MS = 50 * 60 * 1000;
const imageUrlCache = new Map<string, { url: string; expiresAt: number }>();
const MAX_IMAGE_CACHE_ENTRIES = 250;
function cacheImageUrl(path: string, value: { url: string; expiresAt: number }) { if (!imageUrlCache.has(path) && imageUrlCache.size >= MAX_IMAGE_CACHE_ENTRIES) { const oldest = imageUrlCache.keys().next().value as string | undefined; if (oldest) imageUrlCache.delete(oldest); } imageUrlCache.set(path, value); }

function finiteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getCatalog(search = '', categoryId: string | null = null, limit = 24, offset = 0, warehouseId?: string, cacheScope = '') {
  const query = normalizeCatalogQuery(search, limit, offset);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return getCachedCatalogSnapshot(cacheScope, query.search, categoryId);
  }
  const client = requireSupabase();
  let resolvedWarehouseId = warehouseId;
  if (!resolvedWarehouseId) {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('يجب تسجيل الدخول لاختيار المستودع التشغيلي.');
    const { data: profile, error: profileError } = await client.from('profiles').select('organization_id').eq('id', userData.user.id).single();
    if (profileError) throw profileError;
    const { data, error } = await client.from('warehouses').select('id').eq('organization_id', profile.organization_id).eq('is_active', true).order('created_at').limit(1).maybeSingle();
    if (error) throw error;
    if (!data?.id) throw new Error('لا يوجد مستودع تشغيلي نشط.');
    resolvedWarehouseId = data.id;
  }
  const { data } = await retryRead(async () => {
    const result = await client.rpc('get_catalog_with_barcode', {
      p_search: query.search || null,
      p_category_id: categoryId,
      p_limit: query.limit,
      p_offset: query.offset,
      p_warehouse_id: resolvedWarehouseId
    });
    if (result.error) throw result.error;
    return result;
  });
  const normalized = (data ?? []).map((item: CatalogItem) => ({
    ...(item as Omit<CatalogItem, 'available_quantity' | 'authorized_price'>),
    available_quantity: finiteNumber(item.available_quantity),
    authorized_price: item.authorized_price == null ? null : finiteNumber(item.authorized_price, 0)
  })) as CatalogItem[];
  if (cacheScope.trim()) cacheCatalogSnapshot(cacheScope, query.search, categoryId, normalized);
  return normalized;
}

export async function getProductImageUrls(paths: Array<string | null>) {
  const client = requireSupabase();
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return new Map<string, string>();
  const now = Date.now();
  const result = new Map<string, string>();
  const missing: string[] = [];
  for (const path of uniquePaths) {
    const cached = imageUrlCache.get(path);
    if (cached && cached.expiresAt > now) result.set(path, cached.url);
    else missing.push(path);
  }
  if (missing.length) {
    const { data } = await retryRead(async () => {
      const response = await client.storage.from('product-media').createSignedUrls(missing, SIGNED_URL_TTL_SECONDS);
      if (response.error) throw response.error;
      return response;
    });
    for (const [index, item] of (data ?? []).entries()) {
      const path = missing[index];
      if (!path || !item.signedUrl) continue;
      cacheImageUrl(path, { url: item.signedUrl, expiresAt: now + SIGNED_URL_REUSE_MS });
      result.set(path, item.signedUrl);
    }
  }
  return result;
}


export async function getCatalogProductById(productId: string, warehouseId?: string): Promise<CatalogItem | null> {
  const normalizedId = productId.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedId)) throw new Error('معرّف الصنف غير صالح.');
  const client = requireSupabase();
  let resolvedWarehouseId = warehouseId;
  if (!resolvedWarehouseId) {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('يجب تسجيل الدخول لاختيار المستودع التشغيلي.');
    const { data: profile, error: profileError } = await client.from('profiles').select('organization_id').eq('id', userData.user.id).single();
    if (profileError) throw profileError;
    const { data, error } = await client.from('warehouses').select('id').eq('organization_id', profile.organization_id).eq('is_active', true).order('created_at').limit(1).maybeSingle();
    if (error) throw error;
    if (!data?.id) throw new Error('لا يوجد مستودع تشغيلي نشط.');
    resolvedWarehouseId = data.id;
  }
  const { data: identity } = await retryRead(async () => {
    const result = await client.from('products').select('id,sku').eq('id', normalizedId).maybeSingle();
    if (result.error) throw result.error;
    return result;
  });
  if (!identity?.sku) return null;
  const { data } = await retryRead(async () => {
    const result = await client.rpc('get_catalog_with_barcode', {
      p_search: identity.sku,
      p_category_id: null,
      p_limit: 5,
      p_offset: 0,
      p_warehouse_id: resolvedWarehouseId
    });
    if (result.error) throw result.error;
    return result;
  });
  const exact = (data ?? []).find((item: CatalogItem) => item.id === normalizedId);
  if (!exact) return null;
  return {
    ...exact,
    available_quantity: finiteNumber(exact.available_quantity),
    authorized_price: exact.authorized_price == null ? null : finiteNumber(exact.authorized_price, 0),
  };
}
