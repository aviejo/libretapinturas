import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * Input component following Design System
 */
const Input = forwardRef(({ 
  className, 
  error, 
  label,
  id,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 placeholder:text-gray-400',
          'focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 focus:outline-none',
          'transition-all duration-200',
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-gray-200 hover:border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
