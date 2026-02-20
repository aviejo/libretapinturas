import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePaint, useUpdatePaint, useDeletePaint } from '@/hooks/usePaints'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

/**
 * EditPaintPage
 * Page for editing or deleting a paint
 */
function EditPaintPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { paint, isLoading: isLoadingPaint } = usePaint(id)
  const { mutateAsync: updatePaint, isPending: isUpdating } = useUpdatePaint()
  const { mutateAsync: deletePaint, isPending: isDeleting } = useDeletePaint()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    color: '#000000',
    reference: ''
  })

  // Load paint data when available
  useEffect(() => {
    if (paint) {
      setFormData({
        brand: paint.brand || '',
        name: paint.name || '',
        color: paint.color || '#000000',
        reference: paint.reference || ''
      })
    }
  }, [paint])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updatePaint({ id, data: formData })
      toast.success('Pintura actualizada')
      navigate('/paints')
    } catch (err) {
      toast.error('Error al actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta pintura?')) return

    try {
      await deletePaint(id)
      toast.success('Pintura eliminada')
      navigate('/paints')
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  if (isLoadingPaint) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Pintura</h1>
          <p className="text-gray-600 mt-1">Modifica los datos de la pintura</p>
        </div>
        <Link to="/paints">
          <Button variant="outline">← Volver</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Marca"
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
          />

          <Input
            label="Nombre"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Color</label>
            <div className="flex gap-3 items-start">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-14 h-14 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="font-mono flex-1"
              />
              <div 
                className="w-14 h-14 rounded-lg border-2 border-gray-300 shadow-inner"
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </div>

          <Input
            label="Referencia"
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData({...formData, reference: e.target.value})}
          />

          <div className="flex gap-4 pt-6">
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
              disabled={isUpdating || isSubmitting}
            >
              {isUpdating || isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 border-red-300 hover:bg-red-50 w-full"
            >
              {isDeleting ? 'Eliminando...' : '🗑️ Eliminar Pintura'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPaintPage
