/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // App Link de convite: /invite/<token> é um link https verificado (Android
  // App Links). Quando o app NÃO está instalado, o Android abre este URL no
  // navegador — então o site serve a home aqui (o script inline em
  // app/layout.js lê o token do path e mostra o overlay + fallback). A URL na
  // barra continua /invite/<token>; o rewrite só troca o conteúdo servido.
  async rewrites() {
    return [{ source: '/invite/:token', destination: '/' }]
  },
}
export default nextConfig
