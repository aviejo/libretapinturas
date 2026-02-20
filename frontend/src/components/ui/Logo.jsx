import logoSvg from '@/assets/logo.svg'

/**
 * Logo component
 * Displays the application logo
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.size - Size in pixels (default: 40)
 */
function Logo({ className = '', size = 40 }) {
  return (
    <img 
      src={logoSvg} 
      alt="Libreta de Pinturas" 
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default Logo
