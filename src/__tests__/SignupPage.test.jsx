import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from '../pages/SignupPage'

vi.mock('../api', () => ({
  auth: { signup: vi.fn(), googleLogin: vi.fn() },
}))

vi.mock('../utils/recaptcha', () => ({
  getRecaptchaToken: vi.fn().mockResolvedValue('mock-token'),
}))

vi.mock('../components/GoogleSignInButton', () => ({
  default: () => <div data-testid="google-button" />,
}))

function renderSignup() {
  return render(<MemoryRouter><SignupPage /></MemoryRouter>)
}

describe('SignupPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the signup form', () => {
    renderSignup()
    expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('shows a confirmation message after successful signup', async () => {
    const { auth } = await import('../api')
    auth.signup.mockResolvedValueOnce({ message: 'ok' })
    renderSignup()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'new@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await waitFor(() => {
      expect(screen.getByText(/revisa/i)).toBeInTheDocument()
    })
    expect(auth.signup).toHaveBeenCalledWith({ email: 'new@test.com', password: 'password123', recaptcha_token: 'mock-token' })
  })

  it('shows an error message on failed signup', async () => {
    const { auth } = await import('../api')
    auth.signup.mockRejectedValueOnce({ response: { data: { error: 'Correo ya registrado' } } })
    renderSignup()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'dup@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await waitFor(() => {
      expect(screen.getByText('Correo ya registrado')).toBeInTheDocument()
    })
  })

  it('disables submit when the confirmation password does not match', () => {
    renderSignup()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'new@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'password456' } })
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeDisabled()
  })

  it('shows an error message when the confirmation password does not match', () => {
    renderSignup()
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'password456' } })
    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('does not call signup when the confirmation password does not match', () => {
    renderSignup()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'new@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'password456' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    return import('../api').then(({ auth }) => {
      expect(auth.signup).not.toHaveBeenCalled()
    })
  })
})
