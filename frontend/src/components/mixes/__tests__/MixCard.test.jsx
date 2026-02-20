import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MixCard from '../MixCard'

describe('MixCard', () => {
  const mockMix = {
    id: 'mix-1',
    brand: 'Mi Marca',
    name: 'Gris Personalizado',
    reference: 'M001',
    color: '#4A4A4A',
    isMix: true,
    recipeJson: JSON.stringify({
      components: [
        { paintId: '1', paintName: 'German Grey', brand: 'Vallejo', drops: 3, percentage: 60 },
        { paintId: '2', paintName: 'Black', brand: 'Citadel', drops: 2, percentage: 40 }
      ],
      totalDrops: 5,
      notes: 'Mezcla para gris oscuro',
      confidence: 0.85
    })
  }

  it('should render mix information', () => {
    render(
      <MemoryRouter>
        <MixCard paint={mockMix} />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Gris Personalizado')).toBeInTheDocument()
    expect(screen.getByText('Mi Marca')).toBeInTheDocument()
    expect(screen.getByText('(M001)')).toBeInTheDocument()
    expect(screen.getByText('MEZCLA')).toBeInTheDocument()
    expect(screen.getByText('#4A4A4A')).toBeInTheDocument()
  })

  it('should show recipe preview', () => {
    render(
      <MemoryRouter>
        <MixCard paint={mockMix} />
      </MemoryRouter>
    )
    
    expect(screen.getByText('2 componentes')).toBeInTheDocument()
    expect(screen.getByText('5 gotas totales')).toBeInTheDocument()
    expect(screen.getByText('85% confianza')).toBeInTheDocument()
  })

  it('should expand to show recipe details', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <MixCard paint={mockMix} />
      </MemoryRouter>
    )
    
    // Click to expand
    const expandBtn = screen.getByRole('button', { name: /ver receta/i })
    await user.click(expandBtn)
    
    // Should show recipe details
    expect(screen.getByText('Receta:')).toBeInTheDocument()
    expect(screen.getByText('German Grey')).toBeInTheDocument()
    expect(screen.getByText('Black')).toBeInTheDocument()
    expect(screen.getByText('3 gotas')).toBeInTheDocument()
    expect(screen.getByText('2 gotas')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Mezcla para gris oscuro')).toBeInTheDocument()
  })

  it('should show edit link', () => {
    render(
      <MemoryRouter>
        <MixCard paint={mockMix} />
      </MemoryRouter>
    )
    
    const editLink = screen.getByRole('link', { name: /editar/i })
    expect(editLink).toHaveAttribute('href', '/mixes/mix-1/edit')
  })

  it('should call onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const mockOnDelete = jest.fn()
    
    render(
      <MemoryRouter>
        <MixCard paint={mockMix} onDelete={mockOnDelete} />
      </MemoryRouter>
    )
    
    const deleteBtn = screen.getByText('🗑️')
    await user.click(deleteBtn)
    
    expect(mockOnDelete).toHaveBeenCalledWith('mix-1')
  })

  it('should handle missing recipe gracefully', () => {
    const mixWithoutRecipe = {
      ...mockMix,
      recipeJson: null
    }
    
    render(
      <MemoryRouter>
        <MixCard paint={mixWithoutRecipe} />
      </MemoryRouter>
    )
    
    // Should still render basic info
    expect(screen.getByText('Gris Personalizado')).toBeInTheDocument()
  })
})
