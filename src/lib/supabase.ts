import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Server-side only client (no browser exposure, no session persistence).
// Astro's `import.meta.env` does not always surface non-PUBLIC_ vars at
// runtime depending on the adapter, so fall back to `process.env`
// (available in the Node/Vercel serverless runtime) when needed.
//
// Built lazily (and memoized) instead of at module top-level: creating it
// eagerly would throw at import time if an env var is missing, which
// happens above the calling endpoint's try/catch and produces an opaque
// 500. Deferring creation into the endpoint's try/catch lets a missing env
// surface as the normal `{ok:false,error:'server'}` response instead.
let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient

  const supabaseUrl = import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL/SUPABASE_ANON_KEY')
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })

  return cachedClient
}
