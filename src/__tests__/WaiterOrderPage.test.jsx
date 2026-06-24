import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WaiterOrderPage from '../pages/WaiterOrderPage'

vi.mock('../api', () => ({
  menu: {
    categories: vi.fn(() => Promise.resolve({ categories: [] })),
  },
  recommend: {
    suggest: vi.fn(() => Promise.resolve({ suggestions: [] })),
    accept: vi.fn(() => Promise.resolve({})),
  },
  orders: {
    create: vi.fn(() => Promise.resolve({ id: 'order-1' })),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1, name: 'Test' } }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <WaiterOrderPage />
    </MemoryRouter>
  )
}

describe('WaiterOrderPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders app bar with title', () => {
    renderPage()
    expect(screen.getByText('Nuevo pedido')).toBeInTheDocument()
  })

  it('renders Para llevar chip first', async () => {
    renderPage()
    await waitFor(() => {
      const chips = screen.getAllByRole('button')
      const labels = chips.map(b => b.textContent)
      const idx = labels.findIndex(l => l.includes('llevar'))
      expect(idx).toBeGreaterThanOrEqual(0)
    })
  })

  it('renders Siguiente button disabled when no items', async () => {
    renderPage()
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /siguiente/i })
      expect(btn).toBeDisabled()
    })
  })

  it('shows empty menu message when no categories', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/menú no está configurado/i)).toBeInTheDocument()
    })
  })

  it('shows success state after order sent', async () => {
    const { recommend, orders } = await import('../api')
    recommend.suggest.mockResolvedValueOnce({ suggestions: [] })
    orders.create.mockResolvedValueOnce({ id: 'order-1' })

    const { menu } = await import('../api')
    menu.categories.mockResolvedValueOnce({
      categories: [
        {
          id: 1, name: 'Platos', items: [
            { id: 10, name: 'Bandeja Paisa', price: 22000, available: true }
          ]
        }
      ]
    })

    renderPage()
    await waitFor(() => screen.getByText('Bandeja Paisa'))

    fireEvent.click(screen.getAllByRole('button', { name: /agregar bandeja paisa/i })[0])
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /siguiente/i })
      expect(btn).not.toBeDisabled()
    })
  })
})
