import { useMutation } from '@tanstack/react-query'
import { generateMix, saveMix } from '@/services/mixService'
import { toast } from 'sonner'

/**
 * Hook to generate paint mix using AI
 * @returns {Object} Mutation result with generate function
 */
export function useGenerateMix() {
  return useMutation({
    mutationFn: generateMix,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Mezcla generada exitosamente')
      } else {
        toast.error(data.error || 'Error al generar mezcla')
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Error al generar mezcla'
      if (error.response?.status === 429) {
        toast.error('Demasiadas solicitudes. Por favor, espera un momento.')
      } else {
        toast.error(errorMessage)
      }
    },
  })
}

/**
 * Hook to save generated mix as a paint
 * @returns {Object} Mutation result with save function
 */
export function useSaveMix() {
  return useMutation({
    mutationFn: saveMix,
    onSuccess: () => {
      toast.success('Mezcla guardada en tu libreta')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al guardar mezcla')
    },
  })
}
