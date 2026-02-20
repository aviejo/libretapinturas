import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

/**
 * PaintCard component
 * Displays paint information in a card format
 * @param {Object} props
 * @param {Object} props.paint - Paint data
 */
function PaintCard({ paint }) {
  const navigate = useNavigate()
  const { id, brand, name, color, isMix } = paint

  // Navigate to appropriate edit page based on paint type
  const handleClick = () => {
    if (isMix) {
      navigate(`/mixes/${id}/edit`)
    } else {
      navigate(`/paints/${id}/edit`)
    }
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Color swatch */}
        <div 
          className="w-16 h-16 rounded-lg shadow-inner border-2 border-gray-200 flex-shrink-0"
          style={{ backgroundColor: color }}
          title={`Color: ${color}`}
        />
        
        {/* Paint info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {name}
              </h3>
              <p className="text-sm text-gray-600">
                {brand}
              </p>
            </div>
            {isMix && (
              <Badge variant="accent" className="flex-shrink-0">
                Mezcla
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2 font-mono">
            {color}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default PaintCard
