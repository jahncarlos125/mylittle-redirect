const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(s: unknown): boolean {
  return typeof s === 'string' && EMAIL_RE.test(s.trim())
}

export function sanitize(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

export function isBot(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const website = (body as Record<string, unknown>).website
  return typeof website === 'string' && website.trim().length > 0
}

type SignupInput = { name?: unknown; email?: unknown }
type SignupData = { name: string; email: string; source: string }
type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string }

export function validateSignup(body: SignupInput): ValidationResult<SignupData> {
  const name = sanitize(body?.name, 120)
  const email = sanitize(body?.email, 200)
  if (!name) return { ok: false, error: 'nome obrigatorio' }
  if (!isValidEmail(email)) return { ok: false, error: 'email invalido' }
  return { ok: true, data: { name, email, source: 'site' } }
}

const FEEDBACK_KINDS = ['bug', 'ideia', 'elogio', 'outro'] as const
type FeedbackKind = (typeof FEEDBACK_KINDS)[number]

type FeedbackInput = { name?: unknown; kind?: unknown; message?: unknown }
type FeedbackData = { name?: string; kind: FeedbackKind; message: string }

export function validateFeedback(body: FeedbackInput): ValidationResult<FeedbackData> {
  const kind = sanitize(body?.kind, 20)
  const message = sanitize(body?.message, 2000)
  if (!FEEDBACK_KINDS.includes(kind as FeedbackKind)) {
    return { ok: false, error: 'tipo invalido' }
  }
  if (!message) return { ok: false, error: 'mensagem obrigatoria' }
  const name = sanitize(body?.name, 120)
  const data: FeedbackData = { kind: kind as FeedbackKind, message }
  if (name) data.name = name
  return { ok: true, data }
}
