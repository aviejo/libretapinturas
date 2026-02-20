import { useSearchParams } from 'react-router-dom'
import { usePaints } from '@/hooks/usePaints'
import PaintCard from '@/components/paints/PaintCard'
import PaintFilters from '@/components/paints/PaintFilters'
import Button from '@/components/ui/Button'
import { Link } from 'react-router-dom'

/**
 * PaintsPage
 * Displays list of user's paints with filters
 */
function PaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Build filters from URL params
  const filters = {
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
  }
  
  const { paints, isLoading, isError, error } = usePaints(filters)
  
  // Check if user has active filters
  const hasActiveFilters = filters.search || filters.type

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  return (
    <div>
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Mis Pinturas {paints.length > 0 && `(${paints.length})`}
        </h2>
        <Link to="/paints/new">
          <Button variant="primary">
            + Nueva pintura
          </Button>
        </Link>
      </div>

      {/* Filters - Always visible */}
      <PaintFilters />

      {/* Content area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-gray-600">Cargando pinturas...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error al cargar pinturas</p>
          <p className="text-gray-500 mt-2">{error?.message}</p>
        </div>
      ) : paints.length === 0 && hasActiveFilters ? (
        // Empty state: Filtering returned no results
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-600">
            No se encontraron pinturas con los filtros aplicados
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Usa el botón "Limpiar filtros" en la barra superior
          </p>
        </div>
      ) : paints.length === 0 ? (
        // Empty state: User has no paints at all
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Tu libreta está vacía
          </h3>
          <p className="text-gray-600 mb-6">
            No tienes pinturas guardadas. Agrega tu primera pintura para comenzar.
          </p>
          <Link to="/paints/new">
            <Button variant="primary">
              Agregar primera pintura
            </Button>
          </Link>
        </div>
      ) : (
        // Normal state: Show paint list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paints.map((paint) => (
            <PaintCard 
              key={paint.id} 
              paint={paint}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PaintsPage
