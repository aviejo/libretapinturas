import api from '@/lib/api'

const API_URL = '/mixes'

/**
 * Generate paint mix using AI
 * @param {Object} params - Mix generation parameters
 * @param {string} params.targetBrand - Target paint brand
 * @param {string} params.targetName - Target paint name
 * @param {string} params.targetColor - Target hex color
 * @param {string[]} params.availablePaintIds - IDs of user's available paints
 * @param {string} [params.description] - Optional description of desired color
 * @returns {Promise<Object>} Generated mix recipe
 */
export async function generateMix(params) {
  const response = await api.post(`${API_URL}/generate`, params)
  return response.data
}

/**
 * Save generated mix as a paint with recipe
 * @param {Object} mixData - Mix data with recipe
 * @returns {Promise<Object>} Saved paint
 */
export async function saveMix(mixData) {
  const response = await api.post(`${API_URL}/save`, mixData)
  return response.data
}
