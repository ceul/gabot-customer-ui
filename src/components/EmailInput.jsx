import { useState } from 'react'
import { isValidEmail } from '../utils/validation'

export default function EmailInput({ value, onChange, className = '', ...props }) {
  const [touched, setTouched] = useState(false)
  const showError = touched && value !== '' && !isValidEmail(value)

  return (
    <>
      <input
        type="email"
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:border-primary text-on-surface placeholder:text-outline disabled:opacity-50 transition-colors ${showError ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'} ${className}`}
        {...props}
      />
      {showError && <span className="text-xs text-error ml-0.5">Correo inválido</span>}
    </>
  )
}
