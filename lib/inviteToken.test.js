import { describe, it, expect } from 'vitest'
import { parseInviteToken, buildDeepLink } from './inviteToken.js'

describe('inviteToken', () => {
  it('extrai o token', () => { expect(parseInviteToken('?token=abc123')).toBe('abc123') })
  it('null sem token', () => { expect(parseInviteToken('')).toBeNull(); expect(parseInviteToken('?foo=bar')).toBeNull() })
  it('monta o deep link', () => { expect(buildDeepLink('abc123')).toBe('mylittle://invite/abc123') })
})
