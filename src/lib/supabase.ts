import { createClient } from '@supabase/supabase-js'

// Server-side only client (no browser exposure, no session persistence).
// Astro's `import.meta.env` does not always surface non-PUBLIC_ vars at
// runtime depending on the adapter, so fall back to `process.env`
// (available in the Node/Vercel serverless runtime) when needed.
const supabaseUrl = import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
  auth: { persistSession: false },
})
