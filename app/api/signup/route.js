import { getSupabaseClient } from '@/lib/supabase'
import { isBot, validateSignup } from '@/lib/validation'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    if (isBot(body)) return Response.json({ ok: true })
    const v = validateSignup(body)
    if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400 })
    const { error } = await getSupabaseClient().from('test_signups').insert(v.data)
    if (error) return Response.json({ ok: false, error: 'db' }, { status: 500 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
