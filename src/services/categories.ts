import { requireSupabase } from '../lib/supabase';

export interface CategoryOption {
  id: string;
  name: string;
  parent_id: string | null;
}

export async function getCategories(): Promise<CategoryOption[]> {
  const { data, error } = await requireSupabase()
    .from('categories')
    .select('id, name, parent_id')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as CategoryOption[];
}
