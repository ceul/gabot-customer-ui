import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import RestaurantPage from './pages/RestaurantPage'
import BotPage from './pages/BotPage'
import HoursPage from './pages/HoursPage'
import MenuPage from './pages/MenuPage'
import SpecialsPage from './pages/SpecialsPage'
import ConversationsPage from './pages/ConversationsPage'
import OrdersPage from './pages/OrdersPage'
import PaymentPage from './pages/PaymentPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import WaiterOrderPage from './pages/WaiterOrderPage'
import { Spinner } from './components/ui'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<RestaurantPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/bot" element={<BotPage />} />
                    <Route path="/hours" element={<HoursPage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/specials" element={<SpecialsPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/conversations" element={<ConversationsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/waiter" element={<WaiterOrderPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
