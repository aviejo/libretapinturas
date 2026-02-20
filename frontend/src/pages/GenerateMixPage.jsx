import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MixForm from '@/components/mixes/MixForm'
import RecipePreview from '@/components/mixes/RecipePreview'
import RecipeEditor from '@/components/mixes/RecipeEditor'
import Button from '@/components/ui/Button'
import { useCreatePaint } from '@/hooks/usePaints'
import { toast } from 'sonner'

/**
 * GenerateMixPage
 * Full flow: Form → AI Generation → Preview/Edit → Save
 * Saves mix as a paint with isMix=true and recipeJson
 */
function GenerateMixPage() {
  const navigate = useNavigate()
  const [generatedRecipe, setGeneratedRecipe] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const { mutateAsync: createPaint, isPending: isSaving } = useCreatePaint()

  // Handle successful generation
  const handleGenerationSuccess = (recipe) => {
    setGeneratedRecipe(recipe)
    setIsEditing(false)
  }

  // Handle save - transform recipe to paint data
  const handleSave = async (recipeToSave) => {
    try {
      // Clean recipe - only keep components and totalDrops
      // Notes go in paint.notes field, not in recipe_json
      const cleanedRecipe = {
        components: recipeToSave.recipe?.components || [],
        totalDrops: recipeToSave.recipe?.components?.reduce((sum, c) => sum + (c.drops || 0), 0) || 0
      }
      
      const paintData = {
        brand: recipeToSave.targetBrand || 'Mezcla Personalizada',
        name: recipeToSave.targetName || 'Mezcla Personalizada',
        reference: recipeToSave.targetReference || null,
        color: recipeToSave.targetColor || null,
        isMix: true,
        recipe: cleanedRecipe,
        inStock: true,
        notes: recipeToSave.recipe?.notes || '',
      }
      
      // Create paint using existing hook
      await createPaint(paintData)
      
      toast.success('Mezcla guardada exitosamente')
      navigate('/mixes')
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Error al guardar la mezcla')
    }
  }

  // Handle edit toggle
  const handleEdit = () => {
    setIsEditing(true)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Generar Mezcla con IA
          </h1>
          <p className="text-gray-600 mt-1">
            Describe la pintura que necesitas y la IA creará una receta
          </p>
        </div>
        <Link to="/mixes">
          <Button variant="outline">← Volver</Button>
        </Link>
      </div>

      {/* Form Section */}
      {!generatedRecipe && (
        <MixForm onSuccess={handleGenerationSuccess} />
      )}

      {/* Recipe Preview/Edit Section */}
      {generatedRecipe && (
        <div className="space-y-6">
          {/* Back to form button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGeneratedRecipe(null)
                setIsEditing(false)
              }}
            >
              ← Nueva mezcla
            </Button>
          </div>

          {/* Show Preview or Editor */}
          {isEditing ? (
            <RecipeEditor
              recipe={generatedRecipe}
              onSave={async (editedRecipe, notes) => {
                // Merge notes into recipe before saving
                const recipeWithNotes = {
                  ...editedRecipe,
                  recipe: {
                    ...editedRecipe.recipe,
                    notes
                  }
                }
                await handleSave(recipeWithNotes)
              }}
              onCancel={handleCancelEdit}
            />
          ) : (
            <RecipePreview
              recipe={generatedRecipe}
              onEdit={handleEdit}
              onSave={async () => {
                await handleSave(generatedRecipe)
              }}
            />
          )}
        </div>
      )}

      {/* Help text */}
      {!generatedRecipe && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Consejos:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Sé específico con el nombre del color</li>
            <li>Usa el selector de color o introduce el hex directamente</li>
            <li>Añade una descripción para mejorar los resultados de la IA</li>
            <li>La IA usará las pinturas de tu libreta como base</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default GenerateMixPage
