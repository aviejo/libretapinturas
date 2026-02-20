import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import queryClient from '@/lib/queryClient'
import router from '@/router'
import { RouterProvider } from 'react-router-dom'

/**
 * Main App component
 * Provides QueryClient, AuthProvider, Router, and Toaster
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E8E2DA',
              borderRadius: '12px',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
