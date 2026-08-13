import { SITE_URL } from '@/lib/site'

// Gera /robots.txt. Substitui public/robots.txt (removido nesta task) para
// não gerar conflito entre os dois — Next serve só um deles.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
