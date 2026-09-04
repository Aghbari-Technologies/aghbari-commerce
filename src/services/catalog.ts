import { requireSupabase } from '../lib/supabase';
import { normalizeCatalogQuery } from '../domain/catalog';
import { retryRead } from '../lib/retry';

export interface CatalogItem {
  id: string; sku: string; name: string; unit: string; category_id: string | null; description: string | null;
  status: string; available_quantity: number; image_path: string | null; authorized_price: number | null; currency: string;
}
const SIGNED_URL_TTL_SECONDS = 3600;
const SIGNED_URL_REUSE_MS = 50 * 60 * 1000;
const imageUrlCache = new Map<string, { url: string; expiresAt: number }>();
function finiteNumber(value: unknown, fallback = 0): number { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
export async function getCatalog(search = '', categoryId: string | null = null, limit = 24, offset = 0) {
  const query = normalizeCatalogQuery(search, limit, offset);
  const { data } = await retryRead(() => requireSupabase().rpc('get_catalog', { p_search: query.search || null, p_category_id: categoryId, p_limit: query.limit, p_offset: query.offset }).then((result) => { if (result.error) throw result.error; return result; }));
  return (data ?? []).map((item) => ({ ...(item as Omit<CatalogItem, 'available_quantity' | 'authorized_price'>), available_quantity: finiteNumber(item.available_quantity), authorized_price: item.authorized_price == null ? null : finiteNumber(item.authorized_price, 0) })) as CatalogItem[];
}
export async function getProductImageUrls(paths: Array<string | null>) {
  const client = requireSupabase(); const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return new Map<string, string>();
  const now = Date.now(); const result = new Map<string, string>(); const missing: string[] = [];
  for (const path of uniquePaths) { const cached = imageUrlCache.get(path); if (cached && cached.expiresAt > now) result.set(path, cached.url); else missing.push(path); }
  if (missing.length) {
    const { data } = await retryRead(() => client.storage.from('product-media').createSignedUrls(missing, SIGNED_URL_TTL_SECONDS).then((response) => { if (response.error) throw response.error; return response; }));
    for (const [index, item] of (data ?? []).entries()) { const path = missing[index]; if (!path || !item.signedUrl) continue; imageUrlCache.set(path, { url: item.signedUrl, expiresAt: now + SIGNED_URL_REUSE_MS }); result.set(path, item.signedUrl); }
  }
  return result;
}
