import api from '@/lib/api'

const API_URL = '/paints'

/**
 * Get all paints for current user
 * @returns {Promise<Object>} List of paints
 */
export async function getPaints(filters = {}) {
  const response = await api.get(API_URL, { params: filters })
  return response.data
}

/**
 * Get paint by ID
 * @param {string} id - Paint ID
 * @returns {Promise<Object>} Paint details
 */
export async function getPaintById(id) {
  const response = await api.get(`${API_URL}/${id}`)
  return response.data
}

/**
 * Create new paint
 * @param {Object} paintData - Paint data
 * @returns {Promise<Object>} Created paint
 */
export async function createPaint(paintData) {
  const response = await api.post(API_URL, paintData)
  return response.data
}

/**
 * Update paint
 * @param {string} id - Paint ID
 * @param {Object} paintData - Updated paint data
 * @returns {Promise<Object>} Updated paint
 */
export async function updatePaint(id, paintData) {
  const response = await api.put(`${API_URL}/${id}`, paintData)
  return response.data
}

/**
 * Delete paint
 * @param {string} id - Paint ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deletePaint(id) {
  const response = await api.delete(`${API_URL}/${id}`)
  return response.data
}
