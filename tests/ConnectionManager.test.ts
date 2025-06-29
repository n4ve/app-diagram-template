import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager'

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager
  let mockSvg: SVGElement

  beforeEach(() => {
    connectionManager = new ConnectionManager()
    mockSvg = document.getElementById('connection-svg') as SVGElement
  })

  describe('initialization', () => {
    it('should initialize successfully', () => {
      const result = connectionManager.initialize()
      expect(result).toBe(true)
    })
  })


  describe('createConnectionLine', () => {
    let sourceElement: HTMLElement
    let targetElement: HTMLElement

    beforeEach(() => {
      sourceElement = document.createElement('div')
      sourceElement.style.left = '10px'
      sourceElement.style.top = '20px'
      sourceElement.style.width = '100px'
      sourceElement.style.height = '50px'
      sourceElement.dataset.fullApi = 'test-server:POST /test/api'
      sourceElement.textContent = 'POST /test/api'
      document.body.appendChild(sourceElement)

      targetElement = document.createElement('div')
      targetElement.style.left = '200px'
      targetElement.style.top = '100px'
      targetElement.style.width = '100px'
      targetElement.style.height = '50px'
      targetElement.dataset.apiText = 'POST /test/api'
      targetElement.textContent = 'POST /test/api'
      document.body.appendChild(targetElement)
    })

    it('should create a connection line between two elements', () => {
      connectionManager.initialize()
      const line = connectionManager.createConnectionLine(
        sourceElement,
        targetElement,
        '#3b82f6',
        'POST'
      )

      expect(line).toBeInstanceOf(Element)
      expect(line.tagName).toBe('line')
      expect(line.getAttribute('stroke')).toBe('#3b82f6')
      expect(line.getAttribute('data-method')).toBe('POST')
    })

    it('should return null for invalid elements', () => {
      const line = connectionManager.createConnectionLine(
        null as any,
        targetElement,
        '#3b82f6',
        'POST'
      )

      expect(line).toBeNull()
    })
  })

  describe('clearConnections', () => {
    it('should remove all connection lines from SVG', () => {
      connectionManager.initialize()
      
      // Add some mock lines
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line1.classList.add('connection-line')
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line2.classList.add('connection-line')
      
      mockSvg.appendChild(line1)
      mockSvg.appendChild(line2)

      expect(mockSvg.children.length).toBe(2)

      connectionManager.clearConnections()

      expect(mockSvg.children.length).toBe(0)
    })
  })
})