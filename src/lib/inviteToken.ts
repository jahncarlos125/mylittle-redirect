// NOTE: This parse-token + deep-link logic is intentionally duplicated in
// the inline <script is:inline> in src/components/InviteRedirect.astro.
// That script cannot import this module and still run before first paint
// (is:inline scripts execute synchronously during HTML parsing, before any
// module graph resolves), so the two copies must be kept in sync by hand.
// In particular, the deep-link format `mylittle://invite/<token>` built by
// buildDeepLink() below MUST match the format hardcoded in the inline
// script exactly.
export function parseInviteToken(search: string): string | null {
  const t = new URLSearchParams(search).get('token')
  return t && t.trim() ? t : null
}
export function buildDeepLink(token: string): string {
  return 'mylittle://invite/' + token
}
