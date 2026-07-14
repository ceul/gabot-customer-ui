import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRecaptchaToken } from '../utils/recaptcha'

describe('getRecaptchaToken', () => {
  beforeEach(() => {
    delete window.grecaptcha
  })

  it('resolves with the token from grecaptcha.execute', async () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockResolvedValue('token-abc'),
    }
    const token = await getRecaptchaToken('login')
    expect(token).toBe('token-abc')
    expect(window.grecaptcha.execute).toHaveBeenCalledWith(expect.any(String), { action: 'login' })
  })

  it('rejects when grecaptcha is not loaded', async () => {
    await expect(getRecaptchaToken('login')).rejects.toThrow('reCAPTCHA no cargado')
  })
})
