import type { APIRoute } from 'astro'
import { supabase } from '../../lib/supabase'
import { isBot, validateFeedback } from '../../lib/validation'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}))
    if (isBot(body)) return Response.json({ ok: true })

    const v = validateFeedback(body)
    if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400 })

    const { error } = await supabase.from('feedback').insert(v.data)
    if (error) return Response.json({ ok: false, error: 'db' }, { status: 500 })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
