import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../api', () => ({
  auth: { login: vi.fn(), googleLogin: vi.fn(), selectRestaurant: vi.fn(), me: vi.fn() },
}))

vi.mock('../utils/recaptcha', () => ({
  getRecaptchaToken: vi.fn().mockResolvedValue('mock-recaptcha-token'),
}))

vi.mock('../components/GoogleSignInButton', () => ({
  default: () => <div data-testid="google-button" />,
}))

function renderLogin() {
  return render(<MemoryRouter><LoginPage /></MemoryRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with heading', () => {
    renderLogin()
    expect(screen.getByText('Panel de Control')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    const { auth } = await import('../api')
    auth.login.mockRejectedValueOnce({
      response: { data: { error: 'Credenciales incorrectas' } }
    })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
    })
  })

  it('sends a recaptcha token with the login request', async () => {
    const { auth } = await import('../api')
    auth.login.mockResolvedValueOnce({ client: { id: 1, email: 'user@test.com' }, token: 't', refresh_token: 'r', restaurant: null })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({ email: 'user@test.com', password: 'pass', recaptcha_token: 'mock-recaptcha-token' })
    })
  })

  it('shows restaurant selector after successful login with multiple restaurants', async () => {
    const { auth } = await import('../api')
    auth.login.mockResolvedValueOnce({
      requires_restaurant_selection: true,
      client: { id: 1, email: 'testuser@test.com' },
      restaurants: [
        { id: 1, name: 'Restaurante Uno' },
        { id: 2, name: 'Restaurante Dos' },
      ],
    })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Restaurante Uno')).toBeInTheDocument()
    })
  })
})
