import { cn } from '@/lib/utils'

/**
 * Badge component following Design System
 * Used for tags, brands, types
 */
const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-accent-100 text-accent-800',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    error: 'bg-error-light text-error',
    neutral: 'bg-gray-100 text-gray-700',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
