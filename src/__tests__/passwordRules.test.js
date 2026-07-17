import { describe, it, expect } from 'vitest'
import { passwordRules, isPasswordValid } from '../utils/passwordRules'

describe('passwordRules', () => {
  it('exposes the four expected rules', () => {
    expect(passwordRules.map(r => r.id)).toEqual(['length', 'uppercase', 'lowercase', 'number'])
  })

  it('length rule requires at least 8 characters', () => {
    const rule = passwordRules.find(r => r.id === 'length')
    expect(rule.test('1234567')).toBe(false)
    expect(rule.test('12345678')).toBe(true)
  })

  it('uppercase rule requires at least one uppercase letter', () => {
    const rule = passwordRules.find(r => r.id === 'uppercase')
    expect(rule.test('abcdefgh')).toBe(false)
    expect(rule.test('Abcdefgh')).toBe(true)
  })

  it('lowercase rule requires at least one lowercase letter', () => {
    const rule = passwordRules.find(r => r.id === 'lowercase')
    expect(rule.test('ABCDEFGH')).toBe(false)
    expect(rule.test('ABCDEFGh')).toBe(true)
  })

  it('number rule requires at least one digit', () => {
    const rule = passwordRules.find(r => r.id === 'number')
    expect(rule.test('Abcdefgh')).toBe(false)
    expect(rule.test('Abcdefg1')).toBe(true)
  })
})

describe('isPasswordValid', () => {
  it('returns false when any rule fails', () => {
    expect(isPasswordValid('short')).toBe(false)
    expect(isPasswordValid('alllowercase1')).toBe(false)
    expect(isPasswordValid('ALLUPPERCASE1')).toBe(false)
    expect(isPasswordValid('NoNumberHere')).toBe(false)
  })

  it('returns true when every rule passes', () => {
    expect(isPasswordValid('Password123')).toBe(true)
  })
})
