import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Store, Bot, Clock, UtensilsCrossed, Star, MessageSquare, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, LogOut, CreditCard, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const mainNav = [
  { to: '/orders',        label: 'Pedidos',         icon: ShoppingBag },
  { to: '/waiter',        label: 'Tomar Pedido',    icon: ClipboardList },
  { to: '/conversations', label: 'Conversaciones',  icon: MessageSquare },
]

const configNav = [
  { to: '/',         label: 'Restaurante',        icon: Store },
  { to: '/bot',      label: 'Config. del Bot',    icon: Bot },
  { to: '/hours',    label: 'Horarios',           icon: Clock },
  { to: '/menu',     label: 'Menú',               icon: UtensilsCrossed },
  { to: '/specials', label: 'Especiales del Día', icon: Star },
  { to: '/payment',  label: 'Métodos de Pago',    icon: CreditCard },
]

function NavItem({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && label}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, restaurant, logout } = useAuth()
  const fullHeight = pathname.startsWith('/conversations') || pathname.startsWith('/orders') || pathname.startsWith('/waiter')
  const [configOpen, setConfigOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-14'} bg-surface border-r border-outline-variant/30 flex flex-col shrink-0 transition-all duration-200 overflow-hidden`}>
        <div className={`px-3 py-5 border-b border-outline-variant/30 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="font-space text-base font-bold text-primary truncate">Panel de Control</h1>
              <p className="text-xs text-secondary mt-0.5 truncate">Administración</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors shrink-0"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {mainNav.map(item => <NavItem key={item.to} {...item} collapsed={!sidebarOpen} />)}

          <div className="pt-2">
            {sidebarOpen ? (
              <button
                onClick={() => setConfigOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-outline hover:text-secondary transition-colors"
              >
                Configuraciones
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200"
                  style={{ transform: configOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                />
              </button>
            ) : (
              <div className="border-t border-outline-variant/30 mx-2 my-1" />
            )}

            {(sidebarOpen ? configOpen : true) && (
              <div className="mt-1 space-y-1">
                {configNav.map(item => <NavItem key={item.to} {...item} collapsed={!sidebarOpen} />)}
              </div>
            )}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-outline-variant/30 shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-on-surface truncate">{user?.username}</p>
                <p className="text-xs text-secondary truncate">{restaurant?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-md text-outline hover:text-error hover:bg-error-container/30 transition-colors shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-full flex items-center justify-center p-1.5 rounded-md text-outline hover:text-error hover:bg-error-container/30 transition-colors"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {fullHeight
          ? children
          : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8">{children}</div>
            </div>
          )
        }
      </main>
    </div>
  )
}
