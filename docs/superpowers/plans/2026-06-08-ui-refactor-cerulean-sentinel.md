# UI Refactor — Cerulean Sentinel Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor all 9 pages of gabot-customer-ui to the Cerulean Sentinel design system: light mode, cerulean-blue primary (#0058be), Space Grotesk headlines, Inter body.

**Architecture:** Generate 5 missing Stitch screens, then apply Cerulean Sentinel tokens across a shared CSS layer + ui.jsx primitives, then re-skin each page's JSX. All logic (API calls, state, hooks) stays unchanged — only className values and structural JSX change.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`), Vitest, @testing-library/react, Stitch MCP

---

## File Map

| File | Action |
|---|---|
| `src/index.css` | Replace: add @theme tokens + Google Fonts import |
| `src/components/ui.jsx` | Replace: re-skin all 11 primitives to Cerulean Sentinel |
| `src/components/Layout.jsx` | Replace: blue active nav, white sidebar |
| `vitest.config.js` | Create |
| `src/test-setup.js` | Create |
| `src/__tests__/ui.test.jsx` | Create |
| `src/__tests__/LoginPage.test.jsx` | Create |
| `src/__tests__/OrdersPage.test.jsx` | Create |
| `src/__tests__/ConversationsPage.test.jsx` | Create |
| `src/__tests__/RestaurantPage.test.jsx` | Create |
| `src/__tests__/BotPage.test.jsx` | Create |
| `src/__tests__/HoursPage.test.jsx` | Create |
| `src/__tests__/MenuPage.test.jsx` | Create |
| `src/__tests__/SpecialsPage.test.jsx` | Create |
| `src/__tests__/PaymentPage.test.jsx` | Create |
| `src/pages/LoginPage.jsx` | Replace |
| `src/pages/OrdersPage.jsx` | Modify: className updates |
| `src/pages/ConversationsPage.jsx` | Modify: className updates |
| `src/pages/RestaurantPage.jsx` | Modify: className updates |
| `src/pages/BotPage.jsx` | Modify: className updates |
| `src/pages/HoursPage.jsx` | Modify: className updates |
| `src/pages/MenuPage.jsx` | Modify: className updates |
| `src/pages/SpecialsPage.jsx` | Modify: className updates |
| `src/pages/PaymentPage.jsx` | Modify: className updates |

---

## Cerulean Sentinel Class Mapping Reference

Use this when updating page classNames. Every page update follows this mapping:

| Old (indigo/gray) | New (Cerulean Sentinel) |
|---|---|
| `bg-gray-50` (page bg) | `bg-background` |
| `bg-white` (card bg) | `bg-surface` |
| `border-gray-200` | `border-outline-variant` |
| `text-gray-900` (headings) | `text-on-surface` |
| `text-gray-700` (labels) | `text-secondary` |
| `text-gray-500` (hints) | `text-secondary` |
| `text-gray-400` (muted) | `text-outline` |
| `bg-indigo-600` (primary btn) | `bg-primary` |
| `hover:bg-indigo-700` | `hover:bg-primary-container` |
| `text-indigo-*` | `text-primary` |
| `bg-indigo-50` (active bg) | `bg-secondary-container` |
| `focus:ring-indigo-500` | `focus:ring-primary` |
| `border-indigo-300` | `border-primary` |
| `bg-red-50` | `bg-error-container` |
| `border-red-200` | `border-error/30` |
| `text-red-700` | `text-on-error-container` |
| `text-green-600` | `text-primary` |
| `font-semibold` on headings | `font-space font-semibold` |
| `rounded-xl` cards | `rounded-xl` (unchanged) |
| `rounded-lg` buttons | `rounded-full` primary, `rounded-lg` secondary |

---

## Task 1: Generate 5 Missing Stitch Screens

**Files:** MCP calls only — no code files

- [ ] **Step 1: Load the generate_screen_from_text tool schema**

Run in Claude Code:
```
ToolSearch: select:mcp__stitch__generate_screen_from_text
```

- [ ] **Step 2: Generate "Configuración del Bot" screen**

