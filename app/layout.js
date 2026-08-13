import localFont from 'next/font/local'
import './globals.css'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site'

const manrope = localFont({
  src: [
    { path: '../public/fonts/manrope-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/manrope-700.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/manrope-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: ['/og.png'],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
  icons: { icon: '/favicon.png' },
}

// JSON-LD (SoftwareApplication) — descreve o app pra rich results de busca.
// Fica no <body> (não no <head>) seguindo o padrão do Next para scripts
// inline server-rendered; conteúdo é estático e não depende de dados do
// usuário, então dangerouslySetInnerHTML aqui não expõe nada sensível.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Android',
  description: SITE_DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
}

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  )
}
