import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../api', () => ({
  auth: { me: vi.fn() },
}))

vi.mock('../pages/LoginPage', () => ({ default: () => <div>LoginPageStub</div> }))
vi.mock('../pages/RestaurantPage', () => ({ default: () => <div>RestaurantPageStub</div> }))

import App from '../App'

function renderAppAt(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('App routing guards', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('redirects an authenticated user away from /login to /', async () => {
    localStorage.setItem('token', 'tok')
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'a@test.com' }))
    localStorage.setItem('restaurant', JSON.stringify(null))
    renderAppAt('/login')
    expect(await screen.findByText('RestaurantPageStub')).toBeInTheDocument()
  })

  it('redirects an unauthenticated user hitting a protected route to /login', async () => {
    renderAppAt('/dashboard')
    expect(await screen.findByText('LoginPageStub')).toBeInTheDocument()
  })
})
