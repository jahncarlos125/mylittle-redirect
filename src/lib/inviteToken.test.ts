import { describe, it, expect } from 'vitest'
import { parseInviteToken, buildDeepLink } from './inviteToken'

describe('inviteToken', () => {
  it('extrai o token da query', () => {
    expect(parseInviteToken('?token=abc123')).toBe('abc123')
  })
  it('retorna null sem token', () => {
    expect(parseInviteToken('')).toBeNull()
    expect(parseInviteToken('?foo=bar')).toBeNull()
  })
  it('monta o deep link', () => {
    expect(buildDeepLink('abc123')).toBe('mylittle://invite/abc123')
  })
})
