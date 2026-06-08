import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import PaymentPage from '../pages/PaymentPage'

// Actual API shape: paymentMethods.get(), .update(id, data), .create(data), .delete(id)
vi.mock('../api', () => ({
  paymentMethods: {
    get: vi.fn().mockResolvedValue([
      { id: 1, method_type: 'cash', is_enabled: true },
      { id: 2, method_type: 'credit_card', is_enabled: false },
      { id: 3, method_type: 'debit_card', is_enabled: true },
    ]),
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}))

describe('PaymentPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/métodos de pago/i)).toBeInTheDocument()
    })
  })

  it('renders simple methods section heading', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/métodos simples/i)).toBeInTheDocument()
    })
  })

  it('renders cash method label', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/efectivo/i)).toBeInTheDocument()
    })
  })

  it('renders credit card method label', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/tarjeta de crédito/i)).toBeInTheDocument()
    })
  })

  it('renders bank transfer section heading', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/transferencia bancaria/i)).toBeInTheDocument()
    })
  })

  it('renders add bank account button', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/agregar cuenta bancaria/i)).toBeInTheDocument()
    })
  })

  it('renders all three simple methods even when API returns empty array', async () => {
    const { paymentMethods } = await import('../api')
    paymentMethods.get.mockResolvedValueOnce([])
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/efectivo/i)).toBeInTheDocument()
      expect(screen.getByText(/tarjeta de crédito/i)).toBeInTheDocument()
      expect(screen.getByText(/tarjeta débito/i)).toBeInTheDocument()
    })
  })

  it('calls create when toggling a method with no existing record', async () => {
    const user = userEvent.setup()
    const { paymentMethods } = await import('../api')
    paymentMethods.get.mockResolvedValueOnce([])
    paymentMethods.create.mockResolvedValueOnce({ id: 99, method_type: 'cash', is_enabled: true })

    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/efectivo/i)).toBeInTheDocument())

    // Scope to the cash card by finding the Efectivo text's parent container
    const cashCard = screen.getByText(/efectivo/i).parentElement
    const toggleLabel = within(cashCard).getByText(/deshabilitado/i).closest('label')
    await user.click(toggleLabel)

    await waitFor(() =>
      expect(paymentMethods.create).toHaveBeenCalledWith({ method_type: 'cash', is_enabled: true })
    )
  })

  it('renders bank account card when bank account exists', async () => {
    const { paymentMethods } = await import('../api')
    paymentMethods.get.mockResolvedValueOnce([
      {
        id: 10,
        method_type: 'money_transfer',
        is_enabled: true,
        bank_name: 'Bancolombia',
        account_holder: 'Juan García',
        account_info: '123-456789-00',
        qr_image: '',
      },
    ])
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Bancolombia')).toBeInTheDocument()
    })
  })
})
