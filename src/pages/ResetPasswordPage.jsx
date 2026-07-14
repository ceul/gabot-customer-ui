import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { auth as authApi } from '../api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.resetPassword({ token, new_password: password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo restablecer la contraseña')
    } finally {
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
            <h1 className="font-space text-2xl font-semibold text-on-surface">Restablecer contraseña</h1>
          </div>

          {done ? (
            <>
              <p className="text-sm text-on-surface text-center">Tu contraseña fue restablecida.</p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full mt-4 px-4 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-full hover:bg-primary-container transition-all"
              >
                Iniciar sesión
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 bg-error-container/50 border border-error/10 rounded-lg px-3 py-2.5">
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-secondary ml-0.5">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface placeholder:text-outline disabled:opacity-50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || password.length < 8 || !token}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-full hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Restablecer'}
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
