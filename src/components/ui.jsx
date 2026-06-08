/** Shared primitive components — Cerulean Sentinel design system */

export function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="font-space text-xl font-semibold text-on-surface">{title}</h2>
      {description && <p className="text-sm text-secondary mt-1">{description}</p>}
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-secondary">{label}</label>
      {children}
      {hint && <span className={`text-xs ${error ? 'text-error' : 'text-outline'}`}>{hint}</span>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface placeholder:text-outline transition-colors ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full px-3 py-2 text-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface placeholder:text-outline resize-none transition-colors ${className}`}
      {...props}
    />
  )
}

export function Select({ options, className = '', ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary text-on-surface transition-colors ${className}`}
      {...props}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer select-none"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-outline-variant'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      {label && <span className="text-sm text-on-surface">{label}</span>}
    </label>
  )
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-on-primary rounded-full hover:bg-primary-container shadow-sm active:scale-[0.98]',
    secondary: 'bg-surface-container-lowest text-secondary border border-outline-variant rounded-lg hover:bg-surface-container-low',
    danger: 'bg-error-container text-on-error-container border border-error/20 rounded-lg hover:bg-error/10',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function SaveBar({ saving, saved, onSave }) {
  return (
    <div className="flex items-center justify-end gap-3 mt-6">
      {saved && <span className="text-sm text-primary font-medium">¡Guardado!</span>}
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function ErrorMsg({ message }) {
  return (
    <div className="bg-error-container border border-error/20 text-on-error-container text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  )
}
