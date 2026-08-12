export function parseInviteToken(search: string): string | null {
  const t = new URLSearchParams(search).get('token')
  return t && t.trim() ? t : null
}
export function buildDeepLink(token: string): string {
  return 'mylittle://invite/' + token
}
