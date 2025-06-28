import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager'

describe('CardRelationshipManager', () => {
  let relationshipManager: CardRelationshipManager
  let mockPageCard: HTMLElement
  let mockServerCard: HTMLElement
  let mockDiagramContainer: HTMLElement

  beforeEach(() => {
    // Create mock page card
    mockPageCard = document.createElement('div')
    mockPageCard.className = 'page-card'
    mockPageCard.dataset.page = 'login-page'
    mockPageCard.dataset.apis = JSON.stringify(['auth-server:POST /auth/login', 'auth-server:GET /auth/validate'])
    document.body.appendChild(mockPageCard)

    // Create mock server card
    mockServerCard = document.createElement('div')
    mockServerCard.className = 'server-card'
    mockServerCard.dataset.server = 'auth-server'
    document.body.appendChild(mockServerCard)

    // Create mock API items
    const apiItem1 = document.createElement('div')
    apiItem1.className = 'api-item'
    apiItem1.dataset.fullApi = 'auth-server:POST /auth/login'
    apiItem1.textContent = 'POST /auth/login'
    mockPageCard.appendChild(apiItem1)

    const apiItem2 = document.createElement('div')
    apiItem2.className = 'api-item'
    apiItem2.dataset.apiText = 'POST /auth/login'
    apiItem2.textContent = 'POST /auth/login'
    mockServerCard.appendChild(apiItem2)

    mockDiagramContainer = document.getElementById('diagram-container') as HTMLElement

    relationshipManager = new CardRelationshipManager()
    relationshipManager.initialize()
  })

  describe('initialization', () => {
    it('should initialize successfully with cards present', () => {
      const result = relationshipManager.initialize()
      expect(result).toBe(true)
    })

    it('should fail to initialize without cards', () => {
      // Remove all cards
      document.querySelectorAll('.page-card, .server-card').forEach(card => card.remove())
      
      const newManager = new CardRelationshipManager()
      const result = newManager.initialize()
      expect(result).toBe(false)
    })
  })

  describe('findRelatedCards', () => {
    it('should find related cards for a page card', () => {
      const relatedElements = relationshipManager.findRelatedCards(mockPageCard)

      expect(relatedElements.pages).toHaveLength(0)
      expect(relatedElements.servers).toHaveLength(1)
      expect(relatedElements.servers[0]).toBe(mockServerCard)
      expect(relatedElements.apiItems.length).toBeGreaterThan(0)
    })

    it('should find related cards for a server card', () => {
      const relatedElements = relationshipManager.findRelatedCards(mockServerCard)

      expect(relatedElements.pages).toHaveLength(1)
      expect(relatedElements.pages[0]).toBe(mockPageCard)
      expect(relatedElements.servers).toHaveLength(0)
      expect(relatedElements.apiItems.length).toBeGreaterThan(0)
    })

    it('should return empty arrays for non-card elements', () => {
      const nonCard = document.createElement('div')
      const relatedElements = relationshipManager.findRelatedCards(nonCard)

      expect(relatedElements.pages).toHaveLength(0)
      expect(relatedElements.servers).toHaveLength(0)
      expect(relatedElements.apiItems).toHaveLength(0)
    })
  })

  describe('setActiveClasses', () => {
    it('should set active classes and enable diagram-dimmed mode', () => {
      const relatedElements = {
        pages: [mockPageCard],
        servers: [mockServerCard],
        backends: [],
        apiItems: []
      }

      relationshipManager.setActiveClasses(mockPageCard, relatedElements)

      expect(mockPageCard.classList.contains('active')).toBe(true)
      expect(mockServerCard.classList.contains('active')).toBe(true)
      expect(mockDiagramContainer.classList.contains('diagram-dimmed')).toBe(true)
    })
  })

  describe('clearActiveClasses', () => {
    it('should clear all active classes and remove diagram-dimmed mode', () => {
      // First set some active classes
      mockPageCard.classList.add('active')
      mockServerCard.classList.add('active')
      mockDiagramContainer.classList.add('diagram-dimmed')

      relationshipManager.clearActiveClasses()

      expect(mockPageCard.classList.contains('active')).toBe(false)
      expect(mockServerCard.classList.contains('active')).toBe(false)
      expect(mockDiagramContainer.classList.contains('diagram-dimmed')).toBe(false)
    })

    it('should clear API item classes', () => {
      const apiItem = document.querySelector('.api-item') as HTMLElement
      apiItem.classList.add('highlighted')

      relationshipManager.clearActiveClasses()

      expect(apiItem.classList.contains('highlighted')).toBe(false)
    })
  })
})