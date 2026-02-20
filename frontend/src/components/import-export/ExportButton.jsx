import { useExport } from '@/hooks/useImportExport'
import Button from '@/components/ui/Button'

/**
 * ExportButton component
 * Downloads user's paint collection as JSON file
 */
function ExportButton() {
  const { mutate: exportData, isPending } = useExport()

  const handleExport = () => {
    exportData()
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Exportando...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Libreta
        </>
      )}
    </Button>
  )
}

export default ExportButton
