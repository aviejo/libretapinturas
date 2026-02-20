import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePaints, useCreatePaint } from '@/hooks/usePaints'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'

/**
 * CreateManualMixPage
 * Allows creating a paint mix manually by selecting components and quantities
 */
function CreateManualMixPage() {
  const navigate = useNavigate()
  const { paints } = usePaints()
  const { mutateAsync: createPaint, isPending } = useCreatePaint()
  
  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    reference: '',
    color: '',
    notes: '',
  })
  
  // Selected components
  const [components, setComponents] = useState([])
  
  // Available paints (excluding mixes)
  const availablePaints = paints.filter(p => !p.isMix)
  
  // Add component
  const addComponent = (paint) => {
    if (components.find(c => c.paintId === paint.id)) {
      toast.error('Esta pintura ya está en la mezcla')
      return
    }
    
    setComponents([...components, {
      paintId: paint.id,
      paintName: paint.name,
      brand: paint.brand,
      color: paint.color,
      drops: 1,
      percentage: 0
    }])
  }
  
  // Remove component
  const removeComponent = (paintId) => {
    setComponents(components.filter(c => c.paintId !== paintId))
  }
  
  // Update drops
  const updateDrops = (paintId, drops) => {
    const numDrops = parseInt(drops) || 0
    setComponents(components.map(c => 
      c.paintId === paintId ? { ...c, drops: numDrops } : c
    ))
  }
  
  // Calculate percentages
  const calculatePercentages = () => {
    const total = components.reduce((sum, c) => sum + c.drops, 0)
    if (total === 0) return components
    
    return components.map(c => ({
      ...c,
      percentage: Math.round((c.drops / total) * 100)
    }))
  }
  
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.brand || !formData.name) {
      toast.error('La marca y el nombre son obligatorios')
      return
    }
    
    if (components.length < 2) {
      toast.error('Necesitas al menos 2 componentes')
      return
    }
    
    const validComponents = components.filter(c => c.drops > 0)
    if (validComponents.length < 2) {
      toast.error('Al menos 2 componentes deben tener gotas')
      return
    }
    
    // Calculate final percentages
    const finalComponents = calculatePercentages()
    const totalDrops = finalComponents.reduce((sum, c) => sum + c.drops, 0)
    
    // Create recipe - ONLY components and totalDrops in recipe_json
    const recipe = {
      components: finalComponents,
      totalDrops
    }
    
    try {
      await createPaint({
        brand: formData.brand,
        name: formData.name,
        reference: formData.reference || null,
        color: formData.color || null,
        isMix: true,
        recipe: recipe,
        inStock: true,
        notes: formData.notes || ''
      })
      
      toast.success('Mezcla creada exitosamente')
      navigate('/mixes')
    } catch (error) {
      toast.error('Error al crear la mezcla')
    }
  }
  
  const currentTotal = components.reduce((sum, c) => sum + c.drops, 0)
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Crear Mezcla Manual
          </h1>
          <p className="text-gray-600 mt-1">
            Define los componentes y proporciones tú mismo
          </p>
        </div>
        <Link to="/mixes">
          <Button variant="outline">← Volver</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mix Info */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Información de la Mezcla</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Marca *"
              placeholder="Ej: Mi Marca"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              required
            />
            
            <Input
              label="Nombre *"
              placeholder="Ej: Gris Personalizado"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="mt-4">
            <Input
              label="Referencia (opcional)"
              placeholder="Ej: M001"
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
            />
          </div>
          
          {/* Color selector */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Color resultante (opcional)
            </label>
            <div className="flex gap-3 items-start">
              <input
                type="color"
                value={formData.color || '#808080'}
                onChange={(e) => setFormData({...formData, color: e.target.value || null})}
                className="w-14 h-14 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                style={{ padding: 0 }}
              />
              <div className="flex-1">
                <Input
                  placeholder="#4A4A4A"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({...formData, color: e.target.value || null})}
                  className="font-mono"
                />
              </div>
              <div 
                className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-inner flex-shrink-0"
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Input
              label="Notas (opcional)"
              placeholder="Instrucciones especiales, aplicación, etc."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Components Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Paints */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Pinturas Disponibles ({availablePaints.length})
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Haz clic para agregar a la mezcla:
            </p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availablePaints.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No tienes pinturas comerciales. Agrega pinturas primero.
                </p>
              ) : (
                availablePaints.map(paint => (
                  <button
                    key={paint.id}
                    type="button"
                    onClick={() => addComponent(paint)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-amber-50 
                             border border-gray-200 rounded-lg transition-colors text-left"
                    disabled={components.find(c => c.paintId === paint.id)}
                  >
                    <div 
                      className="w-10 h-10 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: paint.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {paint.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {paint.brand}
                        {paint.reference && ` (${paint.reference})`}
                      </p>
                    </div>
                    <span className="text-amber-600 text-xl">+</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selected Components */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Componentes ({components.length})
            </h3>
            
            {components.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Selecciona pinturas de la lista</p>
                <p className="text-sm mt-1">Necesitas al menos 2 componentes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((component, index) => (
                  <div 
                    key={component.paintId}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 
                                  flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {component.paintName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {component.brand}
                      </p>
                    </div>
                    
                    <div className="w-20">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={component.drops}
                        onChange={(e) => updateDrops(component.paintId, e.target.value)}
                        className="text-center"
                      />
                    </div>
                    
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {currentTotal > 0 ? Math.round((component.drops / currentTotal) * 100) : 0}%
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => removeComponent(component.paintId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                
                {/* Total */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-amber-900">Total:</span>
                    <span className="font-bold text-amber-900">
                      {currentTotal} gotas
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/mixes" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            variant="primary" 
            className="flex-1"
            disabled={isPending || components.length < 2}
          >
            {isPending ? 'Creando...' : 'Crear Mezcla'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateManualMixPage
