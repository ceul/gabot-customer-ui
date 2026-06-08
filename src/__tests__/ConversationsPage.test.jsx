import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ConversationsPage from '../pages/ConversationsPage'

vi.mock('../api', () => ({
  conversations: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({ messages: [] }),
    send: vi.fn().mockResolvedValue({}),
  },
  bot: {
    get: vi.fn().mockResolvedValue({ bot_name: 'TestBot' }),
  },
}))

function renderPage() {
  return render(<MemoryRouter><ConversationsPage /></MemoryRouter>)
}

describe('ConversationsPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders search input for conversations', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/buscar conversaciones/i)).toBeInTheDocument()
  })

  it('renders the Actualizar refresh button', () => {
    renderPage()
    expect(screen.getByText(/actualizar/i)).toBeInTheDocument()
  })

  it('shows empty state when no conversation is selected (right panel prompt)', () => {
    renderPage()
    expect(screen.getByText(/selecciona una conversación/i)).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = renderPage()
    expect(container).toBeTruthy()
  })
})
