import { Component } from 'react';
import { toast } from 'sonner';

/**
 * Error Boundary component to catch React render errors
 * Prevents the entire app from crashing when a component fails
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show toast notification
    toast.error('Ha ocurrido un error inesperado. Por favor, recarga la página.');
    
    // In production, you could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }
  
  handleReload = () => {
    window.location.reload();
  };
  
  handleGoHome = () => {
    window.location.href = '/';
  };
  
  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Algo salió mal
              </h2>
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado en la aplicación. 
                Por favor, intenta recargar la página.
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={this.handleReload}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Recargar página
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Volver al inicio
              </button>
            </div>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-semibold text-gray-700 mb-2">Detalles del error (solo desarrollo):</p>
                <pre className="text-xs text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
