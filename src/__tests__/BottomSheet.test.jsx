import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BottomSheet from '../components/BottomSheet'

describe('BottomSheet', () => {
  it('renders children when open', () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <span>Contenido del sheet</span>
      </BottomSheet>
    )
    expect(screen.getByText('Contenido del sheet')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <span>Oculto</span>
      </BottomSheet>
    )
    expect(screen.queryByText('Oculto')).not.toBeInTheDocument()
  })

  it('has role=dialog with aria-modal when open', () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <span>Hola</span>
      </BottomSheet>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { getByTestId } = render(
      <BottomSheet open onClose={onClose}>
        <span>Content</span>
      </BottomSheet>
    )
    fireEvent.click(getByTestId('bottom-sheet-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has a drag handle', () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}}>
        <span>Content</span>
      </BottomSheet>
    )
    expect(container.querySelector('[data-testid="drag-handle"]')).toBeInTheDocument()
  })
})
