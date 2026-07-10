import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'

const summaryFixture = {
  range: 'today',
  period_start: '2026-07-09T05:00:00Z',
  period_end: '2026-07-10T05:00:00Z',
  revenue_total: 184500,
  order_count: 12,
  avg_ticket: 15375,
  top_items: [{ name: 'Café Espresso', quantity: 9, revenue: 54000 }],
  conversation_count: 15,
  delivery_mix: { delivery: 5, pickup: 3, dine_in: 4, unclassified: 0 },
  avg_fulfillment_seconds: 612,
  fulfillment_sample_size: 7,
  avg_rating: 4.3,
  rating_sample_size: 3,
}

const emptyFixture = {
  range: 'today',
  period_start: '2026-07-09T05:00:00Z',
  period_end: '2026-07-10T05:00:00Z',
  revenue_total: 0,
  order_count: 0,
  avg_ticket: null,
  top_items: [],
  conversation_count: 0,
  delivery_mix: { delivery: 0, pickup: 0, dine_in: 0, unclassified: 0 },
  avg_fulfillment_seconds: null,
  fulfillment_sample_size: 0,
  avg_rating: null,
  rating_sample_size: 0,
}

vi.mock('../api', () => ({
  dashboard: { summary: vi.fn() },
}))

import { dashboard } from '../api'

describe('DashboardPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders revenue and order count from the API', async () => {
    dashboard.summary.mockResolvedValue(summaryFixture)
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/12/)).toBeInTheDocument()
    })
    expect(dashboard.summary).toHaveBeenCalledWith('today')
  })

  it('renders the top-selling item', async () => {
    dashboard.summary.mockResolvedValue(summaryFixture)
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Café Espresso')).toBeInTheDocument()
    })
  })

  it('re-fetches with the new range when a filter is clicked', async () => {
    dashboard.summary.mockResolvedValue(summaryFixture)
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await waitFor(() => expect(dashboard.summary).toHaveBeenCalledWith('today'))

    fireEvent.click(screen.getByText(/7 días/i))

    await waitFor(() => expect(dashboard.summary).toHaveBeenCalledWith('7d'))
  })

  it('shows an empty state when order_count is 0', async () => {
    dashboard.summary.mockResolvedValue(emptyFixture)
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/no hay pedidos/i)).toBeInTheDocument()
    })
  })

  it('shows a low-confidence indicator when fulfillment sample size is small', async () => {
    dashboard.summary.mockResolvedValue(summaryFixture)
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/n=7/i)).toBeInTheDocument()
    })
  })
})
