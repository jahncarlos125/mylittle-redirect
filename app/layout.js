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
    <html lang="pt-BR" className={`${manrope.variable} no-js`}>
      <head>
        {/* Detecta reduced-motion e no-js ANTES do paint (padrão do abisay: app/layout.js) */}
        <script dangerouslySetInnerHTML={{ __html:
          `document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');` +
          `if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('reduced')}`
        }} />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  )
}
