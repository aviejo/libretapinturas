import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock all dependencies before importing LoginForm
const mockLogin = jest.fn()

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false
  })
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

import LoginForm from '../LoginForm'

// Wrapper with Router
const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('T7.13: should render email and password inputs', () => {
    renderWithRouter(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('T7.13: should validate required fields', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginForm />)
    
    // Submit empty form
    const submitBtn = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitBtn)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('T7.14: should call login with valid data', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })
    
    renderWithRouter(<LoginForm />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitBtn)
    
    // Should call login
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('T7.15: should display API error message', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Credenciales inválidas' } }
    })
    
    renderWithRouter(<LoginForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword')
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitBtn)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })

  it('T7.16: should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithRouter(<LoginForm />)
    
    // Fill and submit
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText(/entrando/i)).toBeInTheDocument()
    })
  })
})
