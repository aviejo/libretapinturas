import { Link } from 'react-router-dom'
import ExportButton from '@/components/import-export/ExportButton'
import ImportForm from '@/components/import-export/ImportForm'
import Button from '@/components/ui/Button'

/**
 * ImportExportPage
 * Page for importing and exporting paint collections
 */
function ImportExportPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Importar / Exportar
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu colección de pinturas
          </p>
        </div>
        <Link to="/paints">
          <Button variant="outline">← Volver</Button>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Export Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Descarga una copia de seguridad de todas tus pinturas (comerciales y mezclas) 
            en formato JSON. Incluye recetas, notas y metadatos.
          </p>
          <ExportButton />
        </div>

        {/* Import Info */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar
          </h3>
          <p className="text-sm text-green-800 mb-4">
            Importa pinturas desde un archivo JSON. Las pinturas duplicadas se omiten 
            automáticamente. Puedes importar desde un backup o de otro usuario.
          </p>
        </div>
      </div>

      {/* Import Form */}
      <ImportForm />

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-3">📋 Instrucciones:</h4>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li><strong>Exportar:</strong> Genera un archivo JSON con todas tus pinturas y mezclas</li>
          <li><strong>Importar:</strong> Selecciona un archivo JSON válido para añadir pinturas</li>
          <li>Las pinturas se identifican por marca + referencia para evitar duplicados</li>
          <li>Las mezclas importadas mantienen sus recetas y proporciones</li>
          <li>El formato es compatible entre diferentes usuarios</li>
        </ul>
      </div>
    </div>
  )
}

export default ImportExportPage
