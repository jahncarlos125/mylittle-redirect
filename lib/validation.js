const MAX = { name: 120, email: 200, kind: 20, message: 2000 }
const FEEDBACK_KINDS = ['bug', 'ideia', 'elogio', 'outro']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(s) { return typeof s === 'string' && EMAIL_RE.test(s.trim()) }
export function sanitize(s, max) { return typeof s === 'string' ? s.trim().slice(0, max) : '' }
export function isBot(body) {
  return !!(body && typeof body === 'object' && typeof body.website === 'string' && body.website.trim() !== '')
}
export function validateSignup(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'dados invalidos' }
  const name = sanitize(body.name, MAX.name)
  const email = sanitize(body.email, MAX.email)
  if (!name) return { ok: false, error: 'nome obrigatorio' }
  if (!isValidEmail(email)) return { ok: false, error: 'email invalido' }
  return { ok: true, data: { name, email, source: 'site' } }
}
export function validateFeedback(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'dados invalidos' }
  const kind = sanitize(body.kind, MAX.kind)
  const message = sanitize(body.message, MAX.message)
  const name = body.name ? sanitize(body.name, MAX.name) : null
  if (!FEEDBACK_KINDS.includes(kind)) return { ok: false, error: 'tipo invalido' }
  if (!message) return { ok: false, error: 'mensagem obrigatoria' }
  return { ok: true, data: { name, kind, message } }
}
