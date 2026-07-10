import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import GoogleSignInButton from '../components/GoogleSignInButton'

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    window.google = {
      accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } },
    }
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id.apps.googleusercontent.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('initializes Google Identity Services with a callback', () => {
    const onCredential = vi.fn()
    render(<GoogleSignInButton onCredential={onCredential} />)
    expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: expect.any(String) })
    )
    expect(window.google.accounts.id.renderButton).toHaveBeenCalled()
  })

  it('calls onCredential with the returned credential', () => {
    const onCredential = vi.fn()
    render(<GoogleSignInButton onCredential={onCredential} />)
    const initCall = window.google.accounts.id.initialize.mock.calls[0][0]
    initCall.callback({ credential: 'jwt-credential' })
    expect(onCredential).toHaveBeenCalledWith('jwt-credential')
  })

  it('warns and does not call initialize when client_id is missing', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onCredential = vi.fn()
    render(<GoogleSignInButton onCredential={onCredential} />)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('VITE_GOOGLE_CLIENT_ID')
    )
    expect(window.google.accounts.id.initialize).not.toHaveBeenCalled()
    expect(window.google.accounts.id.renderButton).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('does not throw when the Google SDK call fails', () => {
    window.google.accounts.id.initialize.mockImplementation(() => {
      throw new Error('SDK boom')
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onCredential = vi.fn()
    expect(() => render(<GoogleSignInButton onCredential={onCredential} />)).not.toThrow()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
