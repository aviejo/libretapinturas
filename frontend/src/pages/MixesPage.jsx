import { Link } from 'react-router-dom'
import { usePaints, useDeletePaint } from '@/hooks/usePaints'
import MixCard from '@/components/mixes/MixCard'
import Button from '@/components/ui/Button'

/**
 * MixesPage
 * Displays list of user's paint mixes
 */
function MixesPage() {
  const { paints, isLoading, isError } = usePaints({ type: 'mix' })
  const { mutate: deletePaint } = useDeletePaint()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Mis Mezclas {paints.length > 0 && `(${paints.length})`}
          </h2>
          <p className="text-gray-600 mt-1">
            Pinturas creadas mezclando otras
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/mixes/new">
            <Button variant="outline">
              + Crear manual
            </Button>
          </Link>
          <Link to="/mixes/generate">
            <Button variant="primary">
              ✨ Generar con IA
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-gray-600">Cargando mezclas...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error al cargar mezclas</p>
        </div>
      ) : paints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            No tienes mezclas aún
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera mezcla manualmente o con la ayuda de la IA
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/mixes/new">
              <Button variant="outline">
                Crear manualmente
              </Button>
            </Link>
            <Link to="/mixes/generate">
              <Button variant="primary">
                Generar con IA
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paints.map((paint) => (
            <MixCard 
              key={paint.id} 
              paint={paint}
              onDelete={deletePaint}
            />
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 className="font-semibold text-amber-900 mb-2">🎨 Sobre las Mezclas:</h4>
        <p className="text-sm text-amber-800 mb-2">
          Las mezclas son pinturas creadas combinando otras pinturas de tu libreta.
        </p>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li><strong>Generar con IA:</strong> Describe un color objetivo y la IA creará una receta usando tus pinturas</li>
          <li><strong>Crear manual:</strong> Define tú mismo los componentes y proporciones</li>
          <li><strong>Ver receta:</strong> Haz clic en "Ver receta" para ver los componentes y cantidades exactas</li>
          <li><strong>Editar:</strong> Modifica las proporciones o componentes de cualquier mezcla</li>
        </ul>
      </div>
    </div>
  )
}

export default MixesPage
