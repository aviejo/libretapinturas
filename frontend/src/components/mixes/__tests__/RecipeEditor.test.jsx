import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RecipeEditor from '../RecipeEditor'

describe('RecipeEditor', () => {
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

  it('T9.19: should render editable recipe components', () => {
    render(
      <MemoryRouter>
        <RecipeEditor recipe={mockRecipe} />
      </MemoryRouter>
    )
    
    // Should show editable inputs for drops
    const dropInputs = screen.getAllByLabelText(/gotas/i)
    expect(dropInputs).toHaveLength(2)
    expect(dropInputs[0]).toHaveValue(3)
    expect(dropInputs[1]).toHaveValue(2)
  })

  it('T9.21: should validate minimum 2 components', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn()
    
    render(
      <MemoryRouter>
        <RecipeEditor recipe={mockRecipe} onSave={mockOnSave} />
      </MemoryRouter>
    )
    
    // Remove all components (set drops to 0 for all)
    const removeBtns = screen.getAllByLabelText(/eliminar/i)
    
    // Remove first component
    await user.click(removeBtns[0])
    
    // Remove second component
    await user.click(removeBtns[1])
    
    // Try to save
    const saveBtn = screen.getByRole('button', { name: /guardar/i })
    await user.click(saveBtn)
    
    // Should show error
    expect(screen.getByText(/La receta debe tener al menos 2 componentes/i)).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should allow adjusting drops', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <RecipeEditor recipe={mockRecipe} />
      </MemoryRouter>
    )
    
    // Find first drops input and change it
    const firstInput = screen.getAllByLabelText(/gotas/i)[0]
    await user.clear(firstInput)
    await user.type(firstInput, '5')
    
    // Should update
    expect(firstInput).toHaveValue(5)
  })

  it('should call onSave with edited recipe', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn()
    
    render(
      <MemoryRouter>
        <RecipeEditor recipe={mockRecipe} onSave={mockOnSave} />
      </MemoryRouter>
    )
    
    // Change drops
    const firstInput = screen.getAllByLabelText(/gotas/i)[0]
    await user.clear(firstInput)
    await user.type(firstInput, '4')
    
    // Save
    const saveBtn = screen.getByRole('button', { name: /guardar/i })
    await user.click(saveBtn)
    
    // Should call onSave with updated data
    expect(mockOnSave).toHaveBeenCalled()
    const savedRecipe = mockOnSave.mock.calls[0][0]
    expect(savedRecipe.recipe.components[0].drops).toBe(4)
  })

  it('should call onCancel when cancel clicked', async () => {
    const user = userEvent.setup()
    const mockOnCancel = jest.fn()
    
    render(
      <MemoryRouter>
        <RecipeEditor recipe={mockRecipe} onCancel={mockOnCancel} />
      </MemoryRouter>
    )
    
    // Click cancel
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelBtn)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
