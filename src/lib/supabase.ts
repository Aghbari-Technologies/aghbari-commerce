import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Runtime-safe Supabase client.
 *
 * The repository currently does not ship generated Database typings, while the
 * application calls a versioned set of RPC contracts. Keep the runtime client
 * strongly guarded without inventing stale generated types: service modules
 * own their response validation and the database remains authoritative through
 * RLS and server-side RPC authorization.
 */
export const supabase: SupabaseClient = (url && anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null) as unknown as SupabaseClient;

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase runtime configuration is missing');
  return supabase;
}
