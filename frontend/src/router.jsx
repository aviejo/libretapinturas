import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import PaintsPage from '@/pages/PaintsPage'
import CreatePaintPage from '@/pages/CreatePaintPage'
import EditPaintPage from '@/pages/EditPaintPage'
import MixesPage from '@/pages/MixesPage'
import GenerateMixPage from '@/pages/GenerateMixPage'
import CreateManualMixPage from '@/pages/CreateManualMixPage'
import EditMixPage from '@/pages/EditMixPage'
import ImportExportPage from '@/pages/ImportExportPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'

// Pages (will be created later)
const HomePage = () => <div className="p-8 text-center"><h1 className="text-3xl font-bold text-text-main">Libreta de Pinturas</h1><p className="mt-4 text-text-muted">Bienvenido a tu libreta personal</p></div>

/**
 * Router configuration
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { 
        index: true, 
        element: (
          <ProtectedRoute>
             <PaintsPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'paints', 
        element: (
          <ProtectedRoute>
            <PaintsPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'paints/new', 
        element: (
          <ProtectedRoute>
            <CreatePaintPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'paints/:id/edit', 
        element: (
          <ProtectedRoute>
            <EditPaintPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'mixes', 
        element: (
          <ProtectedRoute>
            <MixesPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'mixes/generate', 
        element: (
          <ProtectedRoute>
            <GenerateMixPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'mixes/new', 
        element: (
          <ProtectedRoute>
            <CreateManualMixPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'mixes/:id/edit', 
        element: (
          <ProtectedRoute>
            <EditMixPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'import-export', 
        element: (
          <ProtectedRoute>
            <ImportExportPage />
          </ProtectedRoute>
        ) 
      },
    ],
  },
  { 
    path: '/login', 
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ) 
  },
  { 
    path: '/register', 
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ) 
  },
])

export default router
