import api from '@/lib/api'

const EXPORT_URL = '/export'
const IMPORT_URL = '/import'

/**
 * Export user's paint collection as JSON
 * @returns {Promise<Object>} Export data with paints and metadata
 */
export async function exportCollection() {
  const response = await api.get(EXPORT_URL)
  return response.data
}

/**
 * Import paint collection from JSON
 * @param {Object} collectionData - Paint collection data to import
 * @returns {Promise<Object>} Import result with statistics
 */
export async function importCollection(collectionData) {
  const response = await api.post(IMPORT_URL, collectionData)
  return response.data
}

/**
 * Download export data as a JSON file
 * @param {Object} exportData - Data to download
 * @param {string} [filename] - Optional custom filename
 */
export function downloadExportFile(exportData, filename = null) {
  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilename = `libreta-pinturas-${timestamp}.json`
  const finalFilename = filename || defaultFilename
  
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  window.URL.revokeObjectURL(url)
}

/**
 * Validate import file structure
 * @param {Object} data - Parsed JSON data
 * @returns {Object} Validation result with isValid and errors
 */
export function validateImportData(data) {
  const errors = []
  
  // Check schema_version
  if (!data.schema_version) {
    errors.push('Falta schema_version en el archivo')
  } else if (data.schema_version !== '1.0') {
    errors.push(`Schema version ${data.schema_version} no soportado (solo 1.0)`)
  }
  
  // Check paints array
  if (!data.paints || !Array.isArray(data.paints)) {
    errors.push('Falta array de pinturas o formato inválido')
  } else if (data.paints.length === 0) {
    errors.push('El archivo no contiene pinturas')
  } else {
    // Validate each paint
    data.paints.forEach((paint, index) => {
      if (!paint.name) {
        errors.push(`Pintura ${index + 1}: falta nombre`)
      }
      if (!paint.brand) {
        errors.push(`Pintura ${index + 1}: falta marca`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    paintCount: data.paints?.length || 0
  }
}

/**
 * Read file content as JSON
 * @param {File} file - File to read
 * @returns {Promise<Object>} Parsed JSON content
 */
export function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target.result
        const data = JSON.parse(content)
        resolve(data)
      } catch (error) {
        reject(new Error('El archivo no es un JSON válido'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsText(file)
  })
}
