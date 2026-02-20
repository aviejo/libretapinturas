import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

/**
 * PaintFilters component
 * Filters for paint list with URL query params sync
 */
function PaintFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTimerRef = useRef(null)
  const isClearingRef = useRef(false)
  
  // Local state for filters
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  
  // Sync local state with URL params when they change (e.g., from browser back/forward)
  useEffect(() => {
    if (!isClearingRef.current) {
      setSearch(searchParams.get('search') || '')
      setType(searchParams.get('type') || 'all')
    }
  }, [searchParams])
  
  // Debounced search update
  useEffect(() => {
    // Don't update URL if we're clearing filters
    if (isClearingRef.current) return
    
    // Clear any existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    
    searchTimerRef.current = setTimeout(() => {
      updateSearchParams({ search: search || undefined })
    }, 300)
    
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [search])
  
  // Update URL params
  const updateSearchParams = useCallback((updates) => {
    if (isClearingRef.current) return
    
    const newParams = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])
  
  // Handle type change
  const handleTypeChange = (e) => {
    const value = e.target.value
    setType(value)
    
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all') {
      newParams.delete('type')
    } else {
      newParams.set('type', value)
    }
    setSearchParams(newParams)
  }
  
  // Clear all filters
  const handleClearFilters = () => {
    // Set flag to prevent URL updates from effects
    isClearingRef.current = true
    
    // Clear any pending timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    
    // Clear local state
    setSearch('')
    setType('all')
    
    // Clear URL params completely
    setSearchParams(new URLSearchParams())
    
    // Reset flag after a short delay
    setTimeout(() => {
      isClearingRef.current = false
    }, 100)
  }
  
  const hasActiveFilters = search || type !== 'all'
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        {/* Search */}
        <div className="flex-1 w-full md:w-auto">
          <Input
            label="Buscar"
            placeholder="Buscar por nombre o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Type Filter */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Tipo
          </label>
          <select
            value={type}
            onChange={handleTypeChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 focus:outline-none transition-all"
          >
            <option value="all">Todos</option>
            <option value="commercial">Comerciales</option>
            <option value="mix">Mezclas</option>
          </select>
        </div>
        
        {/* Clear Button */}
        {hasActiveFilters && (
          <div className="w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="w-full md:w-auto"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
      
      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Filtros activos: {search && `Búsqueda: "${search}"`} 
            {type !== 'all' && ` Tipo: ${type === 'mix' ? 'Mezclas' : 'Comerciales'}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default PaintFilters
