import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PasswordInput from '../components/PasswordInput'

describe('PasswordInput', () => {
  it('renders as a password field by default', () => {
    render(<PasswordInput value="secret" onChange={() => {}} placeholder="••••••••" />)
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password')
  })

  it('reveals the password as plain text when the eye icon is clicked', () => {
    render(<PasswordInput value="secret" onChange={() => {}} placeholder="••••••••" />)
    fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }))
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'text')
  })

  it('hides the password again when the eye icon is clicked a second time', () => {
    render(<PasswordInput value="secret" onChange={() => {}} placeholder="••••••••" />)
    const toggle = screen.getByRole('button', { name: /mostrar contraseña/i })
    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }))
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password')
  })

  it('forwards value, onChange, and other input props', () => {
    const handleChange = vi.fn()
    render(
      <PasswordInput
        value="abc"
        onChange={handleChange}
        placeholder="••••••••"
        required
        disabled={false}
        autoComplete="current-password"
      />
    )
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveValue('abc')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('autocomplete', 'current-password')
    fireEvent.change(input, { target: { value: 'abcd' } })
    expect(handleChange).toHaveBeenCalled()
  })
})
