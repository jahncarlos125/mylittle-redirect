import localFont from 'next/font/local'
import './globals.css'

const manrope = localFont({
  src: [
    { path: '../public/fonts/manrope-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/manrope-700.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/manrope-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = { title: 'Meu Cuidado', description: 'Meu Cuidado' } // completo na Task 9

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} no-js`} suppressHydrationWarning>
      <head>
        {/* Detecta reduced-motion e no-js ANTES do paint (padrão do abisay: app/layout.js) */}
        <script dangerouslySetInnerHTML={{ __html:
          `document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');` +
          `if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('reduced')}`
        }} />
        {/* Redirect de convite (CONTRATO DE PRODUCAO - nao alterar o formato do deep link).
            Roda ANTES da hidratacao; duplica a logica de lib/inviteToken.js (que nao pode ser
            importada aqui). Formato mylittle://invite/<token> deve ficar em sincronia com lib/inviteToken.js.
            Seta data-invite='1' SINCRONAMENTE (esconde a .landing pre-paint via CSS), mas ADIA a
            navegacao (location.href) para o DOMContentLoaded: chamar location.href durante o parse
            do documento aborta o parse e o overlay/fallback/landing nunca entram no DOM (bug da v1). */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){var t=new URLSearchParams(location.search).get('token');if(!t||!t.trim())return;`+
          `document.documentElement.dataset.invite='1';var deep='mylittle://invite/'+t;`+
          `function go(){location.href=deep;setTimeout(function(){var a=document.getElementById('invite-fallback');`+
          `if(a){a.href=deep;a.parentElement.style.display='block';}},2500);}`+
          `if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();`
        }} />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  )
}
