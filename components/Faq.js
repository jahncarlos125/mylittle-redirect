"use client";

import { useId, useState } from "react";

const ITEMS = [
  {
    q: "Como funciona o teste fechado?",
    a: "Você deixa nome e e-mail no formulário “Quero testar” desta página. Assim que abrirmos uma vaga, enviamos por e-mail o link para instalar o app e começar a usar.",
  },
  {
    q: "O Meu Cuidado funciona no Android e no iOS?",
    a: "Hoje o teste fechado é só para Android. Uma versão para iOS ainda não tem data definida.",
  },
  {
    q: "Meus dados e os dos meus dependentes estão seguros?",
    a: (
      <>
        Tratamos os dados com cuidado, só para o que o app precisa fazer.
        Você pode ver os detalhes completos na nossa{" "}
        <a href="/politica-de-privacidade/">Política de Privacidade</a>.
      </>
    ),
  },
  {
    q: "O app é gratuito?",
    a: "Sim. O Meu Cuidado é gratuito durante o teste fechado, sem custos escondidos.",
  },
  {
    q: "Como eu recebo o link do teste?",
    a: "Depois de se inscrever no formulário “Quero testar”, enviamos o link de instalação para o e-mail cadastrado assim que sua vaga for liberada.",
  },
  {
    q: "Como eu dou feedback sobre o app?",
    a: (
      <>
        Use o formulário “Deixe seu feedback” logo abaixo, ou escreva para{" "}
        <a href="mailto:abisaytech@gmail.com">abisaytech@gmail.com</a> a
        qualquer momento.
      </>
    ),
  },
];

/**
 * Cena 8: creme (mesma família do Manifesto/Recursos/Feedback). Acordeão
 * acessível: cada pergunta é um <button aria-expanded aria-controls>
 * dentro de um <h3>, controlando um painel <div id> associado só via
 * aria-controls (sem role="region" no painel — 6 landmarks "region" numa
 * página só de FAQ é ruído para leitores de tela; o padrão
 * button+aria-expanded+aria-controls já é suficiente e acessível). Um
 * item aberto por vez; clicar de novo fecha.
 *
 * A abertura/fechamento é só CSS (grid-template-rows 0fr↔1fr, ver
 * globals.css), sem JS medindo altura. Sob reduced-motion a transição
 * já cai pra ~instantânea pela regra global
 * `@media (prefers-reduced-motion: reduce){*{transition-duration:.001ms!important}}`
 * no topo de app/globals.css — nenhum código extra necessário aqui.
 */
export default function Faq() {
  const uid = useId();
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex((cur) => (cur === i ? null : i));
  }

  return (
    <section className="faq" id="faq">
      <div className="faq__inner">
        <h2 className="faq__title" data-animate="up">
          Perguntas frequentes
        </h2>

        <div className="faq__list" data-animate="up">
          {ITEMS.map((item, i) => {
            const open = openIndex === i;
            const buttonId = `${uid}-btn-${i}`;
            const panelId = `${uid}-panel-${i}`;
            return (
              <div className="faq__item" key={buttonId}>
                <h3 className="faq__q">
                  <button
                    type="button"
                    id={buttonId}
                    className="faq__trigger"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="faq__panel"
                  data-open={open}
                >
                  <div className="faq__panel-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
