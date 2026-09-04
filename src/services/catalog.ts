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

export async function getCatalog(search = '', categoryId: string | null = null, limit = 24, offset = 0) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('get_catalog', {
    p_search: search || null,
    p_category_id: categoryId,
    p_limit: limit,
    p_offset: offset
  });
  if (error) throw error;
  return (data ?? []) as CatalogItem[];
}
