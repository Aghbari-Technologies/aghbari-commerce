import { useEffect, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

export type Product = { id: string; sku: string; name: string; description: string; unit: string; image_path: string | null; status: string };

export function useProducts(enabled = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase && enabled));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!enabled || !supabase) { setLoading(false); return; }
    setLoading(true); setError(null);
    (async () => {
      const { data, error: queryError } = await supabase.schema('app').from('products').select('id,sku,name,description,unit,image_path,status').eq('status','active').order('name').limit(100);
      if (!active) return;
      if (queryError) setError(queryError.message); else setProducts((data ?? []) as Product[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [enabled]);
  return { products, loading, error };
}
