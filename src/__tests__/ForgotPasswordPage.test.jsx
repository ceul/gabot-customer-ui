import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'

vi.mock('../api', () => ({
  auth: { forgotPassword: vi.fn() },
}))
vi.mock('../utils/recaptcha', () => ({
  getRecaptchaToken: vi.fn().mockResolvedValue('mock-token'),
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the generic confirmation message after submit', async () => {
    const { auth } = await import('../api')
    auth.forgotPassword.mockResolvedValueOnce({ message: 'ok' })
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'x@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))
    await waitFor(() => {
      expect(screen.getByText(/si el correo existe/i)).toBeInTheDocument()
    })
  })

  it('shows the same generic message even when the request fails', async () => {
    const { auth } = await import('../api')
    auth.forgotPassword.mockRejectedValueOnce(new Error('network error'))
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'x@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))
    await waitFor(() => {
      expect(screen.getByText(/si el correo existe/i)).toBeInTheDocument()
    })
  })
})
