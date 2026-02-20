import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockCreatePaint = jest.fn()
const mockNavigate = jest.fn()

jest.mock('@/hooks/usePaints', () => ({
  useCreatePaint: () => ({
    mutateAsync: mockCreatePaint,
    isPending: false
  })
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
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

import PaintForm from '../PaintForm'

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('PaintForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('T8.20: should render all required fields', () => {
    renderWithRouter(<PaintForm />)
    
    expect(screen.getByLabelText(/marca/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    // Color field is now a complex widget, just check the label exists
    expect(screen.getByText(/color/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/referencia/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('T8.21: should validate required fields', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PaintForm />)
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/marca es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
    })
  })

  it('T8.22: should validate color format', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PaintForm />)
    
    // Fill with invalid color
    await user.type(screen.getByLabelText(/marca/i), 'Vallejo')
    await user.type(screen.getByLabelText(/nombre/i), 'Test')
    // Use the text input for color (second input in the color section)
    const colorInput = screen.getAllByPlaceholderText(/#4A4A4A/i)[0]
    await user.clear(colorInput)
    await user.type(colorInput, 'invalid-color')
    
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    
    // Should show color validation error (appears twice due to Input component structure)
    await waitFor(() => {
      const errors = screen.getAllByText(/formato de color inválido/i)
      expect(errors.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('T8.23: should create paint with valid data', async () => {
    const user = userEvent.setup()
    mockCreatePaint.mockResolvedValue({ success: true })
    
    renderWithRouter(<PaintForm />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/marca/i), 'Vallejo')
    await user.type(screen.getByLabelText(/nombre/i), 'German Grey')
    // Use the text input for color
    const colorInput = screen.getAllByPlaceholderText(/#4A4A4A/i)[0]
    await user.clear(colorInput)
    await user.type(colorInput, '#4A4A4A')
    await user.type(screen.getByLabelText(/referencia/i), '70818')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    
    // Should call createPaint
    await waitFor(() => {
      expect(mockCreatePaint).toHaveBeenCalledWith({
        brand: 'Vallejo',
        name: 'German Grey',
        color: '#4A4A4A',
        reference: '70818',
        isMix: false
      })
    })
  })

  it('T8.24: should navigate to paints list after success', async () => {
    const user = userEvent.setup()
    mockCreatePaint.mockResolvedValue({ success: true })
    
    renderWithRouter(<PaintForm />)
    
    // Fill and submit
    await user.type(screen.getByLabelText(/marca/i), 'Vallejo')
    await user.type(screen.getByLabelText(/nombre/i), 'Test')
    // Use the text input for color
    const colorInput = screen.getAllByPlaceholderText(/#4A4A4A/i)[0]
    await user.clear(colorInput)
    await user.type(colorInput, '#FF0000')
    
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    
    // Should navigate
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/paints')
    })
  })
})
