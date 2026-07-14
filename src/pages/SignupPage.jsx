import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { auth as authApi } from '../api'
import { getRecaptchaToken } from '../utils/recaptcha'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PasswordInput from '../components/PasswordInput'
import EmailInput from '../components/EmailInput'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const passwordsMismatch = confirmPassword !== '' && password !== confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (passwordsMismatch) return
    setError(null)
    setLoading(true)
    try {
      const recaptcha_token = await getRecaptchaToken('signup')
      await authApi.signup({ email: email.trim(), password, recaptcha_token })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleCredential = useCallback(async (idToken) => {
    setError(null)
    setLoading(true)
    try {
      await authApi.googleLogin(idToken)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse con Google')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface border border-outline-variant/40 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="font-space text-2xl font-semibold text-on-surface">Crea tu cuenta</h1>
              <p className="text-sm text-secondary mt-1">Empieza a administrar tu restaurante con Gabot</p>
            </div>
          </div>

          {done ? (
            <div className="text-center">
              <p className="text-sm text-on-surface">
                Revisa <span className="font-medium">{email}</span> y haz clic en el enlace de verificación para activar tu cuenta.
              </p>
              <Link to="/login" className="text-sm text-primary hover:underline mt-4 inline-block">Volver al inicio de sesión</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-error-container/50 border border-error/10 rounded-lg px-3 py-2.5 mb-4">
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-secondary ml-0.5">Correo electrónico</label>
                  <EmailInput
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="tu@correo.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-secondary ml-0.5">Contraseña</label>
                  <PasswordInput
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-secondary ml-0.5">Confirmar contraseña</label>
                  <PasswordInput
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Repite tu contraseña"
                  />
                  {passwordsMismatch && (
                    <span className="text-xs text-error ml-0.5">Las contraseñas no coinciden</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || password.length < 8 || passwordsMismatch || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-full hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Crear cuenta'}
                </button>
              </form>

              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-outline">o</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              <GoogleSignInButton onCredential={handleGoogleCredential} />

              <p className="text-center text-sm text-secondary mt-6">
                ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
