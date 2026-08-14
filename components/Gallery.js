import Image from "next/image";

/**
 * Cena 5: teal escura, showcase das telas do app. O parallax das colunas
 * (velocidades levemente diferentes) é aplicado pelo handler genérico
 * [data-parallax] em components/Landing.js — este componente só marca as
 * colunas com data-parallax/data-parallax-speed, sem lógica de motion
 * própria (mesmo padrão de data-animate/data-magnetic/data-tilt usado nas
 * demais seções). Isso mantém o comportamento sob prefers-reduced-motion
 * centralizado num único lugar: se reduced, o handler central nem roda e a
 * galeria fica estática.
 *
 * Sem hijack de scroll (nenhum listener de wheel, nenhum preventDefault) e
 * sem overflow horizontal do body: o parallax só move yPercent, e o
 * .gallery__stage tem overflow:hidden para conter esse deslocamento
 * vertical dentro da cena.
 */
const SCREENS = {
  hojeLight: {
    src: "/screenshots/hoje-light.webp",
    alt: "Tela “Hoje” do app Meu Cuidado, tema claro, com os lembretes do dia",
  },
  hojeDark: {
    src: "/screenshots/hoje-dark.webp",
    alt: "Tela “Hoje” do app Meu Cuidado, tema escuro, com os lembretes do dia",
  },
  pessoasLight: {
    src: "/screenshots/pessoas-light.webp",
    alt: "Tela “Pessoas” do app Meu Cuidado, tema claro, com a família acompanhada",
  },
  pessoasDark: {
    src: "/screenshots/pessoas-dark.webp",
    alt: "Tela “Pessoas” do app Meu Cuidado, tema escuro, com a família acompanhada",
  },
  remediosLight: {
    src: "/screenshots/remedios-light.webp",
    alt: "Tela “Remédios” do app Meu Cuidado, com a lista de medicamentos cadastrados",
  },
  editarLight: {
    src: "/screenshots/editar-light.webp",
    alt: "Tela de edição de remédio do app Meu Cuidado, com nome, dose e horário",
  },
};

const COLUMNS = [
  { speed: 0.6, items: [SCREENS.hojeLight, SCREENS.pessoasDark] },
  { speed: 1.15, items: [SCREENS.hojeDark, SCREENS.remediosLight] },
  { speed: 0.75, items: [SCREENS.pessoasLight, SCREENS.editarLight] },
];

export default function Gallery() {
  return (
    <section className="gallery" id="galeria">
      <div className="gallery__inner">
        <h2 className="gallery__title" data-animate="up">
          Conheça as telas
        </h2>
        <p className="gallery__sub" data-animate="up">
          Um vislumbre do dia a dia do app — sozinho, em família, claro ou escuro.
        </p>
      </div>

      <div className="gallery__stage">
        <div className="gallery__track">
          {COLUMNS.map((col, i) => (
            <div
              className={`gallery__col${i % 2 === 1 ? " gallery__col--offset" : ""}`}
              data-parallax
              data-parallax-speed={col.speed}
              key={i}
            >
              {col.items.map((shot) => (
                <div className="gallery__frame" key={shot.src}>
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 767px) 64vw, (max-width: 1000px) 22vw, 220px"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
