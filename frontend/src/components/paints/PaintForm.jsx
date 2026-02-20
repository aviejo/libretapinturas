import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useCreatePaint } from '@/hooks/usePaints'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'

// Validation schema
const paintSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida'),
  name: z.string().min(1, 'El nombre es requerido'),
  color: z.string().min(1, 'El color es requerido').regex(/^#[0-9A-Fa-f]{6}$/, 'Formato de color inválido (use #RRGGBB)'),
  reference: z.string().optional(),
})

/**
 * PaintForm component
 * Form for creating a new paint
 */
function PaintForm() {
  const navigate = useNavigate()
  const { mutateAsync: createPaint, isPending } = useCreatePaint()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(paintSchema),
    mode: 'onSubmit',
    defaultValues: {
      color: '#4A4A4A'
    }
  })

  // Watch color for preview
  const colorValue = watch('color') || '#4A4A4A'

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      const response = await createPaint({
        ...data,
        isMix: false
      })

      if (response.success) {
        toast.success('Pintura creada exitosamente')
        navigate('/paints')
      } else {
        toast.error(response.error || 'Error al crear pintura')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear pintura'
      toast.error(errorMessage)
      setError('root', { message: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-lg">
      <Input
        label="Marca *"
        type="text"
        placeholder="Ej: Vallejo, Citadel, AK..."
        {...register('brand')}
        error={errors.brand?.message}
      />

      <Input
        label="Nombre *"
        type="text"
        placeholder="Ej: German Grey, Abaddon Black..."
        {...register('name')}
        error={errors.name?.message}
      />

      {/* Color selector with picker and preview */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Color *
        </label>
        <div className="flex gap-3 items-start">
          {/* Color picker widget */}
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <input
                type="color"
                {...field}
                className="w-14 h-14 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                style={{ padding: 0 }}
              />
            )}
          />
          
          {/* Hex text input */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="#4A4A4A"
              {...register('color')}
              error={errors.color?.message}
              className="font-mono"
            />
          </div>
          
          {/* Live preview */}
          <div 
            className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-inner flex-shrink-0"
            style={{ backgroundColor: colorValue }}
            title={`Color actual: ${colorValue}`}
          />
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      <Input
        label="Referencia (opcional)"
        type="text"
        placeholder="Ej: 70818"
        {...register('reference')}
        error={errors.reference?.message}
      />

      {errors.root && (
        <div className="text-red-600 text-sm font-medium" role="alert">
          {errors.root.message}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/paints')}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isPending || isSubmitting}
        >
          {isPending || isSubmitting ? 'Guardando...' : 'Guardar Pintura'}
        </Button>
      </div>
    </form>
  )
}

export default PaintForm
