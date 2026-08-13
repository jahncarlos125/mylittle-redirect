"use client";

import { useId, useState } from "react";
import { isValidEmail } from "@/lib/validation";
import ParticleGlyph from "./ParticleGlyph";

/**
 * Cena 6: mint, form "Quero testar". Nome + e-mail vão pro POST /api/signup/
 * (barra final: trailingSlash:true no projeto redireciona 308 sem ela, e o
 * fetch não segue redirect de POST automaticamente). Honeypot "website"
 * escondido de vidente (.visually-hidden) e de leitor de tela (aria-hidden +
 * fora da ordem de tab); se preenchido, o servidor responde 200 silencioso —
 * o cliente mostra sucesso normalmente, sem entregar a armadilha ao bot.
 *
 * Estados idle|enviando|ok|erro, anunciados via role="status" aria-live, com
 * o botão desabilitado durante o envio. O ParticleGlyph ao lado é só
 * decorativo (aria-hidden na própria peça).
 */
export default function TestCta() {
  const uid = useId();
  const nameId = `${uid}-nome`;
  const emailId = `${uid}-email`;
  const websiteId = `${uid}-website`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

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
        setName("");
        setEmail("");
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
      ? "Valeu! Em breve te enviamos o link do teste."
      : status === "erro"
        ? errorMsg
        : status === "enviando"
          ? "Enviando…"
          : "";

  return (
    <section className="testcta" id="testar">
      <div className="testcta__inner">
        <div className="testcta__copy">
          <span className="badge badge--dark" data-animate="up">
            <span className="badge__dot" aria-hidden="true" />
            Em teste fechado · Android
          </span>

          <h2 className="testcta__title" data-animate="up">
            Quer ser um dos primeiros a testar?
          </h2>
          <p className="testcta__sub" data-animate="up">
            Estamos em teste fechado para Android. Deixe seu nome e e-mail e te
            avisamos assim que abrirmos uma vaga pra você.
          </p>

          <form
            className="testcta__form"
            method="post"
            onSubmit={handleSubmit}
            data-animate="up"
            noValidate
          >
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

            {/* Honeypot: escondido de vidente (.visually-hidden) e de leitor
                de tela (aria-hidden + fora da ordem de tab). Bots que
                preenchem formulários automaticamente costumam ignorar
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
              {enviando ? "Enviando…" : "Quero testar"}
            </button>

            <p className="form__status" role="status" aria-live="polite">
              {statusText}
            </p>
          </form>
        </div>

        <div className="testcta__glyph" aria-hidden="true">
          <ParticleGlyph />
        </div>
      </div>
    </section>
  );
}
