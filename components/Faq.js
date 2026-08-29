"use client";

import { useId, useState } from "react";
import { PLAY_URL } from "@/lib/site";

const ITEMS = [
  {
    q: "Como instalo o Meu Cuidado?",
    a: (
      <>
        É só baixar grátis na{" "}
        <a href={PLAY_URL} target="_blank" rel="noopener">
          Google Play
        </a>{" "}
        e criar sua conta em segundos — nome, dose e horário do primeiro
        remédio e pronto.
      </>
    ),
  },
  {
    q: "O Meu Cuidado funciona no Android e no iOS?",
    a: "Por enquanto o Meu Cuidado está disponível só para Android, na Google Play. Uma versão para iOS ainda não tem data definida.",
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
    a: "Sim. O Meu Cuidado é gratuito, sem custos escondidos.",
  },
  {
    q: "Posso cuidar de mais de uma pessoa?",
    a: "Pode. Você adiciona quantos dependentes quiser — pais, filhos, avós — e ainda pode convidar outros cuidadores para acompanhar os remédios junto com você.",
  },
  {
    q: "Como eu dou feedback sobre o app?",
    a: (
      <>
        Escreva para{" "}
        <a href="mailto:contato@abisay.tech">contato@abisay.tech</a> a
        qualquer momento — a gente lê todas as mensagens.
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
