import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

/**
 * Main Layout component
 * Contains header and navigation with auth-aware menu
 * Responsive design with mobile hamburger menu
 */
const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background-main">
      {/* Header */}
      <header className="bg-white border-b border-border-soft shadow-soft relative z-40">
        <div className="max-w-container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <Logo size={36} className="sm:w-10 sm:h-10" />
              <span className="text-lg sm:text-xl font-semibold text-text-main max-w-[180px] sm:max-w-none">
                Libreta de Pinturas
              </span>
            </Link>
            
            {/* Desktop Navigation - Only for authenticated users */}
            {isAuthenticated ? (
              <>
                {/* Desktop Menu (hidden on mobile) */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link to="/paints" className="text-text-muted hover:text-primary transition-colors">
                    Mis Pinturas
                  </Link>
                  <Link to="/mixes" className="text-text-muted hover:text-primary transition-colors">
                    Mezclas
                  </Link>
                  <Link to="/import-export" className="text-text-muted hover:text-primary transition-colors">
                    Importar/Exportar
                  </Link>
                  
                  {/* User info & Logout */}
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border-soft">
                    <span className="text-sm text-text-muted hidden lg:inline">
                      {user?.name}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </nav>

                {/* Mobile Menu Button (visible only on mobile) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    // Close icon (X)
                    <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    // Hamburger icon
                    <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              /* Auth buttons for non-authenticated users - Desktop */
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="text-text-main hover:text-primary transition-colors font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </nav>
            )}

            {/* Mobile Auth Buttons (visible only on mobile when not authenticated) */}
            {!isAuthenticated && (
              <div className="md:hidden flex items-center gap-2">
                <Link to="/login" className="text-sm text-text-main hover:text-primary transition-colors font-medium">
                  Entrar
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="text-xs px-3 py-1">
                    Registro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isAuthenticated && (
        <>
          {/* Dark overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-[280px] max-w-[80vw] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-soft">
              <span className="font-semibold text-text-main">Menú</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <nav className="flex flex-col p-4 gap-2">
              {/* User info */}
              <div className="mb-4 pb-4 border-b border-border-soft">
                <p className="text-sm text-text-muted">Conectado como:</p>
                <p className="font-semibold text-text-main truncate">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>

              {/* Navigation Links */}
              <Link 
                to="/paints" 
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-main hover:bg-amber-50 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Mis Pinturas
              </Link>

              <Link 
                to="/mixes" 
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-main hover:bg-amber-50 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Mezclas
              </Link>

              <Link 
                to="/import-export" 
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-main hover:bg-amber-50 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Importar/Exportar
              </Link>

              {/* Divider */}
              <div className="my-4 border-t border-border-soft" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </>
      )}
      
      {/* Main Content */}
      <main className="max-w-container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
