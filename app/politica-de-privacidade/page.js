// Texto juridico identico ao legacy/politica-de-privacidade/index.html (apenas re-tematizado).
// Nao alterar o conteudo visivel sem atualizar tambem o legacy correspondente.
export const metadata = {
  title: 'Política de Privacidade',
  description:
    'Como o Meu Cuidado trata dados de contas, dependentes, medicamentos, doses e lembretes.',
  alternates: { canonical: '/politica-de-privacidade/' },
}

export default function PoliticaDePrivacidade() {
  return (
    <div className="legal-page">
      <main id="conteudo" className="legal-card">
        <h1>Politica de Privacidade</h1>
        <p className="legal-meta">Meu Cuidado - ultima atualizacao: 22 de maio de 2026.</p>

        <p>
          Esta politica explica como o aplicativo Meu Cuidado trata informacoes usadas
          para acompanhar dependentes, medicamentos, doses e lembretes.
        </p>

        <h2>Responsavel e contato</h2>
        <p>
          O responsavel pelo aplicativo Meu Cuidado pode ser contatado pelo email{' '}
          <a href="mailto:abisaytech@gmail.com">abisaytech@gmail.com</a> para duvidas
          sobre privacidade, dados pessoais ou solicitacoes relacionadas a esta politica.
        </p>

        <h2>Dados tratados</h2>
        <p>Conforme o uso do aplicativo, podemos tratar:</p>
        <ul>
          <li>Dados da conta, como email, nome, foto de perfil e identificadores de autenticacao.</li>
          <li>Dados de dependentes cadastrados, como nome, data de nascimento e foto enviada pelo usuario.</li>
          <li>Dados de medicamentos e doses, como nome do medicamento, dosagem, instrucoes, horarios, registros de tomada e fotos enviadas pelo usuario.</li>
          <li>Dados de convites e vinculos entre cuidadores autorizados para compartilhar o acompanhamento de um dependente.</li>
          <li>Dados tecnicos necessarios para lembretes e funcionamento da conta, como preferencias locais e token de notificacao quando aplicavel.</li>
        </ul>

        <h2>Como os dados sao usados</h2>
        <p>Usamos os dados para:</p>
        <ul>
          <li>Criar e autenticar contas.</li>
          <li>Permitir o cadastro e acompanhamento de dependentes, medicamentos e doses.</li>
          <li>Agendar e entregar lembretes de doses no dispositivo.</li>
          <li>Permitir convites e acesso compartilhado apenas entre usuarios autorizados.</li>
          <li>Manter seguranca, integridade e suporte do servico.</li>
        </ul>

        <h2>Compartilhamento</h2>
        <p>
          O Meu Cuidado nao vende dados pessoais. Informacoes podem ser processadas por
          provedores usados para oferecer as funcoes descritas nesta politica, como
          Supabase para autenticacao, banco de dados e armazenamento de arquivos, e
          servicos do Google para login e infraestrutura de notificacoes quando
          aplicavel. Dados de um dependente tambem podem ser acessados pelos cuidadores
          autorizados por meio dos convites do proprio app.
        </p>

        <h2>Fotos, notificacoes e permissoes</h2>
        <p>
          O acesso a camera ou galeria ocorre quando o usuario escolhe adicionar fotos de
          dependentes ou medicamentos. As permissoes de notificacao e alarme sao usadas
          para lembretes de doses. O usuario pode controlar permissoes do dispositivo nas
          configuracoes do sistema.
        </p>

        <h2>Seguranca</h2>
        <p>
          Adotamos medidas tecnicas e organizacionais para restringir acesso indevido e
          proteger dados durante armazenamento e transmissao. Nenhum sistema e totalmente
          livre de riscos, por isso recomendamos proteger credenciais e o dispositivo.
        </p>

        <h2>Retencao e exclusao</h2>
        <p>
          Os dados sao mantidos enquanto a conta e os registros forem necessarios para o
          uso do aplicativo. O app oferece exclusao de dados da conta e permite remover
          dependentes e medicamentos; essas acoes removem tambem registros relacionados
          conforme aplicavel. O usuario tambem pode solicitar suporte pelo contato acima.
        </p>

        <h2>Atualizacoes</h2>
        <p>
          Esta politica pode ser atualizada para refletir mudancas no aplicativo ou em
          requisitos legais. A versao vigente ficara disponivel nesta pagina.
        </p>

        <p>
          <a href="/exclusao-de-conta/">Como solicitar a exclusao da conta e dos dados</a>
        </p>
        <p><a href="/">Voltar para a pagina de convite</a></p>
      </main>
    </div>
  )
}
