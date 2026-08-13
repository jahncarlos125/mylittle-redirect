import { describe, it, expect } from 'vitest'
import { isValidEmail, isBot, validateSignup, validateFeedback, sanitize } from './validation.js'

describe('validation', () => {
  it('valida email', () => { expect(isValidEmail('a@b.com')).toBe(true); expect(isValidEmail('nope')).toBe(false) })
  it('honeypot', () => { expect(isBot({ website: 'x' })).toBe(true); expect(isBot({})).toBe(false) })
  it('signup', () => {
    expect(validateSignup({ name: '', email: 'a@b.com' }).ok).toBe(false)
    expect(validateSignup({ name: 'Ana', email: 'bad' }).ok).toBe(false)
    expect(validateSignup({ name: 'Ana', email: 'a@b.com' }).ok).toBe(true)
  })
  it('feedback', () => {
    expect(validateFeedback({ kind: 'x', message: 'oi' }).ok).toBe(false)
    expect(validateFeedback({ kind: 'bug', message: '' }).ok).toBe(false)
    expect(validateFeedback({ kind: 'bug', message: 'trava' }).ok).toBe(true)
  })
  it('sanitize corta no max e trima', () => {
    expect(sanitize('  hi  ', 10)).toBe('hi')
    expect(sanitize('x'.repeat(300), 5)).toBe('xxxxx')
    expect(sanitize('   ', 10)).toBe('')
  })
})
