import { requireSupabase } from '../lib/supabase';
import { normalizeCatalogQuery } from '../domain/catalog';

export interface CatalogItem {
  id: string;
  sku: string;
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

export async function getCatalog(search = '', categoryId: string | null = null, limit = 24, offset = 0) {
  const client = requireSupabase();
  const query = normalizeCatalogQuery(search, limit, offset);
  const { data, error } = await client.rpc('get_catalog', {
    p_search: query.search || null,
    p_category_id: categoryId,
    p_limit: query.limit,
    p_offset: query.offset
  });
  if (error) throw error;
  return (data ?? []) as CatalogItem[];
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
    const { data, error } = await client.storage.from('product-media').createSignedUrls(missing, SIGNED_URL_TTL_SECONDS);
    if (error) throw error;
    for (const [index, item] of (data ?? []).entries()) {
      const path = missing[index];
      if (!path || !item.signedUrl) continue;
      imageUrlCache.set(path, { url: item.signedUrl, expiresAt: now + SIGNED_URL_REUSE_MS });
      result.set(path, item.signedUrl);
    }
  }

  return result;
}
