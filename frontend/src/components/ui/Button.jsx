import { cn } from '@/lib/utils'

/**
 * Button component following Design System
 * Variants: primary, secondary, outline, ghost
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className, 
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl'
  
  // Explicit colors that will definitely work
  const variants = {
    primary: 'bg-amber-700 text-white hover:bg-amber-800 shadow-md hover:shadow-lg',
    secondary: 'bg-blue-900 text-white hover:bg-blue-800 shadow-md hover:shadow-lg',
    outline: 'border-2 border-amber-700 text-amber-700 bg-white hover:bg-amber-50 hover:border-amber-800 hover:text-amber-800',
    ghost: 'text-blue-900 hover:bg-blue-50',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], widthClass, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
