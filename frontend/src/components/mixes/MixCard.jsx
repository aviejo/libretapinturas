import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePaints } from '@/hooks/usePaints'
import Button from '@/components/ui/Button'

/**
 * MixCard component
 * Displays a paint mix with its recipe components
 * @param {Object} props
 * @param {Object} props.paint - Paint data with recipeJson
 * @param {Function} props.onDelete - Callback to delete the mix
 */
function MixCard({ paint, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { paints } = usePaints() // Get all paints for enriching components

  // Use recipe from API (already parsed by backend) or recipeJson for backward compatibility
  let recipe = paint.recipe || null
  
  // Fallback: try to parse recipeJson if recipe is not available
  if (!recipe && paint.recipeJson) {
    try {
      const parsed = JSON.parse(paint.recipeJson)
      
      // Handle OLD FORMAT (array direct): convert to new format
      if (Array.isArray(parsed)) {
        recipe = {
          components: parsed.map(c => ({
            paintId: c.paintId,
            paintName: c.name || c.paintName,
            brand: c.brand,
            drops: c.drops,
            color: c.color,
            percentage: c.percentage || 0
          })),
          totalDrops: parsed.reduce((sum, c) => sum + (c.drops || 0), 0)
        }
      } 
      // Handle NEW FORMAT (object with components)
      else if (parsed.components) {
        recipe = {
          components: parsed.components,
          totalDrops: parsed.totalDrops || parsed.components.reduce((sum, c) => sum + (c.drops || 0), 0)
        }
      }
      // Unknown format
      else {
        console.error('Unknown recipe format:', parsed)
        recipe = null
      }
    } catch (e) {
      console.error('Error parsing recipe:', e)
    }
  }

  // Enrich components with paint data if missing paintName
  const enrichedRecipe = recipe ? {
    ...recipe,
    components: recipe.components?.map(component => {
      if (component.paintName && component.brand) {
        return component
      }
      // Find paint data by ID
      const paintData = paints.find(p => p.id === component.paintId)
      if (paintData) {
        return {
          ...component,
          paintName: component.paintName || paintData.name,
          brand: component.brand || paintData.brand,
          color: component.color || paintData.color
        }
      }
      return component
    })
  } : null

  // Use enriched recipe or original
  const finalRecipe = enrichedRecipe || recipe
  const totalDrops = finalRecipe?.components?.reduce((sum, c) => sum + (c.drops || 0), 0) || 0

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Color swatch */}
          <div 
            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-inner flex-shrink-0"
            style={{ backgroundColor: paint.color }}
          />
          
          {/* Paint info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 truncate">
                  {paint.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {paint.brand}
                  {paint.reference && (
                    <span className="text-gray-500 ml-1">({paint.reference})</span>
                  )}
                </p>
              </div>
              
              {/* Mix badge */}
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                MEZCLA
              </span>
            </div>
            
            {/* Hex color */}
            <p className="text-xs text-gray-500 font-mono mt-1">
              {paint.color}
            </p>
          </div>
        </div>
      </div>

      {/* Recipe Preview (if available) */}
      {finalRecipe?.components && finalRecipe.components.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">
              {finalRecipe.components.length} componentes
            </span>
            <span className="text-gray-400">•</span>
            <span>{totalDrops} gotas totales</span>
          </div>
        </div>
      )}

      {/* Expandable Recipe Details */}
      {expanded && finalRecipe?.components && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">
            Receta:
          </h4>
          
          <div className="space-y-2">
            {finalRecipe.components.map((component, index) => (
              <div 
                key={component.paintId || index}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
              >
                {/* Component number */}
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                
                {/* Paint info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {component.paintName || 'Pintura'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {component.brand || 'Sin marca'}
                  </p>
                </div>
                
                {/* Drops and percentage */}
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    {component.drops || 0} gotas
                  </p>
                  <p className="text-xs text-gray-500">
                    {component.percentage || 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recipe Notes */}
          {paint.notes && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Notas:</span> {paint.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="flex-1"
        >
          {expanded ? 'Ocultar receta' : 'Ver receta'}
        </Button>
        
        <Link to={`/mixes/${paint.id}/edit`} className="flex-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
          >
            Editar
          </Button>
        </Link>
        
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(paint.id)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            🗑️
          </Button>
        )}
      </div>
    </div>
  )
}

export default MixCard
