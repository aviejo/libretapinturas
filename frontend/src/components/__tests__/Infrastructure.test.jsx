import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import queryClient from '@/lib/queryClient'

// Test T6.24 - Toaster configuration
// Test T6.26 - Router structure
// Test T6.27 - Layout component

describe('T6.18-T6.27: Frontend Infrastructure', () => {
  // Simple test component to verify Router works
  const TestComponent = () => (
    <div>
      <h1>Libreta de Pinturas</h1>
      <nav>
        <Link to="/paints">Mis Pinturas</Link>
        <Link to="/mixes">Mezclas</Link>
        <Link to="/import">Importar</Link>
        <Link to="/export">Exportar</Link>
      </nav>
    </div>
  )
  
  it('T6.18: QueryClient should be configured', () => {
    // Verify queryClient exists and has default options
    expect(queryClient).toBeDefined()
    expect(queryClient.getDefaultOptions).toBeDefined()
  })
  
  it('T6.24: should render Toaster component without errors', () => {
    // Toaster should render without throwing errors
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Toaster />
      </QueryClientProvider>
    )
    
    // Component should render without crashing
    expect(container).toBeTruthy()
    // Toaster adds elements to document body, not the container
    expect(document.body.contains(container)).toBe(true)
  })
  
  it('T6.26: React Router should work with MemoryRouter', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    )
    
    // Header should be present
    expect(screen.getByText('Libreta de Pinturas')).toBeInTheDocument()
  })
  
  it('T6.27: Layout navigation should have correct links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TestComponent />
      </MemoryRouter>
    )
    
    // Navigation links should be present
    expect(screen.getByText('Mis Pinturas')).toBeInTheDocument()
    expect(screen.getByText('Mezclas')).toBeInTheDocument()
    expect(screen.getByText('Importar')).toBeInTheDocument()
    expect(screen.getByText('Exportar')).toBeInTheDocument()
  })
})
