import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MetaCredentialsCard from '../components/MetaCredentialsCard'

vi.mock('../api', () => ({
  metaCredentials: {
    get: vi.fn(),
    update: vi.fn(),
  },
}))

import { metaCredentials as api } from '../api'

const renderCard = () =>
  render(<MemoryRouter><MetaCredentialsCard /></MemoryRouter>)

describe('MetaCredentialsCard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the card heading', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '', has_token: false })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales de whatsapp/i)).toBeInTheDocument()
    })
  })

  it('loads phone_number_id and waba_id into fields', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111222', waba_id: '333444', has_token: false })
    renderCard()
    await waitFor(() => {
      expect(screen.getByDisplayValue('111222')).toBeInTheDocument()
      expect(screen.getByDisplayValue('333444')).toBeInTheDocument()
    })
  })

  it('shows masked placeholder for token when has_token is true', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/token guardado/i)).toBeInTheDocument()
    })
  })

  it('token field is always type=password', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '', has_token: false })
    renderCard()
    await waitFor(() => {
      const tokenInput = screen.getByPlaceholderText(/•••/i)
      expect(tokenInput).toHaveAttribute('type', 'password')
    })
  })

  it('shows green badge when all credentials are present', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales configuradas/i)).toBeInTheDocument()
    })
  })

  it('shows warning badge when credentials are incomplete', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '', has_token: false })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales incompletas/i)).toBeInTheDocument()
    })
  })

  it('omits token from payload when token field is empty', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    api.update.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => screen.getByText(/guardar/i))

    fireEvent.click(screen.getByText(/guardar credenciales/i))
    await waitFor(() => {
      expect(api.update).toHaveBeenCalledWith(
        expect.not.objectContaining({ meta_access_token: expect.anything() })
      )
    })
  })

  it('includes token in payload when token field is filled', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: false })
    api.update.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => screen.getByPlaceholderText(/•••/i))

    await user.type(screen.getByPlaceholderText(/•••/i), 'EAANewToken')
    fireEvent.click(screen.getByText(/guardar credenciales/i))
    await waitFor(() => {
      expect(api.update).toHaveBeenCalledWith(
        expect.objectContaining({ meta_access_token: 'EAANewToken' })
      )
    })
  })

  it('shows warning badge when has_token is true but phone_number_id is empty', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales incompletas/i)).toBeInTheDocument()
    })
  })

  it('shows error message when api.get fails', async () => {
    api.get.mockRejectedValue(new Error('network'))
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument()
    })
  })
})
