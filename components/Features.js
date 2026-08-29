import Image from "next/image";

/**
 * Cena 4 (creme): Recursos como "cenas" full-width alternadas, inspirado em
 * whatsapp.com — cada recurso é um bloco próprio (texto de um lado, print
 * de celular grande do outro), com bastante respiro vertical entre blocos.
 * O lado alterna a cada bloco (índice ímpar = .scene--reverse, que só
 * inverte a ordem via flex-direction:row-reverse no desktop).
 *
 * Esta seção também absorve a antiga Galeria (cena 5, showcase de telas em
 * colunas com parallax): os prints que antes viviam numa seção separada
 * agora ilustram cada recurso diretamente, então o componente Gallery foi
 * removido do site.
 *
 * Motion: o bloco de texto de cada cena usa data-animate="up" (reveal
 * padrão, ver components/Landing.js). O print de cada cena usa
 * data-parallax (leve deslocamento em Y ao rolar — mesmo handler genérico
 * usado antes pela Galeria), que só roda ≥768px e nunca sob
 * prefers-reduced-motion. .scene__media soma overflow:hidden + padding
 * vertical de sobra como contenção: o parallax é só transform Y (nunca X,
 * nunca hijack de scroll), então não há risco de overflow horizontal, mas
 * a margem evita qualquer corte visual do print encostando na borda da
 * cena durante o deslocamento.
 */
const SCENES = [
  {
    id: "lembretes",
    title: "Lembretes na hora certa",
    text: "A tela do dia reúne os remédios certos, no horário certo — sem precisar adivinhar nada.",
    media: (
      <div className="scene__frame">
        <Image
          src="/screenshots/hoje-dark.webp"
          alt="Tela “Hoje” do app Meu Cuidado no tema escuro, com a lista de lembretes de remédios do dia"
          width={320}
          height={686}
          loading="lazy"
        />
      </div>
    ),
  },
  {
    id: "familia",
    title: "Cuide da família",
    text: "Acompanhe os remédios de pais, filhos ou de quem você cuida — tudo no mesmo lugar. No tablet, a lista e os detalhes ficam lado a lado.",
    media: (
      <div className="scene__frame scene__frame--tablet">
        <Image
          src="/screenshots/tablet-dependente-light.webp"
          alt="App Meu Cuidado no tablet: lista de dependentes à esquerda e os remédios da pessoa selecionada à direita"
          width={1100}
          height={674}
          loading="lazy"
        />
      </div>
    ),
  },
  {
    id: "organizado",
    title: "Tudo organizado",
    text: "Nome, dose e horário de cada remédio, sempre à mão, sem post-it nem caderno de anotações.",
    media: (
      <div className="scene__frame">
        <Image
          src="/screenshots/remedios-light.webp"
          alt="Tela “Remédios” do app Meu Cuidado, com a lista completa de medicamentos cadastrados"
          width={320}
          height={686}
          loading="lazy"
        />
      </div>
    ),
  },
  {
    id: "scan",
    title: "Cadastre pelo rótulo ou código de barras",
    text: "Aponte a câmera para a caixa do remédio: o app lê o rótulo ou o código de barras e já preenche o nome e a dose pra você.",
    media: (
      <div className="scene__pair">
        <div className="scene__frame scene__frame--pair">
          <Image
            src="/screenshots/scan-light.webp"
            alt="Tela de escanear medicamento do app Meu Cuidado, com a câmera apontada para o rótulo de um remédio"
            width={210}
            height={450}
            loading="lazy"
          />
        </div>
        <div className="scene__frame scene__frame--pair">
          <Image
            src="/screenshots/scan-form-light.webp"
            alt="Formulário de novo remédio do app Meu Cuidado preenchido automaticamente após escanear o rótulo"
            width={210}
            height={450}
            loading="lazy"
          />
        </div>
      </div>
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
      </div>

      <div className="scenes">
        {SCENES.map((scene, i) => (
          <div
            className={`scene${i % 2 === 1 ? " scene--reverse" : ""}`}
            key={scene.id}
          >
            <div className="scene__inner">
              <div className="scene__text" data-animate="up">
                <h3 className="scene__title">{scene.title}</h3>
                <p className="scene__desc">{scene.text}</p>
              </div>
              <div
                className="scene__media"
                data-parallax
                data-parallax-speed="0.5"
              >
                {scene.media}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
