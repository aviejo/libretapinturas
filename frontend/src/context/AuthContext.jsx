import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginService, logout as logoutService, getCurrentUser, getToken } from '@/services/authService'

const AuthContext = createContext(null)

/**
 * AuthProvider component
 * Provides authentication state and methods to the application
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = getToken()
    const currentUser = getCurrentUser()
    
    if (token && currentUser) {
      setUser(currentUser)
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }, [])

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true)
    
    try {
      const response = await loginService(credentials)
      
      if (response.success && response.data.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
      
      return response
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    logoutService()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth hook
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext
