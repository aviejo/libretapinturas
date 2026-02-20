import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PaintFilters from '../PaintFilters'

describe('PaintFilters', () => {
  it('T8.25: should render all filter inputs', () => {
    render(
      <MemoryRouter>
        <PaintFilters />
      </MemoryRouter>
    )
    
    // Check for inputs by their labels/placeholders
    expect(screen.getByPlaceholderText(/buscar por nombre/i)).toBeInTheDocument()
    
    // Check that type select exists by its default option
    expect(screen.getByDisplayValue('Todos')).toBeInTheDocument()
  })

  it('T8.25: should allow interacting with type filter', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <PaintFilters />
      </MemoryRouter>
    )
    
    // Get the type select
    const typeSelect = screen.getByDisplayValue('Todos')
    
    // Should be able to select options without error
    await user.selectOptions(typeSelect, 'mix')
    
    // Test passes if no error thrown
    expect(typeSelect).toBeInTheDocument()
  })

  it('T8.25: should allow typing in search input', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <PaintFilters />
      </MemoryRouter>
    )
    
    // Type in search
    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
    await user.type(searchInput, 'german grey')
    
    // Input should have the value
    expect(searchInput).toHaveValue('german grey')
  })

  it('T8.26: should show clear filters button when filters active', async () => {
    const user = userEvent.setup()
    
    // Start with a pre-existing filter in URL
    render(
      <MemoryRouter initialEntries={['/paints?type=mix']}>
        <PaintFilters />
      </MemoryRouter>
    )
    
    // Clear button should be visible due to active filter
    const clearButton = screen.getByRole('button', { name: /limpiar filtros/i })
    expect(clearButton).toBeInTheDocument()
    
    // Click should work without error
    await user.click(clearButton)
    
    // After clearing, select should show default
    expect(screen.getByDisplayValue('Todos')).toBeInTheDocument()
  })
})
