import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockRegister = jest.fn()

jest.mock('@/services/authService', () => ({
  register: (data) => mockRegister(data)
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock('@/components/ui/Button', () => ({
  __esModule: true,
  default: function MockButton({ children, type, disabled, ...props }) {
    return <button type={type} disabled={disabled} {...props}>{children}</button>
  }
}))

jest.mock('@/components/ui/Input', () => ({
  __esModule: true,
  default: function MockInput({ label, error, ...props }) {
    return (
      <div>
        {label && <label>{label}</label>}
        <input aria-label={label} {...props} />
        {error && <span role="alert">{error}</span>}
      </div>
    )
  }
}))

import RegisterForm from '../RegisterForm'

// Wrapper with Router
const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('T7.17: should validate password confirmation', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterForm />)
    
    // Fill form with mismatched passwords
    await user.type(screen.getByLabelText(/nombre/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password456')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('T7.18: should submit with valid data', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    renderWithRouter(<RegisterForm />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nombre/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))
    
    // Should call register
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
