/**
 * Cena 3: teal, mesma família do Hero. Três passos como <ol> semântico —
 * a numeração "de verdade" fica a cargo do próprio <ol> para leitores de
 * tela; o número grande e o ícone em cada <li> são só decoração
 * (aria-hidden). A seção carrega data-pin: o useGSAP central (Landing.js)
 * prende (`pin`) a seção por um trecho curto de scroll enquanto a barra de
 * progresso e os números destacam os passos, e aplica um parallax leve nos
 * ícones — tudo isso pulado sob prefers-reduced-motion (ver Landing.js).
 */
const STEPS = [
  {
    title: "Cadastra o remédio",
    text: "Nome, dose e horário — leva menos de um minuto pra cada remédio.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="3" y="9.5" width="18" height="5" rx="2.5" transform="rotate(-45 12 12)" />
        <line x1="9.5" y1="14.5" x2="14.5" y2="9.5" />
      </svg>
    ),
  },
  {
    title: "Recebe o lembrete na hora certa",
    text: "Uma notificação chega no momento certo, sem precisar ficar de olho no relógio.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: "Marca como tomado",
    text: "Um toque confirma — e quem cuida à distância também fica sabendo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.6 2.6L16 9.5" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="how" id="como-funciona" data-pin>
      <div className="how__inner">
        <h2 className="how__title" data-animate="up">
          Como funciona
        </h2>
        <p className="how__sub" data-animate="up">
          Três passos simples, pensados pra quem cuida.
        </p>

        <span className="how__track" aria-hidden="true">
          <span className="how__track-fill" data-progress-fill />
        </span>

        <ol className="how__steps">
          {STEPS.map((step, i) => (
            <li className="step" data-animate="up" key={step.title}>
              <span className="step__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="step__icon" aria-hidden="true">
                {step.icon}
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
