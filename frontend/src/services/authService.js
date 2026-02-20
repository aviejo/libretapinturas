import axios from '@/lib/api'

const API_URL = '/auth'

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with token and user data
 */
export async function login(credentials) {
  const response = await axios.post(`${API_URL}/login`, credentials)
  
  // Store token and user data in localStorage
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))
    
    // Update axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
  }
  
  return response.data
}

/**
 * Register new user
 * @param {Object} userData - Registration data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Registration response
 */
export async function register(userData) {
  const response = await axios.post(`${API_URL}/register`, userData)
  
  // Store token and user data if registration includes auto-login
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))
    
    // Update axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
  }
  
  return response.data
}

/**
 * Logout user
 * Clears localStorage and axios headers
 */
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete axios.defaults.headers.common['Authorization']
}

/**
 * Get current user from localStorage
 * @returns {Object|null} User data or null if not logged in
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Get auth token from localStorage
 * @returns {string|null} Auth token or null
 */
export function getToken() {
  return localStorage.getItem('token')
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export function isAuthenticated() {
  return !!getToken()
}
