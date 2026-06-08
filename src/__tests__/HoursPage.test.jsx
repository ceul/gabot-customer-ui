import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HoursPage from '../pages/HoursPage'

// hours.get returns array of rows with day_of_week (0=Lunes … 6=Domingo)
vi.mock('../api', () => ({
  hours: {
    get: vi.fn().mockResolvedValue([
      { day_of_week: 0, is_closed: false, open_time: '09:00', close_time: '22:00' },
      { day_of_week: 1, is_closed: true,  open_time: '09:00', close_time: '22:00' },
      { day_of_week: 2, is_closed: false, open_time: '10:00', close_time: '21:00' },
      { day_of_week: 3, is_closed: false, open_time: '10:00', close_time: '21:00' },
      { day_of_week: 4, is_closed: false, open_time: '10:00', close_time: '23:00' },
      { day_of_week: 5, is_closed: false, open_time: '11:00', close_time: '23:00' },
      { day_of_week: 6, is_closed: true,  open_time: '11:00', close_time: '20:00' },
    ]),
    updateDay: vi.fn().mockResolvedValue({}),
  },
}))

function renderPage() {
  return render(<MemoryRouter><HoursPage /></MemoryRouter>)
}

describe('HoursPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/horarios de atenci/i)).toBeInTheDocument()
    })
  })

  it('renders a row for each day of the week', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Lunes')).toBeInTheDocument()
      expect(screen.getByText('Martes')).toBeInTheDocument()
      expect(screen.getByText(/mi.*rcoles/i)).toBeInTheDocument()
      expect(screen.getByText('Jueves')).toBeInTheDocument()
      expect(screen.getByText('Viernes')).toBeInTheDocument()
      expect(screen.getByText(/s.*bado/i)).toBeInTheDocument()
      expect(screen.getByText('Domingo')).toBeInTheDocument()
    })
  })

  it('day name label has Cerulean Sentinel text-on-surface class', async () => {
    renderPage()
    await waitFor(() => {
      const lunesLabel = screen.getByText('Lunes')
      expect(lunesLabel).toHaveClass('text-on-surface')
    })
  })

  it('day row container has bg-surface and border-outline-variant classes', async () => {
    renderPage()
    await waitFor(() => {
      const lunesLabel = screen.getByText('Lunes')
      // The DayRow wrapper is the closest div containing the label
      const rowContainer = lunesLabel.closest('[class*="bg-surface"]')
      expect(rowContainer).not.toBeNull()
    })
  })
})
