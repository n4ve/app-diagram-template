import { vi } from 'vitest'

// Mock DOM APIs that aren't available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock getBoundingClientRect for all elements
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({})
}))

// Mock SVG namespace creation
const originalCreateElementNS = document.createElementNS?.bind(document) || function(namespace: string, tagName: string) {
  // Fallback if createElementNS doesn't exist
  const element = document.createElement(tagName)
  if (namespace === 'http://www.w3.org/2000/svg') {
    // Add SVG-specific properties
    Object.defineProperty(element, 'setAttribute', {
      value: function(name: string, value: string) {
        this.attributes = this.attributes || {}
        this.attributes[name] = value
        return this
      }
    })
  }
  return element
}

document.createElementNS = vi.fn((namespace: string, tagName: string) => {
  if (namespace === 'http://www.w3.org/2000/svg') {
    // For SVG elements, use original or fallback
    const element = originalCreateElementNS(namespace, tagName)
    // Ensure setAttribute method exists and is mockable
    if (!element.setAttribute) {
      element.setAttribute = vi.fn()
    }
    return element
  }
  return document.createElement(tagName)
})

// Mock the connection SVG element
beforeEach(() => {
  // Create connection SVG container
  const connectionSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  connectionSvg.id = 'connection-svg'
  connectionSvg.setAttribute('class', 'absolute inset-0 w-full h-full pointer-events-none')
  document.body.appendChild(connectionSvg)

  // Create diagram container
  const diagramContainer = document.createElement('div')
  diagramContainer.id = 'diagram-container'
  diagramContainer.setAttribute('class', 'overflow-auto w-full border border-gray-200 rounded-lg bg-white relative cursor-grab')
  document.body.appendChild(diagramContainer)
})

afterEach(() => {
  // Clean up DOM after each test
  document.body.innerHTML = ''
})