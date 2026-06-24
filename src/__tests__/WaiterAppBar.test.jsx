import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WaiterAppBar from '../components/WaiterAppBar'

describe('WaiterAppBar', () => {
  it('renders the title', () => {
    render(<WaiterAppBar title="Nuevo pedido" onClose={() => {}} />)
    expect(screen.getByText('Nuevo pedido')).toBeInTheDocument()
  })

  it('renders a close button', () => {
    render(<WaiterAppBar title="Nuevo pedido" onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<WaiterAppBar title="Nuevo pedido" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has amber background', () => {
    const { container } = render(<WaiterAppBar title="Nuevo pedido" onClose={() => {}} />)
    const bar = container.firstChild
    expect(bar.className).toMatch(/amber/)
  })
})
