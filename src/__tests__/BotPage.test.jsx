import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BotPage from '../pages/BotPage'

vi.mock('../api', () => ({
  bot: {
    get: vi.fn().mockResolvedValue({
      bot_name: 'Gabot',
      language: 'es',
      tone: 'friendly',
      personality: 'Asistente amigable',
      greeting: 'Hola!',
      notify_on_status_change: true,
    }),
    update: vi.fn().mockResolvedValue({}),
  },
  metaCredentials: {
    get: vi.fn().mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true }),
    update: vi.fn().mockResolvedValue({}),
  },
}))

describe('BotPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/configuración del bot/i)).toBeInTheDocument()
    })
  })

  it('loads bot name into input after fetch', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Gabot')).toBeInTheDocument()
    })
  })

  it('renders section headings', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Identidad')).toBeInTheDocument()
      expect(screen.getByText('Personalidad')).toBeInTheDocument()
      expect(screen.getByText('Notificaciones')).toBeInTheDocument()
    })
  })

  it('renders the Meta credentials section', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/credenciales de whatsapp/i)).toBeInTheDocument()
    })
  })

  it('renders tone and language selects', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      // Field labels are not associated via htmlFor; check by role + option text
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('Amigable')).toBeInTheDocument()
      expect(screen.getByText('Español')).toBeInTheDocument()
    })
  })
})