Call `mcp__stitch__generate_screen_from_text` with:
```json
{
  "projectId": "4767975864860178078",
  "text": "Cerulean Sentinel admin panel screen: 'Configuración del Bot'. Light mode, bg #f8f9ff, primary blue #0058be. Mobile-first. Spanish UI. Shows: Bot name input field, Language dropdown (Español/English/Français/Português), Tone dropdown (Amigable/Formal/Casual/Profesional/Entusiasta), Personality textarea (long text for bot description), Greeting message textarea, Notification toggle for order status changes. Same sidebar navigation as other screens in this project. Save button at bottom.",
  "title": "Configuración del Bot"
}
```

- [ ] **Step 3: Generate "Horarios del Restaurante" screen**

Call `mcp__stitch__generate_screen_from_text` with:
```json
{
  "projectId": "4767975864860178078",
  "text": "Cerulean Sentinel admin panel screen: 'Horarios del Restaurante'. Light mode, bg #f8f9ff, primary blue #0058be. Mobile-first. Spanish UI. Shows: 7-row table for Lunes through Domingo. Each row has: day name, open/closed toggle, open time picker (disabled when closed), close time picker (disabled when closed), save button per row with 'Guardado' success state. Same sidebar navigation as other screens in this project.",
  "title": "Horarios del Restaurante"
}
```

- [ ] **Step 4: Generate "Menú del Restaurante" screen**

Call `mcp__stitch__generate_screen_from_text` with:
```json
{
  "projectId": "4767975864860178078",
  "text": "Cerulean Sentinel admin panel screen: 'Menú del Restaurante'. Light mode, bg #f8f9ff, primary blue #0058be. Mobile-first. Spanish UI. Shows: list of collapsible category sections (each with chevron toggle, category name, item count, add item button, delete button). Inside each category: list of items with name, price, description, availability toggle. Inline edit form when item is selected. Import menu button in header. Same sidebar navigation as other screens in this project.",
  "title": "Menú del Restaurante"
}
```

- [ ] **Step 5: Generate "Promociones y Especiales" screen**

Call `mcp__stitch__generate_screen_from_text` with:
```json
{
  "projectId": "4767975864860178078",
  "text": "Cerulean Sentinel admin panel screen: 'Promociones y Especiales'. Light mode, bg #f8f9ff, primary blue #0058be. Mobile-first. Spanish UI. Shows: list of special cards each with: day of week dropdown, title input, description textarea, active toggle, save/delete buttons. Add new special form at top. Same sidebar navigation as other screens in this project.",
  "title": "Promociones y Especiales"
}
```

- [ ] **Step 6: Generate "Métodos de Pago" screen**

Call `mcp__stitch__generate_screen_from_text` with:
```json
{
  "projectId": "4767975864860178078",
  "text": "Cerulean Sentinel admin panel screen: 'Métodos de Pago'. Light mode, bg #f8f9ff, primary blue #0058be. Mobile-first. Spanish UI. Shows: simple method cards for cash and credit/debit card (toggle enabled/disabled). Bank transfer section with list of bank account cards showing: bank name, account holder, account info, QR code image upload area (dashed border placeholder). Add bank account button. Same sidebar navigation as other screens in this project.",
  "title": "Métodos de Pago"
}
```

- [ ] **Step 7: Review generated screens in browser**

Open each generated screen's htmlCode.downloadUrl in the browser:
```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
# For each screen returned, navigate to its download URL
$B goto "<htmlCode.downloadUrl from each response>"
$B snapshot -i
```

Verify each screen visually matches Cerulean Sentinel style (light bg, blue primary, consistent with Login/Orders/Conversations/Restaurant). If a screen looks wrong, re-generate with a more specific prompt.

- [ ] **Step 8: Commit note**

No files to commit in this task — Stitch stores screens remotely. Record the 5 new screen IDs from the MCP responses for future reference in the project docs.

---

## Task 2: CSS Design Tokens

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace index.css completely**

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

