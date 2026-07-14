import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EmailInput from '../components/EmailInput'

describe('EmailInput', () => {
  it('renders an email input', () => {
    render(<EmailInput value="" onChange={() => {}} placeholder="tu@correo.com" />)
    expect(screen.getByPlaceholderText('tu@correo.com')).toHaveAttribute('type', 'email')
  })

  it('shows no error before the field is touched', () => {
    render(<EmailInput value="not-an-email" onChange={() => {}} placeholder="tu@correo.com" />)
    expect(screen.queryByText(/correo inválido/i)).not.toBeInTheDocument()
  })

  it('shows an error after blurring with an invalid value', () => {
    render(<EmailInput value="not-an-email" onChange={() => {}} placeholder="tu@correo.com" />)
    fireEvent.blur(screen.getByPlaceholderText('tu@correo.com'))
    expect(screen.getByText(/correo inválido/i)).toBeInTheDocument()
  })

  it('shows no error after blurring with a valid value', () => {
    render(<EmailInput value="user@example.com" onChange={() => {}} placeholder="tu@correo.com" />)
    fireEvent.blur(screen.getByPlaceholderText('tu@correo.com'))
    expect(screen.queryByText(/correo inválido/i)).not.toBeInTheDocument()
  })

  it('shows no error after blurring an empty value', () => {
    render(<EmailInput value="" onChange={() => {}} placeholder="tu@correo.com" />)
    fireEvent.blur(screen.getByPlaceholderText('tu@correo.com'))
    expect(screen.queryByText(/correo inválido/i)).not.toBeInTheDocument()
  })

  it('forwards onChange', () => {
    const handleChange = vi.fn()
    render(<EmailInput value="" onChange={handleChange} placeholder="tu@correo.com" />)
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'a' } })
    expect(handleChange).toHaveBeenCalled()
  })
})
