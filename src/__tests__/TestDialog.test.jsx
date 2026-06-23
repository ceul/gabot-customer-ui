import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TestDialog from '../components/TestDialog'

const noop = () => {}

describe('TestDialog', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders dialog with title when open', () => {
    render(<TestDialog open onClose={noop} onSend={noop} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/modo prueba/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<TestDialog open={false} onClose={noop} onSend={noop} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(<TestDialog open onClose={onClose} onSend={noop} />)
    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows send button and text input', () => {
    render(<TestDialog open onClose={noop} onSend={noop} />)
    expect(screen.getByPlaceholderText(/escribe un mensaje/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })

  it('calls onSend with message and empty history on first send', async () => {
    const onSend = vi.fn().mockResolvedValue('Hola, soy Sofia.')
    render(<TestDialog open onClose={noop} onSend={onSend} />)
    const input = screen.getByPlaceholderText(/escribe un mensaje/i)
    await userEvent.type(input, 'Hola')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(onSend).toHaveBeenCalledWith('Hola', []))
  })

  it('renders bot response as a bubble', async () => {
    const onSend = vi.fn().mockResolvedValue('Soy el bot.')
    render(<TestDialog open onClose={noop} onSend={onSend} />)
    await userEvent.type(screen.getByPlaceholderText(/escribe un mensaje/i), 'hi')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(screen.getByText('Soy el bot.')).toBeInTheDocument())
  })

  it('shows Limpiar button after first message', async () => {
    const onSend = vi.fn().mockResolvedValue('ok')
    render(<TestDialog open onClose={noop} onSend={onSend} />)
    expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText(/escribe un mensaje/i), 'hi')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument())
  })

  it('Limpiar clears chat history', async () => {
    const onSend = vi.fn().mockResolvedValue('respuesta del bot')
    render(<TestDialog open onClose={noop} onSend={onSend} />)
    await userEvent.type(screen.getByPlaceholderText(/escribe un mensaje/i), 'hi')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => screen.getByText('respuesta del bot'))
    await userEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(screen.queryByText('respuesta del bot')).not.toBeInTheDocument()
  })

  it('shows error message on send failure', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<TestDialog open onClose={noop} onSend={onSend} />)
    await userEvent.type(screen.getByPlaceholderText(/escribe un mensaje/i), 'hi')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument())
  })
})
