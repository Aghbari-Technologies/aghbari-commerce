import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Keep the runtime guard semantics while exposing a stable client type to
// TypeScript. Callers that require a configured client must still guard or
// use requireSupabase(); this avoids false-positive narrowing failures inside
// asynchronous React closures.
export const supabase = (url && anonKey ? createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null) as ReturnType<typeof createClient> | null;

export function requireSupabase() {
  if (!supabase) throw new Error('Supabase runtime configuration is missing');
  return supabase;
}
