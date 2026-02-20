import { cn } from '@/lib/utils'

/**
 * Card component following Design System
 * Used for containing content sections
 */
const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-background-card border border-border-soft rounded-card p-5',
        hover && 'shadow-card hover:shadow-card-hover transition-shadow duration-200',
        !hover && 'shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
