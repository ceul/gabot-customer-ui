import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UpsellCard from '../components/UpsellCard'

const baseProps = {
  open: true,
  itemName: 'Brownie de Chocolate',
  itemPrice: 8500,
  discountApplied: 1700,
  discountType: 'pct',
  reason: 'El postre perfecto para acompañar su Bandeja Paisa.',
  onAccept: () => {},
  onDecline: () => {},
}

describe('UpsellCard', () => {
  it('renders item name', () => {
    render(<UpsellCard {...baseProps} />)
    expect(screen.getByText('Brownie de Chocolate')).toBeInTheDocument()
  })

  it('renders discounted price', () => {
    render(<UpsellCard {...baseProps} />)
    expect(screen.getByText(/6\.800|6,800/)).toBeInTheDocument()
  })

  it('renders original price as strikethrough', () => {
    render(<UpsellCard {...baseProps} />)
    expect(screen.getByText(/8\.500|8,500/)).toBeInTheDocument()
  })

  it('renders reason phrase', () => {
    render(<UpsellCard {...baseProps} />)
    expect(screen.getByText(baseProps.reason)).toBeInTheDocument()
  })

  it('calls onAccept when Agregar is clicked', () => {
    const onAccept = vi.fn()
    render(<UpsellCard {...baseProps} onAccept={onAccept} />)
    fireEvent.click(screen.getByRole('button', { name: /^✓ agregar$/i }))
    expect(onAccept).toHaveBeenCalledOnce()
  })

  it('calls onDecline when Confirmar sin agregar is clicked', () => {
    const onDecline = vi.fn()
    render(<UpsellCard {...baseProps} onDecline={onDecline} />)
    fireEvent.click(screen.getByRole('button', { name: /confirmar sin agregar/i }))
    expect(onDecline).toHaveBeenCalledOnce()
  })

  it('does not render when open=false', () => {
    render(<UpsellCard {...baseProps} open={false} />)
    expect(screen.queryByText('Brownie de Chocolate')).not.toBeInTheDocument()
  })

  it('renders without discount when discountApplied is null', () => {
    render(
      <UpsellCard
        {...baseProps}
        discountApplied={null}
        discountType={null}
      />
    )
    expect(screen.queryByText(/−\d+%/)).not.toBeInTheDocument()
    expect(screen.getByText(/8\.500|8,500/)).toBeInTheDocument()
  })

  it('truncates reason at 80 chars in display but aria-label has full text', () => {
    const longReason = 'A'.repeat(100)
    render(<UpsellCard {...baseProps} reason={longReason} />)
    const reasonEl = screen.getByLabelText(longReason)
    expect(reasonEl).toBeInTheDocument()
  })

  it('has aria-modal dialog role', () => {
    render(<UpsellCard {...baseProps} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
