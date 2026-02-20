import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePaints } from '@/hooks/usePaints'
import { useGenerateMix } from '@/hooks/useMixes'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// Validation schema
const mixSchema = z.object({
  targetBrand: z.string().min(1, 'La marca es requerida'),
  targetName: z.string().min(1, 'El nombre es requerido'),
  targetReference: z.string().optional(),
  targetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Formato inválido (use #RRGGBB)').optional().or(z.literal('')),
  description: z.string().optional(),
})

/**
 * MixForm component
 * Form for generating AI paint mixes
 */
function MixForm({ onSuccess }) {
  const { paints, isLoading: paintsLoading } = usePaints()
  const { mutate: generateMix, isPending } = useGenerateMix()
  const [colorPreview, setColorPreview] = useState('#4A4A4A')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(mixSchema),
    mode: 'onSubmit',
    defaultValues: {
      targetColor: ''
    }
  })

  // Watch color for preview
  const targetColor = watch('targetColor')

  const onSubmit = (data) => {
    // Get IDs of available paints (excluding mixes to avoid recursion)
    const availablePaintIds = paints
      .filter(p => !p.isMix)
      .map(p => p.id)

    if (availablePaintIds.length < 2) {
      toast.error('Necesitas al menos 2 pinturas comerciales para generar una mezcla')
      return
    }

    generateMix({
      targetBrand: data.targetBrand,
      targetName: data.targetName,
      targetReference: data.targetReference,
      // Only send targetColor if user provided one
      ...(data.targetColor && data.targetColor.trim() !== '' && { targetColor: data.targetColor }),
      description: data.description,
      availablePaintIds
    }, {
      onSuccess: (result) => {
        if (result.success && onSuccess) {
          // Include target info with recipe data for saving
          onSuccess({
            ...result.data,
            targetBrand: data.targetBrand,
            targetName: data.targetName,
            targetReference: data.targetReference,
            targetColor: data.targetColor || null,
          })
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Target Paint Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Pintura Objetivo</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Marca objetivo *"
              placeholder="Ej: Vallejo"
              {...register('targetBrand')}
              error={errors.targetBrand?.message}
            />

            <Input
              label="Nombre objetivo *"
              placeholder="Ej: German Grey 2.0"
              {...register('targetName')}
              error={errors.targetName?.message}
            />
          </div>

          <Input
            label="Referencia (opcional)"
            placeholder="Ej: 708.83 (Vallejo), 191 (Army Painter)..."
            {...register('targetReference')}
            error={errors.targetReference?.message}
          />

          {/* Color selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Color objetivo (opcional)
            </label>
            <div className="flex gap-3 items-start">
              <input
                type="color"
                {...register('targetColor')}
                className="w-14 h-14 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                style={{ padding: 0 }}
                onChange={(e) => setValue('targetColor', e.target.value)}
              />
              <div className="flex-1">
                <Input
                  placeholder="#4A4A4A"
                  {...register('targetColor')}
                  error={errors.targetColor?.message}
                  className="font-mono"
                />
              </div>
              <div 
                className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-inner flex-shrink-0"
                style={{ backgroundColor: targetColor }}
              />
            </div>
          </div>

          <Input
            label="Descripción (opcional)"
            placeholder="Describe el color que buscas..."
            {...register('description')}
            error={errors.description?.message}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isPending || paintsLoading}
          >
            {isPending ? 'Generando mezcla...' : 'Generar Mezcla con IA'}
          </Button>
        </form>
      </div>

      {/* Available Paints Palette */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Paleta Disponible ({paints.filter(p => !p.isMix).length} pinturas)
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          La IA usará estas pinturas para crear la mezcla:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {paintsLoading ? (
            <p className="text-gray-500 col-span-full">Cargando pinturas...</p>
          ) : paints.filter(p => !p.isMix).length === 0 ? (
            <p className="text-red-600 col-span-full">
              No tienes pinturas comerciales. Agrega pinturas primero.
            </p>
          ) : (
            paints
              .filter(p => !p.isMix)
              .map(paint => (
                <div 
                  key={paint.id}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                >
                  <div 
                    className="w-8 h-8 rounded border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: paint.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {paint.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {paint.brand}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MixForm
