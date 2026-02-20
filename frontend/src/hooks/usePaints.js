import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getPaints, 
  getPaintById, 
  createPaint, 
  updatePaint, 
  deletePaint 
} from '@/services/paintService'
import { toast } from 'sonner'

const PAINTS_QUERY_KEY = 'paints'

/**
 * Hook to fetch paints with TanStack Query
 * @param {Object} filters - Optional filters (brand, isMix, search)
 * @returns {Object} Query result with paints, loading state, and error
 */
export function usePaints(filters = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [PAINTS_QUERY_KEY, filters],
    queryFn: () => getPaints(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  return {
    paints: data?.data || [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

/**
 * Hook to fetch a single paint by ID
 * @param {string} id - Paint ID
 * @returns {Object} Query result with single paint
 */
export function usePaint(id) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [PAINTS_QUERY_KEY, id],
    queryFn: () => getPaintById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  return {
    paint: data?.data || null,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook to create a new paint
 * @returns {Object} Mutation result with create function
 */
export function useCreatePaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAINTS_QUERY_KEY] })
      toast.success('Pintura creada exitosamente')
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Error al crear pintura')
    },
  })
}

/**
 * Hook to update a paint
 * @returns {Object} Mutation result with update function
 */
export function useUpdatePaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updatePaint(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PAINTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PAINTS_QUERY_KEY, variables.id] })
      toast.success('Pintura actualizada exitosamente')
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Error al actualizar pintura')
    },
  })
}

/**
 * Hook to delete a paint
 * @returns {Object} Mutation result with delete function
 */
export function useDeletePaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAINTS_QUERY_KEY] })
      toast.success('Pintura eliminada exitosamente')
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Error al eliminar pintura')
    },
  })
}
