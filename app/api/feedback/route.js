import { getSupabaseClient } from '@/lib/supabase'
import { isBot, validateFeedback } from '@/lib/validation'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    if (isBot(body)) return Response.json({ ok: true })
    const v = validateFeedback(body)
    if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400 })
    const { error } = await getSupabaseClient().from('feedback').insert(v.data)
    if (error) return Response.json({ ok: false, error: 'db' }, { status: 500 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
