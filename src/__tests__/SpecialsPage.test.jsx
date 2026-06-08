import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SpecialsPage from '../pages/SpecialsPage'

// API uses: api.get(), api.update(id, data), api.create(data), api.delete(id)
// Data shape: { id, day_of_week: number, title, description, is_active }
vi.mock('../api', () => ({
  specials: {
    get: vi.fn().mockResolvedValue([
      { id: 1, day_of_week: 0, title: 'Especial Lunes', description: 'Desc lunes', is_active: true },
    ]),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}))

describe('SpecialsPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><SpecialsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/especiales del día/i)).toBeInTheDocument()
    })
  })

  it('renders specials from API', async () => {
    render(<MemoryRouter><SpecialsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Especial Lunes')).toBeInTheDocument()
    })
  })

  it('renders add button', async () => {
    render(<MemoryRouter><SpecialsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/agregar especial/i)).toBeInTheDocument()
    })
  })
})
