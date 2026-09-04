import { requireSupabase } from '../lib/supabase';

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

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export async function getCatalog(search = '', categoryId: string | null = null, limit = DEFAULT_LIMIT, offset = 0) {
  const client = requireSupabase();
  const safeSearch = search.trim().slice(0, 120);
  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), MAX_LIMIT) : DEFAULT_LIMIT;
  const safeOffset = Number.isInteger(offset) ? Math.max(offset, 0) : 0;
  const { data, error } = await client.rpc('get_catalog', {
    p_search: safeSearch || null,
    p_category_id: categoryId,
    p_limit: safeLimit,
    p_offset: safeOffset
  });
  if (error) throw error;
  return (data ?? []) as CatalogItem[];
}

export async function getProductImageUrls(paths: Array<string | null>) {
  const client = requireSupabase();
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return new Map<string, string>();
  const { data, error } = await client.storage.from('product-media').createSignedUrls(uniquePaths, 3600);
  if (error) throw error;
  return new Map((data ?? []).flatMap((item, index) => item.signedUrl ? [[uniquePaths[index], item.signedUrl] as const] : []));
}
