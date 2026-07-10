import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { auth as authApi } from '../api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Enlace inválido')
      return
    }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Enlace inválido o expirado')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface border border-outline-variant/40 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={32} className="text-primary" />
          </div>

          {status === 'verifying' && <p className="text-sm text-secondary">Verificando tu correo...</p>}
          {status === 'success' && (
            <>
              <p className="text-sm text-on-surface">Tu correo fue verificado correctamente.</p>
              <Link to="/login" className="text-sm text-primary hover:underline mt-4 inline-block">Iniciar sesión</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-sm text-error">{message}</p>
              <Link to="/login" className="text-sm text-primary hover:underline mt-4 inline-block">Volver al inicio de sesión</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
