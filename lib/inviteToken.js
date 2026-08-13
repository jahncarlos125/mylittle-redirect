// Contrato de producao: o app mobile espera o deep link no formato EXATO
// `mylittle://invite/<token>`. Este mesmo formato esta duplicado, em JS puro,
// no script inline pre-hidratacao de app/layout.js (nao pode importar este
// modulo pois roda antes do React/pagina montar). Se mudar aqui, mude la tambem.

export function parseInviteToken(search) {
  const t = new URLSearchParams(search).get('token')
  return t && t.trim() ? t : null
}

export function buildDeepLink(token) {
  return 'mylittle://invite/' + token
}
