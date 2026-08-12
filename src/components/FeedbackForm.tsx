import { useId, useState, type FormEvent } from 'react'
import './FeedbackForm.css'

type Status = 'idle' | 'enviando' | 'ok' | 'erro'
type Kind = 'bug' | 'ideia' | 'elogio' | 'outro'

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'ideia', label: 'Ideia' },
  { value: 'elogio', label: 'Elogio' },
  { value: 'outro', label: 'Outro' },
]

const GENERIC_ERROR = 'Algo deu errado. Tente de novo em instantes.'

export default function FeedbackForm() {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<Kind>('bug')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const nameId = useId()
  const kindId = useId()
  const messageId = useId()
  const websiteId = useId()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedMessage = message.trim()
    const validKind = KIND_OPTIONS.some((opt) => opt.value === kind)

    if (!trimmedMessage || !validKind) {
      setStatus('erro')
      setError('Escreva sua mensagem antes de enviar.')
      return
    }

    setStatus('enviando')
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          kind,
          message: trimmedMessage,
          website,
        }),
      })
      const data = await res.json().catch(() => ({ ok: false }))

      if (res.ok && data.ok) {
        setStatus('ok')
        setName('')
        setMessage('')
        setWebsite('')
      } else {
        setStatus('erro')
        setError(GENERIC_ERROR)
      }
    } catch {
      setStatus('erro')
      setError('Não foi possível enviar agora. Verifique sua conexão e tente de novo.')
    }
  }

  const sending = status === 'enviando'

  return (
    <section className="feedback" id="feedback" aria-labelledby="feedback-title">
      <div className="feedback__intro">
        <h2 id="feedback-title">Manda seu feedback</h2>
        <p>Achou um bug, teve uma ideia ou só quer elogiar? Conta pra gente.</p>
      </div>

      <form className="feedback__form" method="post" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={nameId}>Nome (opcional)</label>
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor={kindId}>Tipo</label>
          <select
            id={kindId}
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
          >
            {KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={messageId}>Mensagem</label>
          <textarea
            id={messageId}
            name="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Honeypot: real users never see or reach this field. Hidden off-screen (not
            display:none, so bots that inspect visibility still find it), unreachable by
            keyboard (tabIndex -1), excluded from autofill, and hidden from assistive tech. */}
        <p className="visually-hidden">
          <label htmlFor={websiteId}>Deixe este campo em branco</label>
          <input
            id={websiteId}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </p>

        <button type="submit" className="feedback__submit" disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar feedback'}
        </button>

        <p className="feedback__status" role="status" aria-live="polite">
          {status === 'ok' && 'Valeu pelo feedback! A gente vai dar uma olhada.'}
          {status === 'erro' && (error || GENERIC_ERROR)}
        </p>
      </form>
    </section>
  )
}
