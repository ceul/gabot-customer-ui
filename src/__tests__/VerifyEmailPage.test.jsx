import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import VerifyEmailPage from '../pages/VerifyEmailPage'

vi.mock('../api', () => ({
  auth: { verifyEmail: vi.fn() },
}))

function renderWithToken(token) {
  return render(
    <MemoryRouter initialEntries={[`/verify-email?token=${token}`]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('VerifyEmailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows success message when verification succeeds', async () => {
    const { auth } = await import('../api')
    auth.verifyEmail.mockResolvedValueOnce({ message: 'Correo verificado' })
    renderWithToken('good-token')
    await waitFor(() => {
      expect(screen.getByText(/verificado correctamente/i)).toBeInTheDocument()
    })
    expect(auth.verifyEmail).toHaveBeenCalledWith('good-token')
  })

  it('shows error message when verification fails', async () => {
    const { auth } = await import('../api')
    auth.verifyEmail.mockRejectedValueOnce({ response: { data: { error: 'Enlace inválido o expirado' } } })
    renderWithToken('bad-token')
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido o expirado')).toBeInTheDocument()
    })
  })

  it('shows an error immediately when no token is present', async () => {
    renderWithToken('')
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido')).toBeInTheDocument()
    })
  })
})
