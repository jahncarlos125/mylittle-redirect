"use client";

import { useId, useState } from "react";
import { isValidEmail } from "@/lib/validation";
import ParticleGlyph from "./ParticleGlyph";

const INTENTS = [
  { value: "testar", label: "Quero testar o app" },
  { value: "feedback", label: "Enviar um feedback" },
  { value: "outro", label: "Outro assunto" },
];

const KINDS = [
  { value: "bug", label: "Bug" },
  { value: "ideia", label: "Ideia" },
  { value: "elogio", label: "Elogio" },
];

/**
 * Cena 6: mint, form único de contato (substitui os antigos TestCta +
 * FeedbackForm — dois formulários separados na mesma página confundiam:
 * "deixar só um e a pessoa escolhe o que quer"). Mantém o id "testar" (Nav
 * e Hero apontam pra cá) e o ParticleGlyph decorativo do TestCta.
 *
 * Seletor de intenção acessível: <fieldset>+<legend> com 3 radios reais
 * estilizados como chips (ver .intent-chip em app/globals.css) — navegável
 * por teclado como qualquer grupo de radio nativo. Os campos abaixo mudam
 * conforme a intenção:
 *   - "testar"   → nome + e-mail → POST /api/signup/
 *   - "feedback" → nome opcional + tipo (bug/ideia/elogio) + mensagem
 *   - "outro"    → nome opcional + mensagem, kind fixo "outro"
 * feedback/outro postam os dois pro mesmo POST /api/feedback/ (barra final
 * — trailingSlash:true no projeto redireciona 308 sem ela, e o fetch não
 * segue redirect de POST automaticamente).
 *
 * Honeypot "website" escondido de vidente (.visually-hidden) e de leitor de
 * tela (aria-hidden + fora da ordem de tab), comum às duas rotas. Validação
 * client espelha o servidor (lib/validation.js). Estados
 * idle|enviando|ok|erro, anunciados via role="status" aria-live — o
 * parágrafo de status fica sempre montado (mesmo vazio) pra não sumir/
 * reaparecer do DOM a cada mudança de estado.
 */
export default function ContactForm() {
  const uid = useId();
  const intentName = `${uid}-intent`;
  const nameId = `${uid}-nome`;
  const emailId = `${uid}-email`;
  const kindId = `${uid}-tipo`;
  const messageId = `${uid}-mensagem`;
  const websiteId = `${uid}-website`;

  const [intent, setIntent] = useState("testar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState("bug");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function chooseIntent(value) {
    setIntent(value);
    setStatus("idle");
    setErrorMsg("");
  }

  function resetFields() {
    setName("");
    setEmail("");
    setKind("bug");
    setMessage("");
    setWebsite("");
  }

  async function postSignup() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setStatus("erro");
      setErrorMsg("Preencha seu nome.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setStatus("erro");
      setErrorMsg("Digite um e-mail válido.");
      return;
    }

    setStatus("enviando");
    try {
      const res = await fetch("/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("ok");
        resetFields();
      } else {
        setStatus("erro");
        setErrorMsg("Não deu pra enviar agora. Tente de novo em instantes.");
      }
    } catch {
      setStatus("erro");
      setErrorMsg("Sem conexão. Tente de novo em instantes.");
    }
  }

  async function postFeedback() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("erro");
      setErrorMsg("Escreva sua mensagem.");
      return;
    }

    const payloadKind = intent === "feedback" ? kind : "outro";

    setStatus("enviando");
    try {
      const res = await fetch("/api/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), kind: payloadKind, message: trimmedMessage, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("ok");
        resetFields();
      } else {
        setStatus("erro");
        setErrorMsg("Não deu pra enviar agora. Tente de novo em instantes.");
      }
    } catch {
      setStatus("erro");
      setErrorMsg("Sem conexão. Tente de novo em instantes.");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (intent === "testar") postSignup();
    else postFeedback();
  }

  const enviando = status === "enviando";

  const submitLabel =
    intent === "testar" ? "Quero testar →" : intent === "feedback" ? "Enviar feedback →" : "Enviar mensagem →";

  const okMessage =
    intent === "testar"
      ? "Valeu! Em breve te enviamos o link do teste."
      : "Feedback enviado! Obrigado por ajudar a melhorar o Meu Cuidado.";

  const statusText =
    status === "ok" ? okMessage : status === "erro" ? errorMsg : status === "enviando" ? "Enviando…" : "";

  return (
    <section className="contact" id="testar">
      <div className="contact__inner">
        <div className="contact__copy">
          <span className="badge badge--dark" data-animate="up">
            <span className="badge__dot" aria-hidden="true" />
            Fale com a gente
          </span>

          <h2 className="contact__title" data-animate="up">
            Bora participar?
          </h2>
          <p className="contact__sub" data-animate="up">
            Escolha o que você quer fazer abaixo — a gente responde
            rapidinho.
          </p>

          <form
            className="contact__form"
            method="post"
            onSubmit={handleSubmit}
            data-animate="up"
            noValidate
          >
            <fieldset className="contact__intent">
              <legend className="contact__intent-legend">O que você quer fazer?</legend>
              <div className="contact__intent-options">
                {INTENTS.map((opt) => (
                  <label
                    key={opt.value}
                    className="intent-chip"
                    data-checked={intent === opt.value ? "true" : undefined}
                  >
                    <input
                      className="visually-hidden"
                      type="radio"
                      name={intentName}
                      value={opt.value}
                      checked={intent === opt.value}
                      onChange={() => chooseIntent(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {intent === "testar" && (
              <>
                <div className="field">
                  <label className="field__label" htmlFor={nameId}>
                    Nome
                  </label>
                  <input
                    className="field__input"
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
                  <label className="field__label" htmlFor={emailId}>
                    E-mail
                  </label>
                  <input
                    className="field__input"
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </>
            )}

            {intent === "feedback" && (
              <>
                <div className="field">
                  <label className="field__label" htmlFor={nameId}>
                    Nome <span className="field__optional">(opcional)</span>
                  </label>
                  <input
                    className="field__input"
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor={kindId}>
                    Tipo
                  </label>
                  <select
                    className="field__input field__select"
                    id={kindId}
                    name="kind"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    {KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor={messageId}>
                    Mensagem
                  </label>
                  <textarea
                    className="field__input field__textarea"
                    id={messageId}
                    name="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </>
            )}

            {intent === "outro" && (
              <>
                <div className="field">
                  <label className="field__label" htmlFor={nameId}>
                    Nome <span className="field__optional">(opcional)</span>
                  </label>
                  <input
                    className="field__input"
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor={messageId}>
                    Mensagem
                  </label>
                  <textarea
                    className="field__input field__textarea"
                    id={messageId}
                    name="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Honeypot: escondido de vidente (.visually-hidden) e de
                leitor de tela (aria-hidden + fora da ordem de tab). Bots
                que preenchem formulários automaticamente costumam ignorar
                aria-hidden/CSS e acabam populando este campo. */}
            <input
              className="visually-hidden"
              id={websiteId}
              name="website"
              type="text"
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <button className="btn btn--dark" type="submit" disabled={enviando}>
              {enviando ? "Enviando…" : submitLabel}
            </button>

            <p className="form__status" role="status" aria-live="polite">
              {statusText}
            </p>
          </form>
        </div>

        <div className="contact__glyph" aria-hidden="true">
          <ParticleGlyph />
        </div>
      </div>
    </section>
  );
}
