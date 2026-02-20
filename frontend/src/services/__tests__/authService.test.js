import axios from '@/lib/api'
import { login, register, logout, getCurrentUser, getToken, isAuthenticated } from '@/services/authService'

// Mock axios instance
jest.mock('@/lib/api', () => ({
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}))

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('T7.1: should call API with correct credentials and store token', async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'mock-jwt-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              name: 'Test User'
            }
          }
        }
      }
      axios.post.mockResolvedValue(mockResponse)

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      const result = await login(credentials)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse.data)
      expect(localStorage.getItem('token')).toBe('mock-jwt-token')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.data.user))
    })

    it('T7.5: should handle API errors correctly', async () => {
      // Arrange
      const errorResponse = {
        response: {
          data: {
            success: false,
            error: 'Credenciales inválidas'
          }
        }
      }
      axios.post.mockRejectedValue(errorResponse)

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }

      // Act & Assert
      await expect(login(credentials)).rejects.toEqual(errorResponse)
      expect(axios.post).toHaveBeenCalledWith('/auth/login', credentials)
    })
  })

  describe('register', () => {
    it('T7.3: should call API with user data and store token', async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'new-user-token',
            user: {
              id: 'user-456',
              email: 'new@example.com',
              name: 'New User'
            }
          }
        }
      }
      axios.post.mockResolvedValue(mockResponse)

      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      }

      // Act
      const result = await register(userData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/auth/register', userData)
      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse.data)
      expect(localStorage.getItem('token')).toBe('new-user-token')
    })

    it('T7.5: should handle registration errors', async () => {
      // Arrange
      const errorResponse = {
        response: {
          data: {
            success: false,
            error: 'Email ya registrado'
          }
        }
      }
      axios.post.mockRejectedValue(errorResponse)

      const userData = {
        name: 'Test',
        email: 'existing@example.com',
        password: 'password123'
      }

      // Act & Assert
      await expect(register(userData)).rejects.toEqual(errorResponse)
    })
  })

  describe('logout', () => {
    it('T7.6: should clear token and user from localStorage', () => {
      // Arrange
      localStorage.setItem('token', 'some-token')
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }))

      // Act
      logout()

      // Assert
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('helper functions', () => {
    it('T7.6: getCurrentUser should return parsed user from localStorage', () => {
      // Arrange
      const user = { id: '123', name: 'Test User' }
      localStorage.setItem('user', JSON.stringify(user))

      // Act
      const result = getCurrentUser()

      // Assert
      expect(result).toEqual(user)
    })

    it('T7.6: getToken should return token from localStorage', () => {
      // Arrange
      localStorage.setItem('token', 'my-token')

      // Act
      const result = getToken()

      // Assert
      expect(result).toBe('my-token')
    })

    it('T7.6: isAuthenticated should return true when token exists', () => {
      // Arrange
      localStorage.setItem('token', 'valid-token')

      // Act
      const result = isAuthenticated()

      // Assert
      expect(result).toBe(true)
    })

    it('T7.6: isAuthenticated should return false when no token', () => {
      // Arrange
      localStorage.removeItem('token')

      // Act
      const result = isAuthenticated()

      // Assert
      expect(result).toBe(false)
    })
  })
})
