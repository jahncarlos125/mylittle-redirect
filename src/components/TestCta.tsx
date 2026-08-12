import { useId, useState, type FormEvent } from 'react'
import { isValidEmail } from '../lib/validation'
import './TestCta.css'

type Status = 'idle' | 'enviando' | 'ok' | 'erro'

const GENERIC_ERROR = 'Algo deu errado. Tente de novo em instantes.'

export default function TestCta() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const nameId = useId()
  const emailId = useId()
  const websiteId = useId()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !isValidEmail(trimmedEmail)) {
      setStatus('erro')
      setError('Preencha seu nome e um e-mail válido.')
      return
    }

    setStatus('enviando')
    setError('')

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, website }),
      })
      const data = await res.json().catch(() => ({ ok: false }))

      if (res.ok && data.ok) {
        setStatus('ok')
        setName('')
        setEmail('')
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
    <section className="test-cta" id="testar" aria-labelledby="test-cta-title">
      <div className="test-cta__intro">
        <span className="test-cta__badge">
          <span className="test-cta__badge-dot" aria-hidden="true" />
          Em teste fechado · Android
        </span>
        <h2 id="test-cta-title">Quero participar do teste</h2>
        <p>
          Estamos com um grupo pequeno testando o Meu Cuidado no Android antes do lançamento.
          Deixe seu nome e e-mail que avisamos assim que liberarmos o seu acesso.
        </p>
      </div>

      <form className="test-cta__form" method="post" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={nameId}>Nome</label>
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor={emailId}>E-mail</label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="test-cta__submit" disabled={sending}>
          {sending ? 'Enviando…' : 'Quero testar'}
        </button>

        <p className="test-cta__status" role="status" aria-live="polite">
          {status === 'ok' && 'Valeu! Em breve te enviamos o link do teste.'}
          {status === 'erro' && (error || GENERIC_ERROR)}
        </p>
      </form>
    </section>
  )
}
