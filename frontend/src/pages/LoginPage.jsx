import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '@/components/auth/LoginForm'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

/**
 * LoginPage
 * Login page with form and navigation to register
 */
function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size={64} />
          <h1 className="text-2xl font-semibold text-text-main mt-4">
            Iniciar Sesión
          </h1>
          <p className="text-text-muted mt-2">
            Accede a tu libreta de pinturas
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-card shadow-card p-8">
          <LoginForm />
          
          {/* Cancel Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => navigate('/')}
            >
              Cancelar
            </Button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center mt-6 text-text-muted">
          ¿No tienes cuenta?{' '}
          <Link 
            to="/register" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
