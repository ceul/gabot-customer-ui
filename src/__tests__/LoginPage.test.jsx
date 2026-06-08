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
  auth: {
    login: vi.fn(),
    selectRestaurant: vi.fn(),
    me: vi.fn(),
  },
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
    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    const { auth } = await import('../api')
    auth.login.mockRejectedValueOnce({
      response: { data: { error: 'Credenciales incorrectas' } }
    })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'bad' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
    })
  })

  it('shows restaurant selector after successful login with multiple restaurants', async () => {
    const { auth } = await import('../api')
    auth.login.mockResolvedValueOnce({
      requires_restaurant_selection: true,
      client_id: 1,
      username: 'testuser',
      restaurants: [
        { id: 1, name: 'Restaurante Uno' },
        { id: 2, name: 'Restaurante Dos' },
      ],
    })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'user' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Restaurante Uno')).toBeInTheDocument()
    })
  })
})
