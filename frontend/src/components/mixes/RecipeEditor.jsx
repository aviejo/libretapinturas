import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/**
 * RecipeEditor component
 * Allows editing drops, notes, and removing components from a mix recipe
 * @param {Object} props
 * @param {Object} props.recipe - Recipe to edit
 * @param {Function} props.onSave - Callback with edited recipe
 * @param {Function} props.onCancel - Callback to cancel editing
 */
function RecipeEditor({ recipe, onSave, onCancel }) {
  const { targetColor, targetBrand, targetName, recipe: recipeData } = recipe
  const [components, setComponents] = useState(recipeData.components)
  const [notes, setNotes] = useState(recipeData.notes || '')
  const [error, setError] = useState('')

  // Update drops for a component
  const handleDropsChange = (paintId, newDrops) => {
    const drops = parseInt(newDrops) || 0
    setComponents(prev => 
      prev.map(c => c.paintId === paintId ? { ...c, drops } : c)
    )
    setError('')
  }

  // Remove a component
  const handleRemove = (paintId) => {
    setComponents(prev => prev.filter(c => c.paintId !== paintId))
    setError('')
  }

  // Calculate percentages based on drops
  const calculatePercentages = (comps) => {
    const total = comps.reduce((sum, c) => sum + c.drops, 0)
    if (total === 0) return comps
    
    return comps.map(c => ({
      ...c,
      percentage: Math.round((c.drops / total) * 100)
    }))
  }

  // Handle save
  const handleSave = () => {
    // Validate minimum 2 components
    const validComponents = components.filter(c => c.drops > 0)
    if (validComponents.length < 2) {
      setError('La receta debe tener al menos 2 componentes')
      return
    }

    // Calculate new percentages
    const updatedComponents = calculatePercentages(validComponents)
    const totalDrops = updatedComponents.reduce((sum, c) => sum + c.drops, 0)

    // Build cleaned recipe - only components and totalDrops
    // Notes are passed separately to parent, not stored in recipe
    const editedRecipe = {
      ...recipe,
      recipe: {
        components: updatedComponents,
        totalDrops
      }
    }

    onSave(editedRecipe, notes.trim())
  }

  // Calculate current total
  const currentTotal = components.reduce((sum, c) => sum + c.drops, 0)

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Receta</h3>
      
      {/* Target Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">{targetBrand} {targetName}</p>
        </div>
        
        {targetColor && targetColor.trim() !== '' ? (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Color objetivo</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{targetColor}</p>
            </div>
            <div 
              className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-inner flex-shrink-0"
              style={{ backgroundColor: targetColor }}
            />
          </div>
        ) : null}
      </div>

      {/* Components Editor */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-gray-800">Ajustar Gotas:</h4>
        
        {components.map((component) => (
          <div 
            key={component.paintId}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
          >
            {/* Paint info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {component.paintName}
              </p>
              <p className="text-sm text-gray-500">
                {component.brand}
              </p>
            </div>
            
            {/* Drops input */}
            <div className="w-24">
              <Input
                type="number"
                id={`drops-${component.paintId}`}
                label={`Gotas de ${component.paintName}`}
                min="0"
                max="20"
                value={component.drops}
                onChange={(e) => handleDropsChange(component.paintId, e.target.value)}
                className="text-center"
              />
            </div>
            
            {/* Percentage */}
            <div className="w-16 text-right">
              <span className="text-sm font-medium text-gray-600">
                {currentTotal > 0 ? Math.round((component.drops / currentTotal) * 100) : 0}%
              </span>
            </div>
            
            {/* Remove button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRemove(component.paintId)}
              className="text-red-600 border-red-300 hover:bg-red-50"
              aria-label={`Eliminar ${component.paintName}`}
            >
              🗑️
            </Button>
          </div>
        ))}
      </div>

      {/* Current Total */}
      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-4">
        <span className="font-medium text-gray-700">Total actual:</span>
        <span className="font-bold text-gray-900">{currentTotal} gotas</span>
      </div>

      {/* Notes Editor */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Notas de la receta
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Añade notas sobre la mezcla, aplicación, consejos..."
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 focus:outline-none transition-all duration-200 min-h-[100px] resize-y"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          className="flex-1"
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}

export default RecipeEditor
