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
  const { data, error } = await client.storage.from('product-media').createSignedUrls(uniquePaths, 3600);
  if (error) throw error;
  return new Map((data ?? []).flatMap((item, index) => item.signedUrl ? [[uniquePaths[index], item.signedUrl] as const] : []));
}
