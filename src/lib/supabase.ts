import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// The runtime value remains null when configuration is missing; the asserted
// client type prevents TypeScript from losing the narrowing across async
// closures. Callers that need a configured client must still use a runtime
// guard or requireSupabase().
export const supabase = (url && anonKey ? createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null) as ReturnType<typeof createClient>;

export function requireSupabase() {
  if (!supabase) throw new Error('Supabase runtime configuration is missing');
  return supabase;
}
