import { SITE_URL } from '@/lib/site'

// Gera /sitemap.xml. trailingSlash:true no next.config.js, então as 3 URLs
// reais do site terminam com barra (a home também aceita '/' como raiz).
export default function sitemap() {
  const lastModified = new Date()

  return ['/', '/politica-de-privacidade/', '/exclusao-de-conta/'].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
  }))
}
