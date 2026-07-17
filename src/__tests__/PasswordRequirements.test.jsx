import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PasswordRequirements from '../components/PasswordRequirements'

describe('PasswordRequirements', () => {
  it('renders all four rule labels', () => {
    render(<PasswordRequirements password="" attempted={false} />)
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Una letra mayúscula')).toBeInTheDocument()
    expect(screen.getByText('Una letra minúscula')).toBeInTheDocument()
    expect(screen.getByText('Un número')).toBeInTheDocument()
  })

  it('marks a satisfied rule as passed', () => {
    render(<PasswordRequirements password="Password123" attempted={false} />)
    expect(screen.getByText('Mínimo 8 caracteres')).toHaveAttribute('data-state', 'passed')
  })

  it('does not mark an unsatisfied rule as an error before a submit attempt', () => {
    render(<PasswordRequirements password="short" attempted={false} />)
    expect(screen.getByText('Una letra mayúscula')).toHaveAttribute('data-state', 'pending')
  })

  it('marks unsatisfied rules as errors after a failed submit attempt', () => {
    render(<PasswordRequirements password="short" attempted={true} />)
    expect(screen.getByText('Una letra mayúscula')).toHaveAttribute('data-state', 'error')
    expect(screen.getByText('Un número')).toHaveAttribute('data-state', 'error')
  })

  it('still marks satisfied rules as passed even after a failed submit attempt', () => {
    render(<PasswordRequirements password="short" attempted={true} />)
    expect(screen.getByText('Una letra minúscula')).toHaveAttribute('data-state', 'passed')
  })
})
