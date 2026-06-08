import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed, ChevronRight } from 'lucide-react'
import { auth as authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pendingClientId, setPendingClientId] = useState(null)
  const [pendingUsername, setPendingUsername] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [selectingId, setSelectingId] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authApi.login({ username: username.trim(), password })
      if (data.requires_restaurant_selection) {
        setPendingClientId(data.client_id)
        setPendingUsername(data.username)
        setRestaurants(data.restaurants)
        setStep('select-restaurant')
      } else {
        login(data.token, data.client, data.restaurant)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRestaurant = async (restaurantId) => {
    setError(null)
    setSelectingId(restaurantId)
    try {
      const data = await authApi.selectRestaurant({
        client_id: pendingClientId,
        restaurant_id: restaurantId,
      })
      login(data.token, data.client, data.restaurant)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al seleccionar restaurante')
    } finally {
      setSelectingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-surface-container rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-secondary-container rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface border border-outline-variant/40 rounded-2xl p-8 shadow-sm">

          {step === 'credentials' && (
            <>
              <div className="flex flex-col items-center gap-3 text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed size={32} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-space text-2xl font-semibold text-on-surface">Panel de Control</h1>
                  <p className="text-sm text-secondary mt-1">Accede a la administración de tu negocio</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-error-container/50 border border-error/10 rounded-lg px-3 py-2.5 mb-4">
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-secondary ml-0.5">Nombre de usuario</label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="admin"
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface placeholder:text-outline disabled:opacity-50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-secondary ml-0.5">Contraseña</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-on-surface placeholder:text-outline disabled:opacity-50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-full hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Entrar'}
                </button>
              </form>
            </>
          )}

          {step === 'select-restaurant' && (
            <>
              <div className="flex flex-col items-center gap-3 text-center mb-6">
                <div className="w-16 h-16 bg-secondary-container/20 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed size={32} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-space text-xl font-semibold text-on-surface">Selecciona un restaurante</h2>
                  <p className="text-sm text-secondary mt-1">
                    Hola <span className="font-medium text-on-surface">{pendingUsername}</span>, tienes acceso a varios restaurantes.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-error-container/50 border border-error/10 text-on-error-container text-sm rounded-lg px-3 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {restaurants.map(resto => (
                  <button
                    key={resto.id}
                    onClick={() => handleSelectRestaurant(resto.id)}
                    disabled={selectingId !== null}
                    className="w-full flex items-center justify-between px-4 py-3 border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container-low transition-all text-left disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary-container/30 rounded-lg flex items-center justify-center shrink-0">
                        <UtensilsCrossed size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{resto.name}</p>
                        <p className="text-xs text-outline">ID #{resto.id}</p>
                      </div>
                    </div>
                    {selectingId === resto.id ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-outline group-hover:text-primary transition-colors shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setStep('credentials'); setError(null) }}
                className="mt-4 w-full text-sm text-outline hover:text-secondary transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-outline mt-6">
          Panel de administración — acceso restringido
        </p>
      </div>
    </div>
  )
}
