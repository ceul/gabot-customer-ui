import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import GoogleSignInButton from '../components/GoogleSignInButton'

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    window.google = {
      accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } },
    }
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
})
