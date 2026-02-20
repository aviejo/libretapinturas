import { Link } from 'react-router-dom'
import PaintForm from '@/components/paints/PaintForm'
import Button from '@/components/ui/Button'

/**
 * CreatePaintPage
 * Page for creating a new paint
 */
function CreatePaintPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nueva Pintura
          </h1>
          <p className="text-gray-600 mt-1">
            Agrega una pintura a tu libreta
          </p>
        </div>
        <Link to="/paints">
          <Button variant="outline">
            ← Volver
          </Button>
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <PaintForm />
      </div>
    </div>
  )
}

export default CreatePaintPage
