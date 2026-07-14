import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { auth as authApi } from '../api'
import { getRecaptchaToken } from '../utils/recaptcha'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const recaptcha_token = await getRecaptchaToken('forgot_password')
      await authApi.forgotPassword({ email: email.trim(), recaptcha_token })
    } catch {
      // Anti-enumeration: show the same generic message regardless of outcome.
    } finally {
      setDone(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface border border-outline-variant/40 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={32} className="text-primary" />
            </div>
            <h1 className="font-space text-2xl font-semibold text-on-surface">Recuperar contraseña</h1>
          </div>

          {done ? (
            <p className="text-sm text-on-surface text-center">
              Si el correo existe, enviamos un enlace para restablecer tu contraseña.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-secondary ml-0.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="tu@correo.com"
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface placeholder:text-outline disabled:opacity-50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-full hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Enviar enlace'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-secondary mt-6">
            <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
