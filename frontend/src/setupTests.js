import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { cleanup } from '@testing-library/react'

// Polyfill TextEncoder/TextDecoder for React Router
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Cleanup after each test to prevent memory leaks
afterEach(() => {
  cleanup()
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
  }
  observe() { }
  unobserve() { }
  disconnect() { }
}

window.IntersectionObserver = IntersectionObserverMock

// Suppress console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
