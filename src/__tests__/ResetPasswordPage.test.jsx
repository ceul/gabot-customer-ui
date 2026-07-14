import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ResetPasswordPage from '../pages/ResetPasswordPage'

vi.mock('../api', () => ({
  auth: { resetPassword: vi.fn() },
}))

function renderWithToken(token) {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ResetPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submits the token and new password', async () => {
    const { auth } = await import('../api')
    auth.resetPassword.mockResolvedValueOnce({ message: 'ok' })
    renderWithToken('good-token')
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'newpass123' } })
    fireEvent.click(screen.getByRole('button', { name: /restablecer/i }))
    await waitFor(() => {
      expect(auth.resetPassword).toHaveBeenCalledWith({ token: 'good-token', new_password: 'newpass123' })
    })
    expect(screen.getByText(/fue restablecida/i)).toBeInTheDocument()
  })

  it('shows an error message when the token is invalid', async () => {
    const { auth } = await import('../api')
    auth.resetPassword.mockRejectedValueOnce({ response: { data: { error: 'Enlace inválido o expirado' } } })
    renderWithToken('bad-token')
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'newpass123' } })
    fireEvent.click(screen.getByRole('button', { name: /restablecer/i }))
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido o expirado')).toBeInTheDocument()
    })
  })
})
