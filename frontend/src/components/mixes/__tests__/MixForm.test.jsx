import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockGenerateMix = jest.fn()

jest.mock('@/hooks/useMixes', () => ({
  useGenerateMix: () => ({
    mutate: jest.fn((data, options) => {
      // Call the mock and then execute onSuccess if provided
      mockGenerateMix(data)
      if (options?.onSuccess) {
        options.onSuccess({ success: true, data: {} })
      }
    }),
    mutateAsync: mockGenerateMix,
    isPending: false,
    isSuccess: false,
    data: null,
    error: null
  })
}))

jest.mock('@/hooks/usePaints', () => ({
  usePaints: () => ({
    paints: [
      { id: '1', brand: 'Vallejo', name: 'German Grey', color: '#4A4A4A', isMix: false },
      { id: '2', brand: 'Vallejo', name: 'Black', color: '#000000', isMix: false },
      { id: '3', brand: 'Citadel', name: 'Abaddon Black', color: '#000000', isMix: false }
    ],
    isLoading: false
  })
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

jest.mock('@/components/ui/Button', () => ({
  __esModule: true,
  default: function MockButton({ children, type, onClick, disabled, ...props }) {
    return <button type={type} onClick={onClick} disabled={disabled} {...props}>{children}</button>
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

import MixForm from '../MixForm'

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('MixForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('T9.11: should render form with target fields', () => {
    renderWithRouter(<MixForm />)
    
    expect(screen.getByLabelText(/marca objetivo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre objetivo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/referencia/i)).toBeInTheDocument()
    expect(screen.getByText(/color objetivo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generar mezcla/i })).toBeInTheDocument()
  })

  it('T9.11: should validate required fields', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MixForm />)
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /generar mezcla/i }))
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/marca es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
    })
  })

  it('T9.13: should display available paints palette', () => {
    renderWithRouter(<MixForm />)
    
    // Should show user's available paints (use full names to avoid duplicates)
    expect(screen.getByText(/german grey/i)).toBeInTheDocument()
    expect(screen.getAllByText(/vallejo/i).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/abaddon black/i)).toBeInTheDocument()
  })

  it('T9.12: should call generateMix with form data including reference', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MixForm />)
    
    // Fill form - color has default value #4A4A4A
    await user.type(screen.getByLabelText(/marca objetivo/i), 'Vallejo')
    await user.type(screen.getByLabelText(/nombre objetivo/i), 'Custom Grey')
    await user.type(screen.getByLabelText(/referencia/i), '708.83')
    // Note: color input has default value, no need to type
    
    // Submit
    await user.click(screen.getByRole('button', { name: /generar mezcla/i }))
    
    // Should call generateMix
    await waitFor(() => {
      expect(mockGenerateMix).toHaveBeenCalled()
    })
    
    // Check the call arguments
    const callArgs = mockGenerateMix.mock.calls[0][0]
    expect(callArgs.targetBrand).toBe('Vallejo')
    expect(callArgs.targetName).toBe('Custom Grey')
    expect(callArgs.targetReference).toBe('708.83')
    expect(callArgs.targetColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})
