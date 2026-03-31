import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return client;
}

// Alias for convenience
export const supabaseClient = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    return (getSupabaseClient() as Record<string | symbol, unknown>)[prop];
  },
});
