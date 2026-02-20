import Button from '@/components/ui/Button'

/**
 * RecipePreview component
 * Displays generated mix recipe with components and confidence
 * @param {Object} props
 * @param {Object} props.recipe - Generated recipe data
 * @param {Function} props.onEdit - Callback to edit recipe
 * @param {Function} props.onSave - Callback to save recipe
 */
function RecipePreview({ recipe, onEdit, onSave }) {
  const { targetBrand, targetName, targetReference, targetColor, recipe: recipeData } = recipe
  const { components, notes, confidence, totalDrops } = recipeData

  // Format confidence as percentage
  const confidencePercent = Math.round(confidence * 100)

  // Determine confidence color
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-100'
    if (conf >= 0.6) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Receta Generada</h3>
          <p className="text-gray-600 mt-1">Mezcla sugerida por IA</p>
        </div>
        
        {/* Confidence Badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(confidence)}`}>
          {confidencePercent}% confianza
        </div>
      </div>

      {/* Target Paint Info - What user requested */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3">🎯 Pintura Solicitada:</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800 w-24">Marca:</span>
            <span className="text-sm text-blue-900">{targetBrand}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800 w-24">Nombre:</span>
            <span className="text-sm text-blue-900">{targetName}</span>
          </div>
          {targetReference && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800 w-24">Referencia:</span>
              <span className="text-sm text-blue-900 font-mono">{targetReference}</span>
            </div>
          )}
          {targetColor && targetColor.trim() !== '' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800 w-24">Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: targetColor }}
                />
                <span className="text-sm text-blue-900 font-mono">{targetColor}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-gray-800">Componentes:</h4>
        
        {components.map((component, index) => (
          <div 
            key={component.paintId}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
          >
            {/* Component number */}
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            
            {/* Paint info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {component.paintName}
              </p>
              <p className="text-sm text-gray-500">
                {component.brand}
              </p>
            </div>
            
            {/* Drops */}
            <div className="text-right">
              <p className="font-bold text-gray-900">
                {component.drops} gotas
              </p>
              <p className="text-xs text-gray-500">
                {component.percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Notas:</span> {notes}
          </p>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-6">
        <span className="font-medium text-gray-700">Total: {totalDrops} gotas</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            ✏️ Editar
          </Button>
        )}
        {onSave && (
          <Button
            type="button"
            variant="primary"
            onClick={onSave}
            className="flex-1"
          >
            💾 Guardar Mezcla
          </Button>
        )}
      </div>
    </div>
  )
}

export default RecipePreview
