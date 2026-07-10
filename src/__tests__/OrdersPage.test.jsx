import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OrdersPage from '../pages/OrdersPage'

vi.mock('../api', () => ({
  orders: { list: vi.fn().mockResolvedValue([]), get: vi.fn(), updateStatus: vi.fn() },
  pendingQuestions: {
    list: vi.fn().mockResolvedValue([]),
    resolve: vi.fn().mockResolvedValue({ status: 'resolved' }),
  },
}))

const socketHandlers = {}
vi.mock('../socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn((event, cb) => { socketHandlers[event] = cb }),
    off: vi.fn(),
    emit: vi.fn(),
    io: { on: vi.fn(), off: vi.fn() },
  },
}))

let mockRestaurant = { id: 1 }
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: mockRestaurant }),
}))

function renderOrders() {
  return render(<MemoryRouter><OrdersPage /></MemoryRouter>)
}

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRestaurant = { id: 1 }
    Object.keys(socketHandlers).forEach(k => delete socketHandlers[k])
  })

  it('renders the page heading Pedidos', async () => {
    renderOrders()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
  })

  it('shows zero orders initially', () => {
    renderOrders()
    expect(screen.queryAllByText(/#ORD-/)).toHaveLength(0)
  })

  it('re-joins the socket room once restaurant.id becomes available', async () => {
    mockRestaurant = undefined
    const socket = (await import('../socket')).default
    const { rerender } = render(<MemoryRouter><OrdersPage /></MemoryRouter>)

    expect(socket.emit).toHaveBeenCalledWith('join_restaurant', { client_id: undefined })

    mockRestaurant = { id: 7 }
    rerender(<MemoryRouter><OrdersPage /></MemoryRouter>)

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('join_restaurant', { client_id: 7 })
    })
  })

  it('fetches pending questions on mount', async () => {
    const { pendingQuestions } = await import('../api')
    renderOrders()
    await waitFor(() => expect(pendingQuestions.list).toHaveBeenCalled())
  })

  it('renders a pending question card when one is open', async () => {
    const { pendingQuestions } = await import('../api')
    pendingQuestions.list.mockResolvedValueOnce([
      { id: 1, customer_question: 'Se puede anadir arequipe?', status: 'open' },
    ])

    renderOrders()

    await waitFor(() => {
      expect(screen.getByText('Se puede anadir arequipe?')).toBeInTheDocument()
    })
  })

  it('adds a new card when pending_question_created fires over the socket', async () => {
    renderOrders()
    await waitFor(() => expect(socketHandlers.pending_question_created).toBeTypeOf('function'))

    socketHandlers.pending_question_created({ id: 2, customer_question: 'Pina en la pizza?', status: 'open' })

    await waitFor(() => {
      expect(screen.getByText('Pina en la pizza?')).toBeInTheDocument()
    })
  })

  it('removes a card when pending_question_resolved fires over the socket', async () => {
    const { pendingQuestions } = await import('../api')
    pendingQuestions.list.mockResolvedValueOnce([
      { id: 3, customer_question: 'Estofada con pina?', status: 'open' },
    ])

    renderOrders()
    await waitFor(() => {
      expect(screen.getByText('Estofada con pina?')).toBeInTheDocument()
    })

    socketHandlers.pending_question_resolved({ id: 3 })

    await waitFor(() => {
      expect(screen.queryByText('Estofada con pina?')).not.toBeInTheDocument()
    })
  })
})
