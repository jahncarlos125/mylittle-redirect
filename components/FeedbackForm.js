"use client";

import { useId, useState } from "react";

const KINDS = [
  { value: "bug", label: "Bug" },
  { value: "ideia", label: "Ideia" },
  { value: "elogio", label: "Elogio" },
  { value: "outro", label: "Outro" },
];

/**
 * Cena 7: creme, form de feedback. Nome opcional; tipo (select) e mensagem
 * são obrigatórios. Mesmo contrato de POST /api/feedback/ (barra final —
 * trailingSlash:true) e mesmo honeypot/estado/aria-live do TestCta.
 */
export default function FeedbackForm() {
  const uid = useId();
  const nameId = `${uid}-nome`;
  const kindId = `${uid}-tipo`;
  const messageId = `${uid}-mensagem`;
  const websiteId = `${uid}-website`;

  const [name, setName] = useState("");
  const [kind, setKind] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!kind) {
      setStatus("erro");
      setErrorMsg("Escolha o tipo do feedback.");
      return;
    }
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("erro");
      setErrorMsg("Escreva sua mensagem.");
      return;
    }

    setStatus("enviando");
    try {
      const res = await fetch("/api/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), kind, message: trimmedMessage, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("ok");
        setName("");
        setKind("");
        setMessage("");
        setWebsite("");
      } else {
        setStatus("erro");
        setErrorMsg("Não deu pra enviar agora. Tente de novo em instantes.");
      }
    } catch {
      setStatus("erro");
      setErrorMsg("Sem conexão. Tente de novo em instantes.");
    }
  }

  const enviando = status === "enviando";
  const statusText =
    status === "ok"
      ? "Feedback enviado! Obrigado por ajudar a melhorar o Meu Cuidado."
      : status === "erro"
        ? errorMsg
        : status === "enviando"
          ? "Enviando…"
          : "";

  return (
    <section className="feedback" id="feedback">
      <div className="feedback__inner">
        <h2 className="feedback__title" data-animate="up">
          Deixe seu feedback
        </h2>
        <p className="feedback__sub" data-animate="up">
          Encontrou um problema, teve uma ideia ou só quer mandar um elogio?
          Conta pra gente.
        </p>

        <form
          className="feedback__form"
          method="post"
          onSubmit={handleSubmit}
          data-animate="up"
          noValidate
        >
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
              required
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="" disabled>
                Selecione…
              </option>
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

          {/* Honeypot — mesma técnica do TestCta: invisível de vidente e de
              leitor de tela, fora da ordem de tab. */}
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
            {enviando ? "Enviando…" : "Enviar feedback"}
          </button>

          <p className="form__status" role="status" aria-live="polite">
            {statusText}
          </p>
        </form>
      </div>
    </section>
  );
}