@theme {
  /* Cerulean Sentinel — full color palette */
  --color-primary: #0058be;
  --color-primary-container: #2170e4;
  --color-primary-fixed: #d8e2ff;
  --color-primary-fixed-dim: #adc6ff;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #fefcff;
  --color-secondary: #545f73;
  --color-secondary-container: #d5e0f8;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #586377;
  --color-tertiary: #595c5e;
  --color-on-tertiary: #ffffff;
  --color-surface: #f8f9ff;
  --color-surface-bright: #f8f9ff;
  --color-surface-dim: #cbdbf5;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #eff4ff;
  --color-surface-container: #e5eeff;
  --color-surface-container-high: #dce9ff;
  --color-surface-container-highest: #d3e4fe;
  --color-surface-variant: #d3e4fe;
  --color-background: #f8f9ff;
  --color-on-surface: #0b1c30;
  --color-on-surface-variant: #424754;
  --color-on-background: #0b1c30;
  --color-outline: #727785;
  --color-outline-variant: #c2c6d6;
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-on-error: #ffffff;
  --color-on-error-container: #93000a;
  --color-inverse-surface: #213145;
  --color-inverse-on-surface: #eaf1ff;
  --color-inverse-primary: #adc6ff;

  /* Spacing scale */
  --spacing-xs: 4px;
  --spacing-base: 8px;
  --spacing-sm: 12px;
  --spacing-md: 24px;
  --spacing-lg: 48px;
  --spacing-xl: 80px;
  --spacing-gutter: 24px;
  --spacing-margin-mobile: 16px;
  --spacing-margin-desktop: 48px;

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-space: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9ff;
  color: #0b1c30;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #c2c6d6; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #0058be; }
```

- [ ] **Step 2: Run dev server to verify CSS loads**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run dev
```

Expected: Server starts on port 3000, no CSS errors in terminal. The page background should shift from gray-50 to #f8f9ff (nearly the same, but tokens are now active).

- [ ] **Step 3: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/index.css
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: add Cerulean Sentinel design tokens to index.css"
```

---

## Task 3: Update Shared UI Primitives

**Files:**
- Modify: `src/components/ui.jsx`

- [ ] **Step 1: Replace ui.jsx completely**

```jsx
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
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
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
```

- [ ] **Step 2: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/components/ui.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle ui.jsx primitives to Cerulean Sentinel"
```

---

## Task 4: Update Sidebar Layout

**Files:**
- Modify: `src/components/Layout.jsx`

- [ ] **Step 1: Replace Layout.jsx completely**

```jsx
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Store, Bot, Clock, UtensilsCrossed, Star, MessageSquare, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, LogOut, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const mainNav = [
  { to: '/orders',        label: 'Pedidos',         icon: ShoppingBag },
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
  const fullHeight = pathname.startsWith('/conversations') || pathname.startsWith('/orders')
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
```

- [ ] **Step 2: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/components/Layout.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: update Layout sidebar to Cerulean Sentinel"
```

---

## Task 5: Setup Vitest + React Testing Library

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test-setup.js`

- [ ] **Step 1: Install test dependencies**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: packages added to node_modules, no peer dependency errors.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest"` and `"test:run": "vitest run"` to the `scripts` object:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
    css: false,
  },
})
```

- [ ] **Step 4: Create src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Run vitest to confirm zero-test baseline**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run
```

Expected output: `No test files found` (or 0 tests, 0 failures). Not an error.

- [ ] **Step 6: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add vitest.config.js src/test-setup.js package.json package-lock.json
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: add Vitest + React Testing Library setup"
```

---

## Task 6: LoginPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/LoginPage.test.jsx`
- Modify: `src/pages/LoginPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/LoginPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}))

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../api', () => ({
  auth: {
    login: vi.fn(),
    selectRestaurant: vi.fn(),
    me: vi.fn(),
  },
}))

function renderLogin() {
  return render(<MemoryRouter><LoginPage /></MemoryRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    renderLogin()
    expect(screen.getByText('Panel de Control')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    const { auth } = await import('../api')
    auth.login.mockRejectedValueOnce({
      response: { data: { error: 'Credenciales incorrectas' } }
    })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'bad' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
    })
  })

  it('shows restaurant selector after successful login with multiple restaurants', async () => {
    const { auth } = await import('../api')
    auth.login.mockResolvedValueOnce({
      requires_restaurant_selection: true,
      client_id: 1,
      username: 'testuser',
      restaurants: [
        { id: 1, name: 'Restaurante Uno' },
        { id: 2, name: 'Restaurante Dos' },
      ],
    })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'user' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Restaurante Uno')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run -- LoginPage
```

Expected: FAIL — `LoginPage` not yet restyled, but tests should fail only if render structure changes. If tests pass now (because existing render works), that's also fine — proceed to implementation.

- [ ] **Step 3: Replace LoginPage.jsx**

