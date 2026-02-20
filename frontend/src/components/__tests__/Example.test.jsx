// src/components/__tests__/Example.test.jsx
// Example test to verify testing configuration works

import { render, screen } from '@testing-library/react'
import Example from '../Example'

describe('Example Component', () => {
  it('T6.8: should render successfully', () => {
    render(<Example />)
    
    expect(screen.getByText('Example Component')).toBeInTheDocument()
  })
  
  it('T6.8: should use Tailwind classes', () => {
    render(<Example />)
    
    const element = screen.getByTestId('example')
    expect(element).toHaveClass('text-primary-600')
  })
})
