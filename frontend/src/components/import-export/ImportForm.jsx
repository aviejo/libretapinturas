import { useState, useCallback } from 'react'
import { readImportFile, validateImportData, importCollection } from '@/services/importExportService'
import { useImport } from '@/hooks/useImportExport'
import Button from '@/components/ui/Button'

/**
 * ImportForm component
 * Handles file upload, validation, preview and import
 */
function ImportForm() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [validation, setValidation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { mutate: doImport, isPending: isImporting } = useImport()

  const handleFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsLoading(true)
    setError(null)
    setPreview(null)
    setValidation(null)

    try {
      // Read file content
      const data = await readImportFile(selectedFile)
      
      // Validate structure
      const validationResult = validateImportData(data)
      setValidation(validationResult)
      
      if (validationResult.isValid) {
        setPreview(data)
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleImport = useCallback(() => {
    if (!preview) return
    
    doImport(preview)
    
    // Reset form after import
    setFile(null)
    setPreview(null)
    setValidation(null)
    setError(null)
  }, [preview, doImport])

  const handleReset = useCallback(() => {
    setFile(null)
    setPreview(null)
    setValidation(null)
    setError(null)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Importar Pinturas</h3>
      
      <p className="text-gray-600 mb-6">
        Selecciona un archivo JSON de exportación para importar pinturas a tu libreta.
        Las pinturas duplicadas se omitirán automáticamente.
      </p>

      {/* File Upload */}
      {!preview && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivo JSON
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-amber-50 file:text-amber-700
              hover:file:bg-amber-100
              disabled:opacity-50"
          />
          {isLoading && (
            <p className="mt-2 text-sm text-gray-500">Procesando archivo...</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error:</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Validation Errors */}
      {validation && !validation.isValid && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium mb-2">Errores de validación:</p>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {validation.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview && validation?.isValid && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Vista Previa:</h4>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Total de pinturas</p>
              <p className="text-2xl font-bold text-blue-900">{preview.paints?.length || 0}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Exportado el</p>
              <p className="text-sm font-medium text-gray-900">
                {preview.exported_at ? new Date(preview.exported_at).toLocaleDateString() : 'Desconocido'}
              </p>
            </div>
          </div>

          {/* Paint List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Marca</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Nombre</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.paints?.slice(0, 20).map((paint, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{paint.brand}</td>
                    <td className="px-3 py-2">{paint.name}</td>
                    <td className="px-3 py-2 text-gray-500">{paint.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.paints?.length > 20 && (
              <p className="px-3 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                ... y {preview.paints.length - 20} más
              </p>
            )}
          </div>

          {/* Duplicate warning */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Nota:</span> Las pinturas que ya existan en tu libreta 
              (misma marca + referencia) serán omitidas automáticamente.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {preview ? (
          <>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              variant="primary"
              className="flex-1"
              disabled={isImporting}
            >
              {isImporting ? 'Importando...' : `Importar ${preview.paints?.length || 0} pinturas`}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => document.querySelector('input[type="file"]').click()}
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            Seleccionar Archivo
          </Button>
        )}
      </div>
    </div>
  )
}

export default ImportForm
