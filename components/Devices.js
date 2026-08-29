import Image from "next/image";

/**
 * Seção "dispositivos": mostra o app no celular E no tablet na MESMA
 * composição (um tablet em paisagem com um celular à frente), reforçando
 * que é o mesmo app, bonito em qualquer tela — em vez de uma seção
 * exclusiva de tablet. O tablet usa data-tilt (handler genérico do
 * Landing.js, que procura o filho .device) para um leve 3D no hover.
 */
export default function Devices() {
  return (
    <section className="devices" id="dispositivos">
      <div className="devices__inner">
        <div className="devices__head" data-animate="up">
          <h2 className="devices__title">No celular e no tablet</h2>
          <p className="devices__desc">
            É o mesmo Meu Cuidado, do bolso à tela grande. No tablet ele abre
            em duas colunas — a lista de um lado, os detalhes do outro — sem
            perder nada do que você já usa no celular.
          </p>
        </div>

        <div className="combo" data-animate="up">
          <div className="combo__tablet" data-tilt>
            <div className="device">
              <Image
                src="/screenshots/tablet-remedio-dark.webp"
                alt="App Meu Cuidado no tablet, no tema escuro e em paisagem: lista de remédios à esquerda e o formulário de edição à direita"
                width={1100}
                height={674}
                loading="lazy"
              />
            </div>
          </div>
          <div className="combo__phone">
            <Image
              src="/screenshots/hoje-light.webp"
              alt="App Meu Cuidado no celular, na tela “Hoje” com a próxima dose e a agenda do dia"
              width={272}
              height={583}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