```jsx
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
      {/* Atmospheric background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-surface-container rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-secondary-container rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Card */}
        <div className="bg-surface border border-outline-variant/40 rounded-2xl p-8 shadow-sm">

          {step === 'credentials' && (
            <>
              {/* Header */}
              <div className="flex flex-col items-center gap-3 text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed size={32} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-space text-2xl font-semibold text-on-surface">Panel de Control</h1>
                  <p className="text-sm text-secondary mt-1">Accede a la administración de tu negocio</p>
                </div>
              </div>

              {/* Error */}
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run -- LoginPage
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/LoginPage.test.jsx src/pages/LoginPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle LoginPage to Cerulean Sentinel"
```

---

## Task 7: OrdersPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/OrdersPage.test.jsx`
- Modify: `src/pages/OrdersPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/OrdersPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OrdersPage from '../pages/OrdersPage'

vi.mock('../api', () => ({
  orders: { list: vi.fn().mockResolvedValue([]), get: vi.fn(), updateStatus: vi.fn() },
}))

vi.mock('../socket', () => ({
  default: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

function renderOrders() {
  return render(<MemoryRouter><OrdersPage /></MemoryRouter>)
}

describe('OrdersPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    renderOrders()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
  })

  it('renders view toggle buttons', () => {
    renderOrders()
    expect(screen.getByTitle(/kanban/i)).toBeInTheDocument()
  })

  it('shows empty state when no orders', async () => {
    renderOrders()
    // No orders loaded → no order cards visible
    expect(screen.queryAllByText(/#ORD-/)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail or pass baseline**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run -- OrdersPage
```

Expected: Tests pass or fail with import errors. Fix import errors before restyling.

- [ ] **Step 3: Apply Cerulean Sentinel styles to OrdersPage.jsx**

Open `src/pages/OrdersPage.jsx`. Apply the class mapping from the reference table at the top of this plan. Key sections to update:

**Page wrapper** (find `className="flex flex-col h-full` or similar):
- Old: `className="flex flex-col h-full bg-gray-900"` / dark header variant
- New: `className="flex flex-col h-full bg-background"`

**Page header bar** (the sticky top bar with "Pedidos" title):
```jsx
<div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-4 h-16 shrink-0">
  <div className="flex items-center gap-2">
    <h2 className="font-space text-lg font-bold text-primary">Pedidos</h2>
    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {orders.length}
    </span>
  </div>
  {/* view toggle + refresh buttons — unchanged logic */}
</div>
```

**View toggle buttons** (Kanban / Table):
- Old: `bg-white text-gray-700` / `bg-gray-800 text-white`
- New active: `bg-primary text-on-primary rounded-lg`
- New inactive: `bg-surface-container text-secondary rounded-lg hover:bg-surface-container-high`

**Status filter tabs** (En Espera / En Proceso / etc.):
- Old: gray/amber/blue/green variants
- New active tab: `bg-primary text-on-primary rounded-full`
- New inactive tab: `bg-surface-container text-secondary rounded-full hover:bg-surface-container-high`

