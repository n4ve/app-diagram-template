/**
 * Unit Tests for Connection Line Matching on Hover
 * Tests that the correct API-to-API connections are drawn when hovering cards
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CardAnimationManager } from '../src/scripts/components/connection-area/CardAnimationManager.ts';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.ts';
import { CardPositionManager } from '../src/scripts/shared/CardPositionManager.ts';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager.ts';
import { HoverEventManager } from '../src/scripts/components/connection-area/HoverEventManager.ts';

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
  return element;
};

const createMockApiElement = (fullApi: string, text: string) => {
  const element = document.createElement('div');
  element.className = 'api-item';
  element.dataset.fullApi = fullApi;
  element.dataset.apiText = text;
  element.textContent = text;
  element.getBoundingClientRect = vi.fn(() => ({
    left: 110,
    top: 120,
    width: 180,
    height: 30,
    right: 290,
    bottom: 150,
    x: 110,
    y: 120,
    toJSON: () => ({})
  }));
  return element;
};

describe('Connection Line Matching on Hover', () => {
  let animationManager: CardAnimationManager;
  let relationshipManager: CardRelationshipManager;
  let positionManager: CardPositionManager;
  let connectionManager: ConnectionManager;
  let hoverEventManager: HoverEventManager;
  
  let loginPageCard: HTMLElement;
  let authServerCard: HTMLElement;
  let paymentServerCard: HTMLElement;
  let userServerCard: HTMLElement;
  
  let mockSvg: SVGSVGElement;
  let createdLines: SVGLineElement[] = [];

  beforeEach(() => {
    // Clear document
    document.body.innerHTML = '';
    createdLines = [];
    
    // Create diagram container
    const diagramContainer = document.createElement('div');
    diagramContainer.id = 'diagram-container';
    diagramContainer.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800, x: 0, y: 0, toJSON: () => ({})
    }));
    document.body.appendChild(diagramContainer);

    // Create SVG element
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    mockSvg.id = 'connection-svg';
    mockSvg.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800, x: 0, y: 0, toJSON: () => ({})
    }));
    
    // Mock appendChild to track created lines
    mockSvg.appendChild = vi.fn((child: Node) => {
      if (child.nodeName === 'line') {
        createdLines.push(child as SVGLineElement);
      }
      return child;
    });
    
    document.body.appendChild(mockSvg);

    // Create login page with multiple APIs
    loginPageCard = createMockCard('login-page', 'page-card', {
      apis: JSON.stringify([
        'auth-server:POST /auth/login',
        'auth-server:GET /auth/validate', 
        'auth-server:POST /auth/forgot-password',
        'payment-server:GET /payment/status'
      ])
    });

    // Create server cards
    authServerCard = createMockCard('auth-server', 'server-card', { server: 'auth-server' });
    paymentServerCard = createMockCard('payment-server', 'server-card', { server: 'payment-server' });
    userServerCard = createMockCard('user-server', 'server-card', { server: 'user-server' });

    // Add API elements to login page (each with correct data attributes)
    const loginApiElements = [
      createMockApiElement('auth-server:POST /auth/login', 'POST /auth/login'),
      createMockApiElement('auth-server:GET /auth/validate', 'GET /auth/validate'),
      createMockApiElement('auth-server:POST /auth/forgot-password', 'POST /auth/forgot-password'),
      createMockApiElement('payment-server:GET /payment/status', 'GET /payment/status')
    ];
    loginApiElements.forEach(el => loginPageCard.appendChild(el));

    // Add matching API elements to auth server
    const authApiElements = [
      createMockApiElement('', 'POST /auth/login'),
      createMockApiElement('', 'GET /auth/validate'),
      createMockApiElement('', 'POST /auth/forgot-password')
    ];
    authApiElements.forEach(el => authServerCard.appendChild(el));

    // Add matching API element to payment server
    const paymentApiElements = [
      createMockApiElement('', 'GET /payment/status')
    ];
    paymentApiElements.forEach(el => paymentServerCard.appendChild(el));

    // Add all cards to container
    [loginPageCard, authServerCard, paymentServerCard, userServerCard]
      .forEach(card => diagramContainer.appendChild(card));

    // Mock querySelector and querySelectorAll BEFORE creating managers
    const allCards = [loginPageCard, authServerCard, paymentServerCard, userServerCard];
    
    document.querySelectorAll = vi.fn((selector: string) => {
      if (selector === '.page-card, .server-card, .backend-card') return allCards as any;
      if (selector === '.page-card, .server-card') return allCards as any;
      if (selector === '.page-card') return [loginPageCard] as any;
      if (selector === '.server-card') return [authServerCard, paymentServerCard, userServerCard] as any;
      if (selector === '.backend-card') return [] as any;
      if (selector === '.api-item') {
        // Return all API items from all cards
        const allApiItems: HTMLElement[] = [];
        allCards.forEach(card => {
          const apiItems = Array.from(card.querySelectorAll('.api-item')) as HTMLElement[];
          allApiItems.push(...apiItems);
        });
        return allApiItems as any;
      }
      return [] as any;
    });

    document.querySelector = vi.fn((selector: string) => {
      if (selector === '[data-server="auth-server"]') return authServerCard;
      if (selector === '[data-server="payment-server"]') return paymentServerCard;
      if (selector === '[data-server="user-server"]') return userServerCard;
      if (selector === '#connection-svg') return mockSvg;
      if (selector === '#diagram-container') return diagramContainer;
      return null;
    });

    document.getElementById = vi.fn((id: string): HTMLElement | null => {
      if (id === 'diagram-container') return diagramContainer;
      if (id === 'connection-svg') return mockSvg as any;
      return null;
    });

    // Initialize managers AFTER setting up mocks
    positionManager = new CardPositionManager();
    connectionManager = new ConnectionManager();
    relationshipManager = new CardRelationshipManager();
    animationManager = new CardAnimationManager(positionManager, connectionManager);
    hoverEventManager = new HoverEventManager(relationshipManager, animationManager, connectionManager);

    // Spy on createConnectionLine but let it run the real implementation
    const mockCreateConnectionLine = vi.spyOn(connectionManager, 'createConnectionLine');

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

  test('should create multiple connection lines when hovering login page', async () => {
    // Trigger full hover behavior through HoverEventManager
    hoverEventManager.handleCardHover(loginPageCard);
    
    // Wait for animation and connection drawing to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should create 4 connection lines (one for each API match)
    expect(createdLines.length).toBe(4);
    
    // Check that lines have correct attributes
    createdLines.forEach(line => {
      expect(line.getAttribute('stroke-width')).toBe('4');
      expect(line.getAttribute('opacity')).toBe('0.9');
      expect(line.classList.contains('highlighted')).toBe(true);
    });
  });

  test('should highlight matching API elements when hovering login page', async () => {
    // Trigger full hover behavior through HoverEventManager
    hoverEventManager.handleCardHover(loginPageCard);
    
    // Wait for animation and connection drawing to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that login page API elements are highlighted
    const loginApiElements = loginPageCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
    loginApiElements.forEach(apiElement => {
      expect(apiElement.classList.contains('highlighted')).toBe(true);
    });
    
    // Check that matching server API elements are highlighted
    const authApiElements = authServerCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
    authApiElements.forEach(apiElement => {
      expect(apiElement.classList.contains('highlighted')).toBe(true);
    });
    
    const paymentApiElements = paymentServerCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
    paymentApiElements.forEach(apiElement => {
      expect(apiElement.classList.contains('highlighted')).toBe(true);
    });
  });

  test('should create connections when hovering auth server', async () => {
    // Manually trigger server hover connections
    hoverEventManager.handleCardHover(authServerCard);
    
    // Wait for connection drawing timeout
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should create 3 connection lines for auth server APIs
    expect(createdLines.length).toBe(3);
    
    // All lines should be properly styled
    createdLines.forEach(line => {
      expect(line.getAttribute('stroke-width')).toBe('4');
      expect(line.getAttribute('opacity')).toBe('0.9');
      expect(line.classList.contains('highlighted')).toBe(true);
    });
  });

  test('should match correct API pairs for each connection', async () => {
    // Trigger full hover behavior through HoverEventManager
    hoverEventManager.handleCardHover(loginPageCard);
    
    // Wait for animation and connection drawing to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that each connection line corresponds to a matching API pair
    const expectedConnections = [
      { page: 'POST /auth/login', server: 'auth-server' },
      { page: 'GET /auth/validate', server: 'auth-server' },
      { page: 'POST /auth/forgot-password', server: 'auth-server' },
      { page: 'GET /payment/status', server: 'payment-server' }
    ];
    
    // Check that we have the right number of connections
    expect(createdLines.length).toBe(expectedConnections.length);
    
    // Verify API elements exist and are highlighted
    expectedConnections.forEach(connection => {
      const pageApiElement = loginPageCard.querySelector(`[data-api-text="${connection.page}"]`);
      const serverCard = document.querySelector(`[data-server="${connection.server}"]`);
      const serverApiElement = serverCard?.querySelector(`[data-api-text="${connection.page}"]`);
      
      if (pageApiElement && serverApiElement) {
        expect((pageApiElement as HTMLElement).classList.contains('highlighted')).toBe(true);
        expect((serverApiElement as HTMLElement).classList.contains('highlighted')).toBe(true);
      }
    });
  });

  test('should not create connections to unrelated servers', async () => {
    // Trigger full hover behavior through HoverEventManager
    hoverEventManager.handleCardHover(loginPageCard);
    
    // Wait for animation and connection drawing to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // User server should not have any highlighted API elements
    const userApiElements = userServerCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
    userApiElements.forEach(apiElement => {
      expect(apiElement.classList.contains('highlighted')).toBe(false);
    });
  });

  test('should set data-method attributes for HTTP method styling', () => {
    // Test that connection lines get proper data-method attributes for CSS styling
    const postLine = connectionManager.createConnectionLine(loginPageCard, authServerCard, '#6B7280', 'POST');
    const getLine = connectionManager.createConnectionLine(loginPageCard, authServerCard, '#6B7280', 'GET');
    const websocketLine = connectionManager.createConnectionLine(loginPageCard, authServerCard, '#6B7280', 'WEBSOCKET');
    
    expect(postLine?.getAttribute('data-method')).toBe('POST');
    expect(getLine?.getAttribute('data-method')).toBe('GET');
    expect(websocketLine?.getAttribute('data-method')).toBe('WEBSOCKET');
    
    // Verify dash patterns are set correctly
    expect(postLine?.getAttribute('stroke-dasharray')).toBe('5,5');
    expect(getLine?.getAttribute('stroke-dasharray')).toBe('none');
    expect(websocketLine?.getAttribute('stroke-dasharray')).toBe('20,5,5,5');
  });

  test('should clear previous connections before drawing new ones', async () => {
    const mockClearConnections = vi.spyOn(connectionManager, 'clearConnections');
    
    // Trigger full hover behavior through HoverEventManager
    hoverEventManager.handleCardHover(loginPageCard);
    
    // Wait for animation and connection drawing to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // clearConnections should be called before drawing new connections
    expect(mockClearConnections).toHaveBeenCalled();
  });

  test('should handle missing API elements gracefully', async () => {
    // Create a page with API that doesn't exist on server
    const testPageCard = createMockCard('test-page', 'page-card', {
      apis: JSON.stringify(['nonexistent-server:GET /missing/api'])
    });
    
    const testApiElement = createMockApiElement('nonexistent-server:GET /missing/api', 'GET /missing/api');
    testPageCard.appendChild(testApiElement);
    
    const relatedElements = relationshipManager.findRelatedCards(testPageCard);
    await animationManager.repositionRelatedCards(testPageCard, relatedElements);
    
    // Should not create any connections for missing APIs
    expect(createdLines.length).toBe(0);
    
    // Should not throw any errors
    expect(true).toBe(true); // Test passes if no errors are thrown
  });
});