import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OrdersPage from '../pages/OrdersPage'

vi.mock('../api', () => ({
  orders: { list: vi.fn().mockResolvedValue([]), get: vi.fn(), updateStatus: vi.fn() },
}))

vi.mock('../socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    io: { on: vi.fn(), off: vi.fn() },
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

function renderOrders() {
  return render(<MemoryRouter><OrdersPage /></MemoryRouter>)
}

describe('OrdersPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading Pedidos', async () => {
    renderOrders()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
  })

  it('shows zero orders initially', () => {
    renderOrders()
    expect(screen.queryAllByText(/#ORD-/)).toHaveLength(0)
  })
})