**Order cards** (in Kanban and Table):
- Old: `bg-white shadow border-l-4 border-amber-400`
- New: `bg-surface border border-outline-variant/30 rounded-xl p-3 shadow-sm`
- Status indicator: left border or dot, use these colors:
  - `on_hold`: `border-l-4 border-amber-400` (keep amber — it's a status, not primary UI)
  - `in_process`: `border-l-4 border-blue-400`
  - `done`: `border-l-4 border-green-500`
  - `delivered`: `border-l-4 border-outline`

**Kanban columns**:
- Old: dark-tinted column backgrounds
- New: `bg-surface-container-low/50 rounded-xl p-3 min-h-[200px]`
- Column header: `text-sm font-space font-semibold text-secondary uppercase tracking-wide mb-3`

**Order table** (table view):
- Old: `border-gray-200` etc.
- New: `border-outline-variant/30`
- Table header cells: `text-xs font-space font-semibold uppercase tracking-wide text-secondary`
- Table rows: `hover:bg-surface-container-low`

**Order detail modal**:
- Old: dark overlay + dark modal
- New: `fixed inset-0 bg-on-surface/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50`
- Modal body: `bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-outline-variant/20`
- Modal header: `sticky top-0 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/20 px-5 py-4`

**Status badge in modal**:
- `on_hold`: `bg-amber-100 text-amber-800`
- `in_process`: `bg-blue-100 text-blue-800`
- `done`: `bg-green-100 text-green-800`
- `delivered`: `bg-surface-container text-secondary`

**Status change buttons** (footer of modal):
- Old: dark-styled buttons
- New: Use `Button` component from `../components/ui` or inline `bg-primary text-on-primary rounded-full px-4 py-2`

**Refresh button**:
- Old: `text-gray-400 hover:text-white`
- New: `text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg p-2`

Remove the custom font imports at the top of OrdersPage (Plus Jakarta Sans, JetBrains Mono, Cormorant Garamond) — these are replaced by the global Inter/Space Grotesk in index.css. Keep order ref numbers styled with `font-mono`.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run -- OrdersPage
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/OrdersPage.test.jsx src/pages/OrdersPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle OrdersPage to Cerulean Sentinel"
```

---

## Task 8: ConversationsPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/ConversationsPage.test.jsx`
- Modify: `src/pages/ConversationsPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/ConversationsPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ConversationsPage from '../pages/ConversationsPage'

vi.mock('../api', () => ({
  conversations: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
    send: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('ConversationsPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the conversations panel heading', () => {
    render(<MemoryRouter><ConversationsPage /></MemoryRouter>)
    expect(screen.getByText(/conversaciones/i)).toBeInTheDocument()
  })

  it('shows empty state when no conversation is selected', () => {
    render(<MemoryRouter><ConversationsPage /></MemoryRouter>)
    expect(screen.getByText(/selecciona una conversación/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- ConversationsPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to ConversationsPage.jsx**

Open `src/pages/ConversationsPage.jsx`. Apply the class mapping. Key sections:

**Outer layout** (split pane):
- Old: `bg-white h-full flex`
- New: `bg-surface h-full flex`

**Left panel** (conversation list):
- Old: `border-r border-gray-200 bg-white`
- New: `border-r border-outline-variant/30 bg-surface`

**Panel header**:
- Old: `border-b border-gray-200 p-4`
- New: `border-b border-outline-variant/30 p-4`

**Search input**:
- Old: `border-gray-200 bg-gray-50 text-gray-900`
- New: `border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline rounded-full px-3 py-2`

**Conversation list item** (ConvItem):
- Unselected: `hover:bg-surface-container-low`
- Selected: `bg-secondary-container/30 border-l-2 border-primary`
- Phone number: `text-sm font-medium text-on-surface`
- Preview: `text-xs text-secondary truncate`
- Timestamp: `text-xs text-outline`

**Right panel** (chat area):
- Old: `bg-gray-50`
- New: `bg-background`

**Chat header** (sticky top):
- Old: `bg-white border-b border-gray-100`
- New: `bg-surface/90 backdrop-blur-sm border-b border-outline-variant/20 px-4 py-3`

**Message bubbles**:
- Customer messages: `bg-surface-container rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%]`
- Owner messages: `bg-primary text-on-primary rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%] ml-auto`
- Bot messages: `bg-secondary-container/30 text-on-surface rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%]`

**Sender label**:
- Old: `text-xs text-gray-400`
- New: `text-xs text-outline`

**Message input area**:
- Old: `border-t border-gray-200 bg-white`
- New: `border-t border-outline-variant/30 bg-surface px-3 py-3`
- Textarea: `border-outline-variant rounded-xl bg-surface-container-low resize-none focus:ring-primary`
- Send button: `bg-primary text-on-primary rounded-full p-2 hover:bg-primary-container`

**Empty state** (no conversation selected):
- Old: `text-gray-400`
- New: `flex flex-col items-center justify-center h-full text-outline gap-2`

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- ConversationsPage
```

