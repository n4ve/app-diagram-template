/**
 * Unit Tests for Three-Component Relationship (Login Page → Auth Server → MySQL DB)
 * Tests the complete relationship chain when hovering on any of the three components
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.ts';
import { HoverEventManager } from '../src/scripts/components/connection-area/HoverEventManager.ts';
import { CardAnimationManager } from '../src/scripts/components/connection-area/CardAnimationManager.ts';
import { CardPositionManager } from '../src/scripts/shared/CardPositionManager.ts';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager.ts';

// Mock DOM elements
const createMockCard = (id: string, className: string, dataset: Record<string, string> = {}) => {
  const element = document.createElement('div');
  element.id = id;
  element.className = className;
  Object.keys(dataset).forEach(key => {
    element.dataset[key] = dataset[key];
  });
  element.getBoundingClientRect = vi.fn(() => ({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    right: 300,
    bottom: 250,
    x: 100,
    y: 100,
    toJSON: () => ({})
  }));
  
  // Add mock methods for classList operations
  element.classList.add = vi.fn((className: string) => {
    element.className += ' ' + className;
  });
  element.classList.remove = vi.fn((className: string) => {
    element.className = element.className.replace(className, '').trim();
  });
  element.classList.contains = vi.fn((className: string) => {
    return element.className.includes(className);
  });
  
  return element;
};

const createMockApiElement = (fullApi: string, text: string) => {
  const element = document.createElement('div');
  element.className = 'api-item';
  element.dataset.fullApi = fullApi;
  element.dataset.apiText = text;
  element.textContent = text;
  element.classList.add = vi.fn();
  element.classList.remove = vi.fn();
  element.classList.contains = vi.fn();
  return element;
};

describe('Three-Component Relationship: Login Page ↔ Auth Server ↔ MySQL DB', () => {
  let relationshipManager: CardRelationshipManager;
  let hoverEventManager: HoverEventManager;
  let animationManager: CardAnimationManager;
  let positionManager: CardPositionManager;
  let connectionManager: ConnectionManager;
  
  let loginPageCard: HTMLElement;
  let authServerCard: HTMLElement;
  let mysqlBackendCard: HTMLElement;
  
  // Other cards to test isolation
  let dashboardPageCard: HTMLElement;
  let userServerCard: HTMLElement;
  let redisBackendCard: HTMLElement;

  beforeEach(() => {
    // Clear document
    document.body.innerHTML = '';
    
    // Create diagram container
    const diagramContainer = document.createElement('div');
    diagramContainer.id = 'diagram-container';
    diagramContainer.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800, x: 0, y: 0, toJSON: () => ({})
    }));
    document.body.appendChild(diagramContainer);

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'connection-svg';
    svg.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800, x: 0, y: 0, toJSON: () => ({})
    }));
    document.body.appendChild(svg);

    // Create the three main components that should be related
    loginPageCard = createMockCard('login-page', 'page-card', {
      apis: JSON.stringify([
        'auth-server:POST /auth/login',
        'auth-server:GET /auth/validate', 
        'auth-server:POST /auth/forgot-password'
      ])
    });

    authServerCard = createMockCard('auth-server', 'server-card', { 
      server: 'auth-server',
      backend: 'mysql-db'
    });

    mysqlBackendCard = createMockCard('mysql-db', 'backend-card', { 
      backend: 'mysql-db'
    });

    // Create unrelated components for isolation testing
    dashboardPageCard = createMockCard('dashboard-page', 'page-card', {
      apis: JSON.stringify([
        'user-server:GET /user/profile'
      ])
    });

    userServerCard = createMockCard('user-server', 'server-card', { 
      server: 'user-server',
      backend: 'redis-cache'
    });

    redisBackendCard = createMockCard('redis-cache', 'backend-card', { 
      backend: 'redis-cache'
    });

    // Add API elements to login page
    const loginApiElements = [
      createMockApiElement('auth-server:POST /auth/login', 'POST /auth/login'),
      createMockApiElement('auth-server:GET /auth/validate', 'GET /auth/validate'),
      createMockApiElement('auth-server:POST /auth/forgot-password', 'POST /auth/forgot-password')
    ];
    loginApiElements.forEach(el => loginPageCard.appendChild(el));

    // Add API elements to auth server
    const authApiElements = [
      createMockApiElement('', 'POST /auth/login'),
      createMockApiElement('', 'GET /auth/validate'),
      createMockApiElement('', 'POST /auth/forgot-password')
    ];
    authApiElements.forEach(el => authServerCard.appendChild(el));

    // Add all cards to container
    const allCards = [loginPageCard, authServerCard, mysqlBackendCard, 
                     dashboardPageCard, userServerCard, redisBackendCard];
    allCards.forEach(card => diagramContainer.appendChild(card));

    // Mock querySelector and querySelectorAll
    document.querySelectorAll = vi.fn((selector: string) => {
      if (selector === '.page-card, .server-card, .backend-card') {
        return allCards as any;
      }
      if (selector === '.page-card') {
        return [loginPageCard, dashboardPageCard] as any;
      }
      if (selector === '.server-card') {
        return [authServerCard, userServerCard] as any;
      }
      if (selector === '.backend-card') {
        return [mysqlBackendCard, redisBackendCard] as any;
      }
      // Active card queries
      if (selector === '.page-card.active') {
        return [loginPageCard].filter(card => card.classList.contains('active')) as any;
      }
      if (selector === '.server-card.active') {
        return [authServerCard, userServerCard].filter(card => card.classList.contains('active')) as any;
      }
      if (selector === '.backend-card.active') {
        return [mysqlBackendCard, redisBackendCard].filter(card => card.classList.contains('active')) as any;
      }
      return [] as any;
    });

    document.querySelector = vi.fn((selector: string) => {
      if (selector === '[data-server="auth-server"]') return authServerCard;
      if (selector === '[data-server="user-server"]') return userServerCard;
      if (selector === '[data-backend="mysql-db"]') return mysqlBackendCard;
      if (selector === '[data-backend="redis-cache"]') return redisBackendCard;
      // Active queries
      if (selector === '[data-server="auth-server"].active') {
        return authServerCard.classList.contains('active') ? authServerCard : null;
      }
      if (selector === '[data-backend="mysql-db"].active') {
        return mysqlBackendCard.classList.contains('active') ? mysqlBackendCard : null;
      }
      return null;
    });

    document.getElementById = vi.fn((id: string) => {
      if (id === 'diagram-container') return diagramContainer;
      if (id === 'connection-svg') return svg;
      return null;
    });

    // Initialize managers
    positionManager = new CardPositionManager();
    connectionManager = new ConnectionManager();
    relationshipManager = new CardRelationshipManager();
    animationManager = new CardAnimationManager(positionManager, connectionManager);
    hoverEventManager = new HoverEventManager(relationshipManager, animationManager, connectionManager);

    positionManager.initialize();
    connectionManager.initialize();
    relationshipManager.initialize();
    animationManager.initialize();
    hoverEventManager.initialize();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Login Page Hover', () => {
    test('should find auth server and mysql backend as related when hovering login page', () => {
      const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
      
      // Should find auth server as related
      expect(relatedElements.servers).toContain(authServerCard);
      expect(relatedElements.servers).toHaveLength(1);
      
      // Should find mysql backend as related (through auth server)
      expect(relatedElements.backends).toContain(mysqlBackendCard);
      expect(relatedElements.backends).toHaveLength(1);
      
      // Should not find unrelated components
      expect(relatedElements.pages).toHaveLength(0); // No other pages
      expect(relatedElements.servers).not.toContain(userServerCard);
      expect(relatedElements.backends).not.toContain(redisBackendCard);
    });

    test('should highlight all three components when hovering login page', () => {
      const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
      relationshipManager.setActiveClasses(loginPageCard, relatedElements);

      // All three components should be highlighted
      expect(loginPageCard.classList.contains('active')).toBe(true);
      expect(authServerCard.classList.contains('active')).toBe(true);
      expect(mysqlBackendCard.classList.contains('active')).toBe(true);

      // Unrelated components should not be highlighted
      expect(dashboardPageCard.classList.contains('active')).toBe(false);
      expect(userServerCard.classList.contains('active')).toBe(false);
      expect(redisBackendCard.classList.contains('active')).toBe(false);
    });

    test('should show diagram dimmed mode when hovering login page', () => {
      const diagramContainer = document.getElementById('diagram-container');
      const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
      relationshipManager.setActiveClasses(loginPageCard, relatedElements);

      expect(diagramContainer?.classList.contains('diagram-dimmed')).toBe(true);
    });
  });

  describe('Auth Server Hover', () => {
    test('should find login page and mysql backend as related when hovering auth server', () => {
      const relatedElements = relationshipManager.findRelatedCards(authServerCard);
      
      // Should find login page as related
      expect(relatedElements.pages).toContain(loginPageCard);
      expect(relatedElements.pages).toHaveLength(1);
      
      // Should find mysql backend as related
      expect(relatedElements.backends).toContain(mysqlBackendCard);
      expect(relatedElements.backends).toHaveLength(1);
      
      // Should not find unrelated components
      expect(relatedElements.servers).toHaveLength(0); // No other servers
      expect(relatedElements.pages).not.toContain(dashboardPageCard);
      expect(relatedElements.backends).not.toContain(redisBackendCard);
    });

    test('should highlight all three components when hovering auth server', () => {
      const relatedElements = relationshipManager.findRelatedCards(authServerCard);
      relationshipManager.setActiveClasses(authServerCard, relatedElements);

      // All three components should be highlighted
      expect(loginPageCard.classList.contains('active')).toBe(true);
      expect(authServerCard.classList.contains('active')).toBe(true);
      expect(mysqlBackendCard.classList.contains('active')).toBe(true);

      // Unrelated components should not be highlighted
      expect(dashboardPageCard.classList.contains('active')).toBe(false);
      expect(userServerCard.classList.contains('active')).toBe(false);
      expect(redisBackendCard.classList.contains('active')).toBe(false);
    });
  });

  describe('MySQL Backend Hover', () => {
    test('should find auth server and login page as related when hovering mysql backend', () => {
      const relatedElements = relationshipManager.findRelatedCards(mysqlBackendCard);
      
      // Should find auth server as related
      expect(relatedElements.servers).toContain(authServerCard);
      expect(relatedElements.servers).toHaveLength(1);
      
      // Should find login page as related (through auth server)
      expect(relatedElements.pages).toContain(loginPageCard);
      expect(relatedElements.pages).toHaveLength(1);
      
      // Should not find unrelated components
      expect(relatedElements.backends).toHaveLength(0); // No other backends
      expect(relatedElements.servers).not.toContain(userServerCard);
      expect(relatedElements.pages).not.toContain(dashboardPageCard);
    });

    test('should highlight all three components when hovering mysql backend', () => {
      const relatedElements = relationshipManager.findRelatedCards(mysqlBackendCard);
      relationshipManager.setActiveClasses(mysqlBackendCard, relatedElements);

      // All three components should be highlighted
      expect(loginPageCard.classList.contains('active')).toBe(true);
      expect(authServerCard.classList.contains('active')).toBe(true);
      expect(mysqlBackendCard.classList.contains('active')).toBe(true);

      // Unrelated components should not be highlighted
      expect(dashboardPageCard.classList.contains('active')).toBe(false);
      expect(userServerCard.classList.contains('active')).toBe(false);
      expect(redisBackendCard.classList.contains('active')).toBe(false);
    });
  });

  describe('Complete Hover Integration', () => {
    test('should maintain consistent relationship regardless of which component is hovered', () => {
      // Test all three hover scenarios
      const loginRelated = relationshipManager.findRelatedCards(loginPageCard);
      const authRelated = relationshipManager.findRelatedCards(authServerCard);
      const mysqlRelated = relationshipManager.findRelatedCards(mysqlBackendCard);

      // All three should involve the same set of components
      const allLoginComponents = [loginPageCard, ...loginRelated.servers, ...loginRelated.backends];
      const allAuthComponents = [authServerCard, ...authRelated.pages, ...authRelated.backends];
      const allMysqlComponents = [mysqlBackendCard, ...mysqlRelated.pages, ...mysqlRelated.servers];

      // Should all contain the three main components
      expect(allLoginComponents).toContain(loginPageCard);
      expect(allLoginComponents).toContain(authServerCard);
      expect(allLoginComponents).toContain(mysqlBackendCard);

      expect(allAuthComponents).toContain(loginPageCard);
      expect(allAuthComponents).toContain(authServerCard);
      expect(allAuthComponents).toContain(mysqlBackendCard);

      expect(allMysqlComponents).toContain(loginPageCard);
      expect(allMysqlComponents).toContain(authServerCard);
      expect(allMysqlComponents).toContain(mysqlBackendCard);
    });

    test('should clear all active states when reset', () => {
      // First, activate the relationship
      const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
      relationshipManager.setActiveClasses(loginPageCard, relatedElements);

      // Verify components are active
      expect(loginPageCard.classList.contains('active')).toBe(true);
      expect(authServerCard.classList.contains('active')).toBe(true);
      expect(mysqlBackendCard.classList.contains('active')).toBe(true);

      // Reset
      relationshipManager.clearActiveClasses();

      // All should be cleared
      expect(loginPageCard.classList.contains('active')).toBe(false);
      expect(authServerCard.classList.contains('active')).toBe(false);
      expect(mysqlBackendCard.classList.contains('active')).toBe(false);

      // Diagram should not be dimmed
      const diagramContainer = document.getElementById('diagram-container');
      expect(diagramContainer?.classList.contains('diagram-dimmed')).toBe(false);
    });

    test('should handle full hover event cycle for all three components', () => {
      // Mock the HoverEventManager methods
      const handleCardHoverSpy = vi.spyOn(hoverEventManager, 'handleCardHover');
      const resetAllCardsSpy = vi.spyOn(hoverEventManager, 'resetAllCards');

      // Test login page hover
      hoverEventManager.handleCardHover(loginPageCard);
      expect(handleCardHoverSpy).toHaveBeenCalledWith(loginPageCard);

      // Test auth server hover
      hoverEventManager.handleCardHover(authServerCard);
      expect(handleCardHoverSpy).toHaveBeenCalledWith(authServerCard);

      // Test mysql backend hover
      hoverEventManager.handleCardHover(mysqlBackendCard);
      expect(handleCardHoverSpy).toHaveBeenCalledWith(mysqlBackendCard);

      // Test reset
      hoverEventManager.resetAllCards();
      expect(resetAllCardsSpy).toHaveBeenCalled();
    });
  });

  describe('Connection Drawing Integration', () => {
    test('should draw page-to-server and server-to-backend connections on login page hover', () => {
      // Set up the relationship
      const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
      relationshipManager.setActiveClasses(loginPageCard, relatedElements);

      // Mock the connection manager methods
      const createConnectionLineSpy = vi.spyOn(connectionManager, 'createConnectionLine');
      const mockLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      createConnectionLineSpy.mockReturnValue(mockLine);

      // Trigger connection drawing
      hoverEventManager['drawPageConnections'](loginPageCard);

      // Should create connections for page APIs
      expect(createConnectionLineSpy).toHaveBeenCalled();
      
      // Check that page-to-server connections are created
      const pageToServerCalls = createConnectionLineSpy.mock.calls.filter(call => {
        const [from, to] = call;
        return from.closest('.page-card') && to.closest('.server-card');
      });
      expect(pageToServerCalls.length).toBeGreaterThan(0);
    });

    test('should draw server-to-backend connections on auth server hover', () => {
      // Set up the relationship
      const relatedElements = relationshipManager.findRelatedCards(authServerCard);
      relationshipManager.setActiveClasses(authServerCard, relatedElements);

      // Mock the connection manager methods
      const createConnectionLineSpy = vi.spyOn(connectionManager, 'createConnectionLine');
      const mockLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      createConnectionLineSpy.mockReturnValue(mockLine);

      // Trigger connection drawing
      hoverEventManager['drawServerConnections'](authServerCard);

      // Should create connections
      expect(createConnectionLineSpy).toHaveBeenCalled();
    });

    test('should draw complete connection chain on backend hover', () => {
      // Set up the relationship
      const relatedElements = relationshipManager.findRelatedCards(mysqlBackendCard);
      relationshipManager.setActiveClasses(mysqlBackendCard, relatedElements);

      // Mock the connection manager methods
      const createConnectionLineSpy = vi.spyOn(connectionManager, 'createConnectionLine');
      const mockLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      createConnectionLineSpy.mockReturnValue(mockLine);

      // Trigger connection drawing
      hoverEventManager['drawBackendConnections'](mysqlBackendCard);

      // Should create both page-to-server and server-to-backend connections
      expect(createConnectionLineSpy).toHaveBeenCalled();
    });

    test('should only draw connections between active (related) components', () => {
      // Set up login page relationship
      const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
      relationshipManager.setActiveClasses(loginPageCard, relatedElements);

      // Mock querySelector to return only active components
      const originalQuerySelector = document.querySelector;
      document.querySelector = vi.fn((selector: string) => {
        if (selector.includes('.active')) {
          // Only return components that should be active for login page hover
          if (selector === '[data-server="auth-server"].active') return authServerCard;
          if (selector === '[data-backend="mysql-db"].active') return mysqlBackendCard;
          // Should not return user-server or redis-cache as they're not related
          if (selector === '[data-server="user-server"].active') return null;
          if (selector === '[data-backend="redis-cache"].active') return null;
        }
        return originalQuerySelector.call(document, selector);
      });

      // Mock the connection manager
      const createConnectionLineSpy = vi.spyOn(connectionManager, 'createConnectionLine');
      const mockLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      createConnectionLineSpy.mockReturnValue(mockLine);

      // Trigger connection drawing
      hoverEventManager['drawPageConnections'](loginPageCard);

      // Verify that connections are only made to active components
      const calls = createConnectionLineSpy.mock.calls;
      calls.forEach(call => {
        const [from, to] = call;
        // Each connection should involve components that are marked as active
        const isValidConnection = 
          (from === loginPageCard || from.closest('.page-card') === loginPageCard) ||
          (to === authServerCard || to.closest('.server-card') === authServerCard) ||
          (to === mysqlBackendCard || to.closest('.backend-card') === mysqlBackendCard);
        expect(isValidConnection).toBe(true);
      });

      // Restore original querySelector
      document.querySelector = originalQuerySelector;
    });
  });

  describe('Isolation Testing', () => {
    test('should not affect unrelated component chains', () => {
      // Test that hovering on dashboard page (connected to user-server → redis-cache) 
      // does not affect the login-auth-mysql chain
      const dashboardRelated = relationshipManager.findRelatedCards(dashboardPageCard);
      relationshipManager.setActiveClasses(dashboardPageCard, dashboardRelated);

      // Dashboard chain should be active
      expect(dashboardPageCard.classList.contains('active')).toBe(true);

      // Login chain should NOT be active
      expect(loginPageCard.classList.contains('active')).toBe(false);
      expect(authServerCard.classList.contains('active')).toBe(false);
      expect(mysqlBackendCard.classList.contains('active')).toBe(false);
    });

    test('should properly isolate different backend relationships', () => {
      // When hovering mysql backend, should only affect auth-server chain
      const mysqlRelated = relationshipManager.findRelatedCards(mysqlBackendCard);
      
      // Should not include redis backend or user server
      expect(mysqlRelated.backends).not.toContain(redisBackendCard);
      expect(mysqlRelated.servers).not.toContain(userServerCard);
      expect(mysqlRelated.pages).not.toContain(dashboardPageCard);
    });
  });
});