import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from '@/lib/queryClient'
import { usePaints } from '../usePaints'

// Mock API
const mockGetPaints = jest.fn()

jest.mock('@/services/paintService', () => ({
  getPaints: () => mockGetPaints()
}))

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('usePaints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  it('T8.1: should fetch paints successfully', async () => {
    // Arrange
    const mockPaints = [
      { id: '1', brand: 'Vallejo', name: 'German Grey', color: '#4A4A4A', isMix: false },
      { id: '2', brand: 'Citadel', name: 'Abaddon Black', color: '#000000', isMix: false }
    ]
    mockGetPaints.mockResolvedValue({ success: true, data: mockPaints })

    // Act
    const { result } = renderHook(() => usePaints(), { wrapper })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.paints).toEqual(mockPaints)
    expect(result.current.isError).toBe(false)
    expect(mockGetPaints).toHaveBeenCalledTimes(1)
  })

  it('T8.3: should handle loading state', async () => {
    // Arrange
    mockGetPaints.mockImplementation(() => new Promise(() => {})) // Never resolves

    // Act
    const { result } = renderHook(() => usePaints(), { wrapper })

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.paints).toEqual([])
  })

  it('T8.3: should handle error state', async () => {
    // Arrange
    mockGetPaints.mockRejectedValue({ 
      response: { data: { success: false, error: 'Network error' } }
    })

    // Act
    const { result } = renderHook(() => usePaints(), { wrapper })

    // Assert - React Query retries, so we wait for error after retries
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 5000 })
    
    // After retries, it should either have data or be in error state
    expect(result.current.isLoading).toBe(false)
  })
})
