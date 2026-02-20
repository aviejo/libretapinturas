import { useMutation, useQueryClient } from '@tanstack/react-query'
import { exportCollection, importCollection, downloadExportFile } from '@/services/importExportService'
import { toast } from 'sonner'

/**
 * Hook to export paint collection
 * @returns {Object} Mutation result with export function
 */
export function useExport() {
  return useMutation({
    mutationFn: exportCollection,
    onSuccess: (data) => {
      if (data.success) {
        downloadExportFile(data.data)
        toast.success(`Exportado ${data.data.paints?.length || 0} pinturas exitosamente`)
      } else {
        toast.error(data.error || 'Error al exportar')
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Error al exportar la colección')
    },
  })
}

/**
 * Hook to import paint collection
 * @returns {Object} Mutation result with import function
 */
export function useImport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: importCollection,
    onSuccess: (data) => {
      if (data.success) {
        const stats = data.data || {}
        toast.success(
          `Importación completada: ${stats.imported} pinturas importadas, ${stats.skipped} omitidas`
        )
        // Invalidate paints query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['paints'] })
        queryClient.invalidateQueries({ queryKey: ['mixes'] })
      } else {
        toast.error(data.error || 'Error al importar')
      }
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.error || 'Error al importar la colección'
      toast.error(errorMsg)
    },
  })
}
