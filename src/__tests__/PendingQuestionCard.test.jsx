import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PendingQuestionCard from '../components/PendingQuestionCard'

const baseProps = {
  question: { id: 5, customer_question: 'Se puede anadir arequipe a las empanadas?', status: 'open' },
  onResolve: () => {},
}

describe('PendingQuestionCard', () => {
  it('renders the customer question', () => {
    render(<PendingQuestionCard {...baseProps} />)
    expect(screen.getByText('Se puede anadir arequipe a las empanadas?')).toBeInTheDocument()
  })

  it('calls onResolve with a Yes answer when Si is clicked', () => {
    const onResolve = vi.fn()
    render(<PendingQuestionCard {...baseProps} onResolve={onResolve} />)
    fireEvent.click(screen.getByRole('button', { name: /^s[íi]$/i }))
    expect(onResolve).toHaveBeenCalledWith(5, expect.stringMatching(/s[íi]/i))
  })

  it('calls onResolve with a No answer when No is clicked', () => {
    const onResolve = vi.fn()
    render(<PendingQuestionCard {...baseProps} onResolve={onResolve} />)
    fireEvent.click(screen.getByRole('button', { name: /^no$/i }))
    expect(onResolve).toHaveBeenCalledWith(5, expect.stringMatching(/no/i))
  })

  it('calls onResolve with a decline answer when Rechazar is clicked', () => {
    const onResolve = vi.fn()
    render(<PendingQuestionCard {...baseProps} onResolve={onResolve} />)
    fireEvent.click(screen.getByRole('button', { name: /rechazar/i }))
    expect(onResolve).toHaveBeenCalledWith(5, expect.any(String))
  })

  it('shows "already answered" state when resolving fails as already-resolved', async () => {
    const onResolve = vi.fn().mockRejectedValue({ response: { status: 409 } })
    render(<PendingQuestionCard {...baseProps} onResolve={onResolve} />)
    fireEvent.click(screen.getByRole('button', { name: /^s[íi]$/i }))
    expect(await screen.findByText(/ya fue respondida|already answered/i)).toBeInTheDocument()
  })
})
