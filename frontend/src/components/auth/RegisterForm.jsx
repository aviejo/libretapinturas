import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { register as registerUser } from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'

const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'La confirmación es requerida')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

function RegisterForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit'
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      })
      
      if (response.success) {
        toast.success('¡Cuenta creada exitosamente!')
        navigate('/', { replace: true })
      } else {
        toast.error(response.error || 'Error al crear cuenta')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear cuenta'
      toast.error(errorMessage)
      setError('root', { message: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <Input
        label="Nombre"
        type="text"
        placeholder="Tu nombre"
        enterKeyHint="next"
        {...register('name')}
        error={errors.name?.message}
      />

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        enterKeyHint="next"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        enterKeyHint="next"
        {...register('password')}
        error={errors.password?.message}
      />

      <Input
        label="Confirmar Contraseña"
        type="password"
        placeholder="••••••••"
        enterKeyHint="go"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

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
              Creando cuenta...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Crear Cuenta
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}

export default RegisterForm
