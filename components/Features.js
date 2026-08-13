import Image from "next/image";

/**
 * Cena 4: creme, mesma família do Manifesto — quatro pilares do app em
 * cards com screenshot real. O card "Claro & escuro" foge do padrão 1
 * screenshot por card e mostra o PAR hoje-light + hoje-dark lado a lado,
 * porque é o próprio contraste entre as duas imagens que demonstra o
 * recurso (nenhum texto substitui isso). O reveal com stagger visual vem
 * de data-animate="up" em cada card — cada um tem seu próprio
 * ScrollTrigger (ver components/Landing.js), então entram em sequência
 * conforme o usuário rola. O hover-lift é CSS puro, gated por
 * prefers-reduced-motion em app/globals.css.
 */
const FEATURES = [
  {
    title: "Lembretes na hora certa",
    text: "A tela do dia reúne os remédios certos, no horário certo — sem precisar adivinhar nada.",
    media: (
      <Image
        className="feature-card__shot"
        src="/screenshots/hoje-light.webp"
        alt="Tela “Hoje” do app Meu Cuidado, com a lista de lembretes de remédios do dia"
        width={200}
        height={445}
        loading="lazy"
      />
    ),
  },
  {
    title: "Cuide da família",
    text: "Acompanhe os remédios de pais, filhos ou de quem você cuida — tudo no mesmo lugar.",
    media: (
      <Image
        className="feature-card__shot"
        src="/screenshots/pessoas-light.webp"
        alt="Tela “Pessoas” do app Meu Cuidado, com a lista de familiares acompanhados"
        width={200}
        height={445}
        loading="lazy"
      />
    ),
  },
  {
    title: "Tudo organizado",
    text: "Nome, dose e horário de cada remédio, sempre à mão, sem post-it nem caderno de anotações.",
    media: (
      <Image
        className="feature-card__shot"
        src="/screenshots/remedios-light.webp"
        alt="Tela “Remédios” do app Meu Cuidado, com a lista completa de medicamentos cadastrados"
        width={200}
        height={445}
        loading="lazy"
      />
    ),
  },
  {
    title: "Claro & escuro",
    text: "O app se adapta ao seu momento do dia — troque de tema com um toque, quando quiser.",
    pair: true,
    media: (
      <>
        <Image
          className="feature-card__shot feature-card__shot--pair"
          src="/screenshots/hoje-light.webp"
          alt="Tela “Hoje” do app Meu Cuidado no tema claro"
          width={110}
          height={245}
          loading="lazy"
        />
        <Image
          className="feature-card__shot feature-card__shot--pair"
          src="/screenshots/hoje-dark.webp"
          alt="Tela “Hoje” do app Meu Cuidado no tema escuro"
          width={110}
          height={245}
          loading="lazy"
        />
      </>
    ),
  },
];

export default function Features() {
  return (
    <section className="features" id="recursos">
      <div className="features__inner">
        <h2 className="features__title" data-animate="up">
          Pensado para o cuidado do dia a dia
        </h2>

        <div className="features__grid">
          {FEATURES.map((f) => (
            <article
              className={`feature-card${f.pair ? " feature-card--pair" : ""}`}
              data-animate="up"
              key={f.title}
            >
              <div className="feature-card__media">{f.media}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__text">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
