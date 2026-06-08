import { createContext, useContext, useState, useEffect } from 'react'
import { auth as authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [restaurant, setRestaurant] = useState(() => {
    try { return JSON.parse(localStorage.getItem('restaurant')) } catch { return null }
  })
  const needsFetch = !!token && !user
  const [loading, setLoading] = useState(needsFetch)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('restaurant')
    setToken(null)
    setUser(null)
    setRestaurant(null)
  }

  useEffect(() => {
    if (!needsFetch) return
    authApi.me()
      .then(data => { setUser(data.client); setRestaurant(data.restaurant) })
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = (tokenStr, clientData, restaurantData) => {
    localStorage.setItem('token', tokenStr)
    localStorage.setItem('user', JSON.stringify(clientData))
    localStorage.setItem('restaurant', JSON.stringify(restaurantData))
    setToken(tokenStr)
    setUser(clientData)
    setRestaurant(restaurantData)
  }

  return (
    <AuthContext.Provider value={{ token, user, restaurant, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
