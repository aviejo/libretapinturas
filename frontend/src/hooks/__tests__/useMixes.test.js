import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from '@/lib/queryClient'
import { useGenerateMix } from '../useMixes'

// Mock API
const mockGenerateMix = jest.fn()

jest.mock('@/services/mixService', () => ({
  generateMix: (params) => mockGenerateMix(params)
}))

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useGenerateMix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  it('T9.5: should generate mix and return recipe', async () => {
    // Arrange
    const mockRecipe = {
      success: true,
      data: {
        targetColor: '#4A4A4A',
        recipe: {
          components: [
            { paintId: '1', paintName: 'German Grey', brand: 'Vallejo', drops: 3, percentage: 60 },
            { paintId: '2', paintName: 'Black', brand: 'Citadel', drops: 2, percentage: 40 }
          ],
          notes: 'Mix for German Grey variant',
          confidence: 0.85,
          totalDrops: 5
        }
      }
    }
    mockGenerateMix.mockResolvedValue(mockRecipe)

    const mixParams = {
      targetBrand: 'Vallejo',
      targetName: 'Custom Grey',
      targetColor: '#4A4A4A',
      availablePaintIds: ['1', '2', '3']
    }

    // Act
    const { result } = renderHook(() => useGenerateMix(), { wrapper })
    
    // Trigger mutation
    result.current.mutate(mixParams)

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(mockGenerateMix).toHaveBeenCalledWith(mixParams)
    expect(result.current.data).toEqual(mockRecipe)
  })

  it('T9.7: should handle loading state', async () => {
    // Arrange
    let resolvePromise
    mockGenerateMix.mockImplementation(() => new Promise((resolve) => {
      resolvePromise = resolve
    }))

    // Act
    const { result } = renderHook(() => useGenerateMix(), { wrapper })
    
    // Trigger mutation
    act(() => {
      result.current.mutate({
        targetBrand: 'Vallejo',
        targetName: 'Test',
        targetColor: '#FF0000',
        availablePaintIds: ['1']
      })
    })

    // Assert - isPending should be true while loading
    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })
    
    // Resolve to complete test
    act(() => {
      resolvePromise({ success: true, data: {} })
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('T9.9: should handle AI failure', async () => {
    // Arrange
    mockGenerateMix.mockRejectedValue({
      response: { 
        status: 500,
        data: { error: 'AI service unavailable' }
      }
    })

    // Act
    const { result } = renderHook(() => useGenerateMix(), { wrapper })
    
    result.current.mutate({
      targetBrand: 'Vallejo',
      targetName: 'Test',
      targetColor: '#FF0000',
      availablePaintIds: ['1']
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    
    expect(result.current.error).toBeDefined()
  })
})