Expected: All 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/ConversationsPage.test.jsx src/pages/ConversationsPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle ConversationsPage to Cerulean Sentinel"
```

---

## Task 9: RestaurantPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/RestaurantPage.test.jsx`
- Modify: `src/pages/RestaurantPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/RestaurantPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RestaurantPage from '../pages/RestaurantPage'

vi.mock('../api', () => ({
  restaurant: {
    get: vi.fn().mockResolvedValue({
      name: 'Test Resto',
      address: '123 Main',
      phone: '555-0000',
      email: 'test@test.com',
      website: '',
      delivery_available: false,
      delivery_fee: 0,
      delivery_min: 0,
    }),
    update: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('RestaurantPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><RestaurantPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/información del restaurante/i)).toBeInTheDocument()
    })
  })

  it('loads restaurant data into form fields', async () => {
    render(<MemoryRouter><RestaurantPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Resto')).toBeInTheDocument()
    })
  })

  it('calls restaurant.update on save', async () => {
    const { restaurant } = await import('../api')
    render(<MemoryRouter><RestaurantPage /></MemoryRouter>)
    await waitFor(() => screen.getByDisplayValue('Test Resto'))
    fireEvent.click(screen.getByText(/guardar cambios/i))
    await waitFor(() => {
      expect(restaurant.update).toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- RestaurantPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to RestaurantPage.jsx**

Open `src/pages/RestaurantPage.jsx`. The page uses `PageHeader`, `Card`, `Field`, `Input`, `Toggle`, `SaveBar`, `ErrorMsg` from `ui.jsx` — these are already updated in Task 3. The page-level classes to update:

Replace any remaining `gray-*` / `indigo-*` classes using the mapping table. The components from ui.jsx handle most of it. Check for any inline className strings in the page that bypass the shared components:

- Any `bg-gray-50` wrapping divs → `bg-background`
- Any `text-gray-*` not inside shared components → map per the table
- Any `border-gray-*` not inside shared components → `border-outline-variant`

Since RestaurantPage uses shared ui.jsx components for most elements, the changes should be minimal. Verify visually after the update.

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- RestaurantPage
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/RestaurantPage.test.jsx src/pages/RestaurantPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle RestaurantPage to Cerulean Sentinel"
```

---

## Task 10: BotPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/BotPage.test.jsx`
- Modify: `src/pages/BotPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/BotPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BotPage from '../pages/BotPage'

vi.mock('../api', () => ({
  bot: {
    get: vi.fn().mockResolvedValue({
      name: 'Gabot',
      language: 'es',
      tone: 'friendly',
      personality: 'Asistente amigable',
      greeting: 'Hola!',
      notifications_enabled: true,
    }),
    update: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('BotPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/configuración del bot/i)).toBeInTheDocument()
    })
  })

  it('loads bot name into input', async () => {
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Gabot')).toBeInTheDocument()
    })
  })

  it('calls bot.update on save', async () => {
    const { bot } = await import('../api')
    render(<MemoryRouter><BotPage /></MemoryRouter>)
    await waitFor(() => screen.getByDisplayValue('Gabot'))
    const saveBtn = screen.getByText(/guardar cambios/i)
    saveBtn.click()
    await waitFor(() => {
      expect(bot.update).toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- BotPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to BotPage.jsx**

Open `src/pages/BotPage.jsx`. Apply the class mapping table. BotPage uses shared ui.jsx components (`PageHeader`, `Card`, `Field`, `Input`, `Select`, `Textarea`, `Toggle`, `SaveBar`) — most styling is handled by the updated primitives in Task 3. Update any remaining inline `gray-*` / `indigo-*` class strings in the page wrapper and section headers.

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- BotPage
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/BotPage.test.jsx src/pages/BotPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle BotPage to Cerulean Sentinel"
```

---

## Task 11: HoursPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/HoursPage.test.jsx`
- Modify: `src/pages/HoursPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/HoursPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HoursPage from '../pages/HoursPage'

vi.mock('../api', () => ({
  hours: {
    get: vi.fn().mockResolvedValue([
      { day: 'monday', is_open: true, open_time: '09:00', close_time: '22:00' },
      { day: 'tuesday', is_open: false, open_time: '09:00', close_time: '22:00' },
    ]),
    updateDay: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('HoursPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><HoursPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/horarios/i)).toBeInTheDocument()
    })
  })

  it('renders a row for each day returned by the API', async () => {
    render(<MemoryRouter><HoursPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/lunes/i)).toBeInTheDocument()
      expect(screen.getByText(/martes/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- HoursPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to HoursPage.jsx**

Open `src/pages/HoursPage.jsx`. Apply the class mapping table. Key sections:

- Page wrapper: `bg-background`
- Day row container: `bg-surface border border-outline-variant/30 rounded-xl`
- Day name: `text-sm font-space font-medium text-on-surface`
- Time inputs (`type="time"`): `border-outline-variant rounded-lg bg-surface focus:ring-primary text-on-surface text-sm px-2 py-1.5 disabled:opacity-40`
- Save button per row: Use `Button` variant `secondary` or inline `bg-primary text-on-primary rounded-full px-3 py-1.5 text-xs`
- "Guardado" feedback: `text-xs text-primary font-medium`

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- HoursPage
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/HoursPage.test.jsx src/pages/HoursPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle HoursPage to Cerulean Sentinel"
```

