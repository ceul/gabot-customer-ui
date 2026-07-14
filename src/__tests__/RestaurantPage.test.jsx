import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RestaurantPage from '../pages/RestaurantPage'

const mockUseAuth = vi.fn()
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../api', () => ({
  restaurant: {
    get: vi.fn().mockResolvedValue({
      name: 'Test Resto',
      address: '123 Main',
      phone: '555-0000',
      email: 'test@test.com',
      website: '',
      delivery_available: false,
      delivery_fee: '',
      free_delivery_threshold: '',
    }),
    update: vi.fn().mockResolvedValue({}),
  },
}))

function renderPage() {
  return render(<MemoryRouter><RestaurantPage /></MemoryRouter>)
}

describe('RestaurantPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ restaurant: { id: 1, name: 'Test Resto' } })
  })

  it('renders the page heading', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Información del Restaurante')).toBeInTheDocument()
    })
  })

  it('loads restaurant data into form fields', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Resto')).toBeInTheDocument()
    })
  })

  it('renders section headers with Cerulean Sentinel token classes', async () => {
    renderPage()
    await waitFor(() => {
      const generalHeader = screen.getByText('General')
      const deliveryHeader = screen.getByText('Domicilio')
      expect(generalHeader).toHaveClass('text-on-surface')
      expect(deliveryHeader).toHaveClass('text-on-surface')
    })
  })

  it('shows a connect-your-restaurant empty state when the client has no restaurant', async () => {
    mockUseAuth.mockReturnValue({ restaurant: null })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Conecta tu restaurante')).toBeInTheDocument()
    })
    expect(screen.queryByText('Información del Restaurante')).not.toBeInTheDocument()
  })
})
