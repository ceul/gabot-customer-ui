import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TableChip from '../components/TableChip'

describe('TableChip', () => {
  it('renders the label', () => {
    render(<TableChip label="Mesa 3" onClick={() => {}} />)
    expect(screen.getByText('Mesa 3')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<TableChip label="Mesa 3" onClick={onClick} />)
    fireEvent.click(screen.getByText('Mesa 3'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies selected style when selected=true', () => {
    const { container } = render(<TableChip label="Mesa 3" selected onClick={() => {}} />)
    expect(container.firstChild.className).toMatch(/selected|bg-amber|ring/)
  })

  it('does not apply selected style when selected=false', () => {
    const { container } = render(<TableChip label="Mesa 3" onClick={() => {}} />)
    expect(container.firstChild.className).not.toMatch(/ring-2 ring-amber-600 ring-offset/)
  })

  it('applies takeout variant style', () => {
    const { container } = render(<TableChip label="Para llevar 🛵" variant="takeout" onClick={() => {}} />)
    expect(container.firstChild.className).toMatch(/takeout|border-dashed/)
  })

  it('has minimum touch target height', () => {
    const { container } = render(<TableChip label="Mesa 1" onClick={() => {}} />)
    expect(container.firstChild.className).toMatch(/h-11/)
  })
})
