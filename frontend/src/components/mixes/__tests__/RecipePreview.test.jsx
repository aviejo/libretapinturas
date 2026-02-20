import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RecipePreview from '../RecipePreview'

describe('RecipePreview', () => {
  const mockRecipe = {
    targetColor: '#4A4A4A',
    recipe: {
      components: [
        { paintId: '1', paintName: 'German Grey', brand: 'Vallejo', drops: 3, percentage: 60 },
        { paintId: '2', paintName: 'Black', brand: 'Citadel', drops: 2, percentage: 40 }
      ],
      notes: 'Mix for dark grey',
      confidence: 0.85,
      totalDrops: 5
    }
  }

  it('T9.15: should render recipe components', () => {
    render(
      <MemoryRouter>
        <RecipePreview recipe={mockRecipe} />
      </MemoryRouter>
    )
    
    // Should show component paints
    expect(screen.getByText(/german grey/i)).toBeInTheDocument()
    expect(screen.getByText(/black/i)).toBeInTheDocument()
    
    // Should show drops
    expect(screen.getByText(/3 gotas/i)).toBeInTheDocument()
    expect(screen.getByText(/2 gotas/i)).toBeInTheDocument()
  })

  it('T9.17: should display confidence level', () => {
    render(
      <MemoryRouter>
        <RecipePreview recipe={mockRecipe} />
      </MemoryRouter>
    )
    
    // Should show confidence
    expect(screen.getByText(/85% confianza/i)).toBeInTheDocument()
  })

  it('T9.15: should show total drops', () => {
    render(
      <MemoryRouter>
        <RecipePreview recipe={mockRecipe} />
      </MemoryRouter>
    )
    
    // Should show total
    expect(screen.getByText(/total: 5 gotas/i)).toBeInTheDocument()
  })

  it('T9.15: should display target color preview', () => {
    render(
      <MemoryRouter>
        <RecipePreview recipe={mockRecipe} />
      </MemoryRouter>
    )
    
    // Should show target color
    expect(screen.getByText(/color objetivo/i)).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', async () => {
    const mockOnEdit = jest.fn()
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <RecipePreview recipe={mockRecipe} onEdit={mockOnEdit} />
      </MemoryRouter>
    )
    
    // Click edit
    const editBtn = screen.getByRole('button', { name: /editar/i })
    await user.click(editBtn)
    
    expect(mockOnEdit).toHaveBeenCalled()
  })

  it('should call onSave when save button clicked', async () => {
    const mockOnSave = jest.fn()
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <RecipePreview recipe={mockRecipe} onSave={mockOnSave} />
      </MemoryRouter>
    )
    
    // Click save
    const saveBtn = screen.getByRole('button', { name: /guardar mezcla/i })
    await user.click(saveBtn)
    
    expect(mockOnSave).toHaveBeenCalled()
  })
})