---

## Task 12: MenuPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/MenuPage.test.jsx`
- Modify: `src/pages/MenuPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/MenuPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MenuPage from '../pages/MenuPage'

vi.mock('../api', () => ({
  menu: {
    getCategories: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Entradas',
        items: [{ id: 10, name: 'Empanadas', price: 5000, description: '', available: true }],
      },
    ]),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    importFile: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('MenuPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/menú/i)).toBeInTheDocument()
    })
  })

  it('renders category sections from API', async () => {
    render(<MemoryRouter><MenuPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Entradas')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- MenuPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to MenuPage.jsx**

Open `src/pages/MenuPage.jsx`. Apply the class mapping table. Key sections:

- Category section card: `bg-surface border border-outline-variant/30 rounded-xl overflow-hidden`
- Category header: `flex items-center justify-between px-4 py-3 bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors`
- Category name: `font-space text-sm font-semibold text-on-surface`
- Item count badge: `text-xs bg-surface-container text-secondary rounded-full px-2 py-0.5`
- Item row: `flex items-center justify-between px-4 py-2.5 border-t border-outline-variant/20 hover:bg-surface-container-low/50`
- Item form (inline edit): `bg-surface-container-low/30 border border-outline-variant/30 rounded-xl p-4 m-3`
- Unavailable badge: `text-xs bg-error-container text-on-error-container rounded-full px-2 py-0.5`
- Add category / add item buttons: `Button` variant `secondary` or `bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs hover:bg-primary/20`
- Delete buttons: `Button` variant `danger`

Also update `MenuImportModal.jsx` if it has inline `gray-*`/`indigo-*` classes — apply the same mapping.

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- MenuPage
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/MenuPage.test.jsx src/pages/MenuPage.jsx src/components/MenuImportModal.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle MenuPage to Cerulean Sentinel"
```

---

## Task 13: SpecialsPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/SpecialsPage.test.jsx`
- Modify: `src/pages/SpecialsPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/SpecialsPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SpecialsPage from '../pages/SpecialsPage'

vi.mock('../api', () => ({
  specials: {
    list: vi.fn().mockResolvedValue([
      { id: 1, day: 'monday', title: 'Especial Lunes', description: 'Desc', is_active: true },
    ]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('SpecialsPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><SpecialsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/especiales/i)).toBeInTheDocument()
    })
  })

  it('renders specials from API', async () => {
    render(<MemoryRouter><SpecialsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Especial Lunes')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- SpecialsPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to SpecialsPage.jsx**

Open `src/pages/SpecialsPage.jsx`. Apply the class mapping table. SpecialsPage uses `PageHeader`, `Card`, `Field`, `Input`, `Textarea`, `Select`, `Toggle`, `Button` from ui.jsx — all already updated. Check and update any remaining inline class strings following the mapping table.

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- SpecialsPage
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/SpecialsPage.test.jsx src/pages/SpecialsPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle SpecialsPage to Cerulean Sentinel"
```

---

## Task 14: PaymentPage — TDD + Restyle

