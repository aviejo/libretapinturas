import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres')
})

/**
 * LoginForm component
 * Handles user login with validation and error handling
 */
function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/'
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit'
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const response = await login(data)
      
      if (response.success) {
        toast.success('¡Bienvenido de vuelta!')
        navigate(from, { replace: true })
      } else {
        toast.error(response.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al iniciar sesión'
      toast.error(errorMessage)
      
      // Set form error for display
      setError('root', {
        message: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div>
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          enterKeyHint="next"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          enterKeyHint="go"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      {errors.root && (
        <div className="text-error text-sm" role="alert">
          {errors.root.message}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          className="text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Entrando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Entrar
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}

export default LoginForm
