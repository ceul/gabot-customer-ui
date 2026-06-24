import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MenuPage from '../pages/MenuPage'

// MenuPage imports menu as api from '../api' and calls:
//   api.get(), api.createCategory(), api.updateCategory(), api.deleteCategory()
//   api.createItem(), api.updateItem(), api.deleteItem()
vi.mock('../api', () => ({
  menu: {
    get: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Entradas',
        items: [{ id: 10, name: 'Empanadas', price: 5000, description: '', available: true }],
      },
    ]),
    createCategory: vi.fn().mockResolvedValue({}),
    updateCategory: vi.fn().mockResolvedValue({}),
    deleteCategory: vi.fn().mockResolvedValue({}),
    createItem: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
    deleteItem: vi.fn().mockResolvedValue({}),
    importFile: vi.fn().mockResolvedValue({}),
  },
}))

describe('MenuPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /menú/i })).toBeInTheDocument()
    })
  })

  it('renders category sections from API', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Entradas')).toBeInTheDocument()
    })
  })

  it('renders items within a category', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Empanadas')).toBeInTheDocument()
    })
  })

  it('renders add category button', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/agregar categoría/i)).toBeInTheDocument()
    })
  })

  it('renders import from file button', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/importar desde archivo/i)).toBeInTheDocument()
    })
  })
})