**Files:**
- Create: `src/__tests__/PaymentPage.test.jsx`
- Modify: `src/pages/PaymentPage.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/PaymentPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PaymentPage from '../pages/PaymentPage'

vi.mock('../api', () => ({
  paymentMethods: {
    list: vi.fn().mockResolvedValue({
      cash: { enabled: true },
      card: { enabled: false },
      bank_accounts: [],
    }),
    update: vi.fn().mockResolvedValue({}),
    createBankAccount: vi.fn(),
    updateBankAccount: vi.fn(),
    deleteBankAccount: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ restaurant: { id: 1 } }),
}))

describe('PaymentPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/métodos de pago/i)).toBeInTheDocument()
    })
  })

  it('renders cash and card method toggles', async () => {
    render(<MemoryRouter><PaymentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/efectivo/i)).toBeInTheDocument()
      expect(screen.getByText(/tarjeta/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm baseline**

```bash
npm run test:run -- PaymentPage
```

- [ ] **Step 3: Apply Cerulean Sentinel styles to PaymentPage.jsx**

Open `src/pages/PaymentPage.jsx`. Apply the class mapping table. Key custom sections:

- Simple method card: `bg-surface border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between`
- Bank account card: same pattern as Card from ui.jsx
- QR upload area: `border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center gap-2 text-outline hover:border-primary hover:text-primary transition-colors cursor-pointer`
- QR image preview: `rounded-xl overflow-hidden border border-outline-variant/30`
- Save per-account button: `Button` variant `primary`
- Delete account button: `Button` variant `danger`
- "Guardado" success text: `text-xs text-primary font-medium`

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- PaymentPage
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/PaymentPage.test.jsx src/pages/PaymentPage.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "feat: restyle PaymentPage to Cerulean Sentinel"
```

---

## Task 15: ui.jsx Primitives Tests

**Files:**
- Create: `src/__tests__/ui.test.jsx`

- [ ] **Step 1: Write primitive tests**

Create `src/__tests__/ui.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageHeader, Card, Field, Input, Textarea, Select, Toggle, Button, SaveBar, Spinner, ErrorMsg } from '../components/ui'

describe('ui primitives', () => {
  it('PageHeader renders title and description', () => {
    render(<PageHeader title="Mi título" description="Una descripción" />)
    expect(screen.getByText('Mi título')).toBeInTheDocument()
    expect(screen.getByText('Una descripción')).toBeInTheDocument()
  })

  it('Card renders children', () => {
    render(<Card><span>contenido</span></Card>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('Toggle calls onChange with inverted value', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} label="Activo" />)
    fireEvent.click(screen.getByText('Activo').previousSibling)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('Button renders children and handles click', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Guardar</Button>)
    fireEvent.click(screen.getByText('Guardar'))
    expect(onClick).toHaveBeenCalled()
  })

  it('SaveBar shows guardado when saved is true', () => {
    render(<SaveBar saving={false} saved={true} onSave={vi.fn()} />)
    expect(screen.getByText('¡Guardado!')).toBeInTheDocument()
  })

  it('ErrorMsg renders the message', () => {
    render(<ErrorMsg message="Error de red" />)
    expect(screen.getByText('Error de red')).toBeInTheDocument()
  })

  it('Select renders all options', () => {
    const opts = [{ value: 'a', label: 'Opción A' }, { value: 'b', label: 'Opción B' }]
    render(<Select options={opts} />)
    expect(screen.getByText('Opción A')).toBeInTheDocument()
    expect(screen.getByText('Opción B')).toBeInTheDocument()
  })

  it('Spinner renders', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- ui.test
```

Expected: All 8 tests PASS.

- [ ] **Step 3: Commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add src/__tests__/ui.test.jsx
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "test: add ui.jsx primitive tests"
```

---

## Task 16: Full Test Run + Visual Verification

**Files:** None

- [ ] **Step 1: Run full test suite**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run
```

Expected: All tests PASS. 0 failures.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors. Bundle output in `dist/`.

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 4: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in browser. Walk through all pages:

| Page | URL | Visual check |
|---|---|---|
| Login | `/login` | White card, blue button, no indigo |
| Orders | `/orders` (after login) | Blue header text, light kanban columns |
| Conversations | `/conversations` | Light sidebar, blue active nav |
| Restaurant | `/` | White cards, blue save button |
| Bot | `/bot` | White cards, blue toggle |
| Hours | `/hours` | Day rows, blue active toggles |
| Menu | `/menu` | Collapsible categories, blue add button |
| Specials | `/specials` | Specials list, blue save |
| Payment | `/payment` | Cash/card toggles, blue |

For each page: sidebar shows blue active item, background is near-white (#f8f9ff), no purple/indigo remaining.

Also verify: drag-and-drop still works in Orders, conversation send still works, form saves still work.

- [ ] **Step 5: Final commit**

```bash
git -C /home/ceul/Documentos/gabot/gabot-customer-ui add -A
git -C /home/ceul/Documentos/gabot/gabot-customer-ui commit -m "chore: UI refactor to Cerulean Sentinel complete"
```
