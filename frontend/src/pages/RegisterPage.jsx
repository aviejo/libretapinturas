import { Link, useNavigate } from 'react-router-dom'
import RegisterForm from '@/components/auth/RegisterForm'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

/**
 * RegisterPage
 * Registration page with form and navigation to login
 */
function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size={64} />
          <h1 className="text-2xl font-semibold text-text-main mt-4">
            Crear Cuenta
          </h1>
          <p className="text-text-muted mt-2">
            Únete a la comunidad de modelistas
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-card shadow-card p-8">
          <RegisterForm />
          
          {/* Cancel Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => navigate('/login')}
            >
              Cancelar
            </Button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link 
            to="/login" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
