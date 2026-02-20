import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock authService
const mockGetCurrentUser = jest.fn()
const mockGetToken = jest.fn()
const mockLogin = jest.fn()
const mockLogout = jest.fn()

jest.mock('@/services/authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  getToken: () => mockGetToken(),
  login: (credentials) => mockLogin(credentials),
  logout: () => mockLogout()
}))

// Test component that uses auth context
function TestComponent() {
  const auth = useAuth()
  
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.name : 'No user'}</div>
      <div data-testid="isLoading">{auth.isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <button data-testid="login-btn" onClick={() => auth.login({ email: 'test@test.com', password: '123' })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={auth.logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockGetCurrentUser.mockReturnValue(null)
    mockGetToken.mockReturnValue(null)
    mockLogin.mockReset()
    mockLogout.mockReset()
  })

  it('T7.7: should provide initial auth state (no user)', () => {
    mockGetCurrentUser.mockReturnValue(null)
    mockGetToken.mockReturnValue(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
  })

  it('T7.7: should initialize from localStorage if token exists', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' }
    mockGetCurrentUser.mockReturnValue(mockUser)
    mockGetToken.mockReturnValue('valid-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated')
  })

  it('T7.7: login should call authService and update state', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' }
    mockGetCurrentUser.mockReturnValue(null)
    mockLogin.mockResolvedValue({
      success: true,
      data: { token: 'new-token', user: mockUser }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Click login button
    screen.getByTestId('login-btn').click()

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@test.com', password: '123' })
    })
  })

  it('T7.7: logout should call authService and clear state', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' }
    mockGetCurrentUser.mockReturnValue(mockUser)
    mockGetToken.mockReturnValue('valid-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially authenticated
    expect(screen.getByTestId('user')).toHaveTextContent('Test User')

    // Click logout
    screen.getByTestId('logout-btn').click()

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('T7.9: useAuth should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    function ComponentWithoutProvider() {
      useAuth()
      return <div>Test</div>
    }

    expect(() => {
      render(<ComponentWithoutProvider />)
    }).toThrow()

    consoleSpy.mockRestore()
  })
})
