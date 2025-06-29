/**
 * Simple Unit Tests for Connection Line Matching on Hover
 * Tests the API-to-API connection logic directly
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CardAnimationManager } from '../src/scripts/components/connection-area/CardAnimationManager.ts';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.ts';
import { CardPositionManager } from '../src/scripts/shared/CardPositionManager.ts';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager.ts';

describe('Connection Line Matching - Direct Testing', () => {
  let animationManager: CardAnimationManager;
  let relationshipManager: CardRelationshipManager;
  let positionManager: CardPositionManager;
  let connectionManager: ConnectionManager;
  
  let loginPageCard: HTMLElement;
  let authServerCard: HTMLElement;
  let paymentServerCard: HTMLElement;

  beforeEach(() => {
    // Clear document
    document.body.innerHTML = '';
    
    // Create minimal DOM structure
    const container = document.createElement('div');
    container.id = 'diagram-container';
    container.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800, x: 0, y: 0, toJSON: () => ({})
    }));
    document.body.appendChild(container);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'connection-svg';
    document.body.appendChild(svg);

    // Create test cards
    loginPageCard = document.createElement('div');
    loginPageCard.id = 'login-page';
    loginPageCard.className = 'page-card';
    loginPageCard.dataset.apis = JSON.stringify([
      'auth-server:POST /auth/login',
      'auth-server:GET /auth/validate',
      'payment-server:GET /payment/status'
    ]);
    loginPageCard.getBoundingClientRect = vi.fn(() => ({
      left: 100, top: 100, width: 200, height: 150, right: 300, bottom: 250, x: 100, y: 100, toJSON: () => ({})
    }));

    authServerCard = document.createElement('div');
    authServerCard.id = 'auth-server';
    authServerCard.className = 'server-card';
    authServerCard.dataset.server = 'auth-server';
    authServerCard.getBoundingClientRect = vi.fn(() => ({
      left: 400, top: 100, width: 200, height: 150, right: 600, bottom: 250, x: 400, y: 100, toJSON: () => ({})
    }));

    paymentServerCard = document.createElement('div');
    paymentServerCard.id = 'payment-server';
    paymentServerCard.className = 'server-card';
    paymentServerCard.dataset.server = 'payment-server';
    paymentServerCard.getBoundingClientRect = vi.fn(() => ({
      left: 700, top: 100, width: 200, height: 150, right: 900, bottom: 250, x: 700, y: 100, toJSON: () => ({})
    }));

    // Add API elements
    const createApiElement = (fullApi: string, text: string) => {
      const el = document.createElement('div');
      el.className = 'api-item';
      el.dataset.fullApi = fullApi;
      el.dataset.apiText = text;
      el.textContent = text;
      el.getBoundingClientRect = vi.fn(() => ({
        left: 110, top: 120, width: 180, height: 30, right: 290, bottom: 150, x: 110, y: 120, toJSON: () => ({})
      }));
      return el;
    };

    // Add API elements to login page
    loginPageCard.appendChild(createApiElement('auth-server:POST /auth/login', 'POST /auth/login'));
    loginPageCard.appendChild(createApiElement('auth-server:GET /auth/validate', 'GET /auth/validate'));
    loginPageCard.appendChild(createApiElement('payment-server:GET /payment/status', 'GET /payment/status'));

    // Add API elements to auth server
    authServerCard.appendChild(createApiElement('', 'POST /auth/login'));
    authServerCard.appendChild(createApiElement('', 'GET /auth/validate'));

    // Add API element to payment server
    paymentServerCard.appendChild(createApiElement('', 'GET /payment/status'));

    container.appendChild(loginPageCard);
    container.appendChild(authServerCard);
    container.appendChild(paymentServerCard);

    // Mock DOM queries BEFORE creating managers
    document.querySelectorAll = vi.fn((selector) => {
      if (selector === '.page-card, .server-card, .backend-card') {
        return [loginPageCard, authServerCard, paymentServerCard] as any;
      }
      if (selector === '.page-card, .server-card') {
        return [loginPageCard, authServerCard, paymentServerCard] as any;
      }
      if (selector === '.page-card') {
        return [loginPageCard] as any;
      }
      if (selector === '.server-card') {
        return [authServerCard, paymentServerCard] as any;
      }
      if (selector === '.backend-card') {
        return [] as any;
      }
      return [] as any;
    });

    document.querySelector = vi.fn((selector) => {
      if (selector === '#diagram-container') return container;
      if (selector === '#connection-svg') return svg;
      if (selector === '[data-server="auth-server"]') return authServerCard;
      if (selector === '[data-server="payment-server"]') return paymentServerCard;
      return null;
    });

    document.getElementById = vi.fn((id: string): HTMLElement | null => {
      if (id === 'diagram-container') return container;
      if (id === 'connection-svg') return svg as any;
      return null;
    });

    // Initialize managers AFTER setting up mocks
    positionManager = new CardPositionManager();
    connectionManager = new ConnectionManager();
    relationshipManager = new CardRelationshipManager();
    animationManager = new CardAnimationManager(positionManager, connectionManager);

    positionManager.initialize();
    connectionManager.initialize();
    relationshipManager.initialize();
    animationManager.initialize();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  test('should find correct related cards for login page', () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    // Should find 2 related servers (auth-server and payment-server)
    expect(relatedElements.servers).toHaveLength(2);
    expect(relatedElements.servers).toContain(authServerCard);
    expect(relatedElements.servers).toContain(paymentServerCard);
    
    // Should find 3 related API items (the server APIs that match)
    expect(relatedElements.apiItems).toHaveLength(3);
    
    // Should not find any related pages (no automatic relationships)
    expect(relatedElements.pages).toHaveLength(0);
  });

  test('should find correct API elements for matching', () => {
    const pageApis = JSON.parse(loginPageCard.dataset.apis!);
    
    pageApis.forEach(api => {
      const [serverId, apiPath] = api.split(':');
      
      // Should find page API element
      const pageApiElement = loginPageCard.querySelector(`[data-full-api="${api}"]`);
      expect(pageApiElement).toBeTruthy();
      
      // Should find matching server
      const serverCard = document.querySelector(`[data-server="${serverId}"]`);
      expect(serverCard).toBeTruthy();
      
      if (serverCard) {
        // Should find matching server API element
        const serverApiElements = serverCard.querySelectorAll('.api-item');
        let foundMatch = false;
        serverApiElements.forEach(element => {
          const serverApiText = element.textContent?.trim();
          if (serverApiText === apiPath.trim()) {
            foundMatch = true;
          }
        });
        expect(foundMatch).toBe(true);
      }
    });
  });

  test('should properly identify API pairs for connections', () => {
    const pageApis = JSON.parse(loginPageCard.dataset.apis!);
    const expectedPairs = [
      { pageApi: 'auth-server:POST /auth/login', serverApi: 'POST /auth/login', server: 'auth-server' },
      { pageApi: 'auth-server:GET /auth/validate', serverApi: 'GET /auth/validate', server: 'auth-server' },
      { pageApi: 'payment-server:GET /payment/status', serverApi: 'GET /payment/status', server: 'payment-server' }
    ];

    expectedPairs.forEach(pair => {
      // Find page API element
      const pageApiElement = loginPageCard.querySelector(`[data-full-api="${pair.pageApi}"]`);
      expect(pageApiElement).toBeTruthy();
      expect(pageApiElement?.textContent?.trim()).toBe(pair.serverApi);
      
      // Find server card
      const serverCard = document.querySelector(`[data-server="${pair.server}"]`);
      expect(serverCard).toBeTruthy();
      
      // Find matching server API element
      const serverApiElements = serverCard?.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
      let matchingServerApi: HTMLElement | null = null;
      
      serverApiElements?.forEach(element => {
        if (element.textContent?.trim() === pair.serverApi) {
          matchingServerApi = element;
        }
      });
      
      expect(matchingServerApi).toBeTruthy();
      expect(matchingServerApi?.textContent?.trim()).toBe(pair.serverApi);
    });
  });

  test('should handle server hover correctly', () => {
    const relatedElements = relationshipManager.findRelatedCards(authServerCard);
    
    // Should find the login page as related (it uses auth-server APIs)
    expect(relatedElements.pages).toHaveLength(1);
    expect(relatedElements.pages).toContain(loginPageCard);
    
    // Should find 2 related API items (auth APIs from login page)
    expect(relatedElements.apiItems).toHaveLength(2);
    
    // Should not find other servers as related
    expect(relatedElements.servers).toHaveLength(0);
  });

  test('should extract HTTP methods correctly', () => {
    const pageApis = JSON.parse(loginPageCard.dataset.apis!);
    
    pageApis.forEach(api => {
      const [, apiPath] = api.split(':');
      const method = apiPath.trim().split(' ')[0];
      
      if (api.includes('/auth/login') || api.includes('/auth/forgot-password')) {
        expect(method).toBe('POST');
      } else if (api.includes('/auth/validate') || api.includes('/payment/status')) {
        expect(method).toBe('GET');
      }
    });
  });

  test('should distinguish between different server APIs', () => {
    // Auth server should have auth-related APIs
    const authApis = authServerCard.querySelectorAll('.api-item');
    const authApiTexts = Array.from(authApis).map(el => el.textContent?.trim());
    expect(authApiTexts).toContain('POST /auth/login');
    expect(authApiTexts).toContain('GET /auth/validate');
    expect(authApiTexts).not.toContain('GET /payment/status');
    
    // Payment server should have payment-related APIs
    const paymentApis = paymentServerCard.querySelectorAll('.api-item');
    const paymentApiTexts = Array.from(paymentApis).map(el => el.textContent?.trim());
    expect(paymentApiTexts).toContain('GET /payment/status');
    expect(paymentApiTexts).not.toContain('POST /auth/login');
    expect(paymentApiTexts).not.toContain('GET /auth/validate');
  });

  test('should handle missing API elements gracefully', () => {
    // Create a page with non-existent API
    const testPage = document.createElement('div');
    testPage.className = 'page-card';
    testPage.dataset.apis = JSON.stringify(['nonexistent-server:GET /missing']);
    
    const relatedElements = relationshipManager.findRelatedCards(testPage);
    
    // Should find no related elements
    expect(relatedElements.pages).toHaveLength(0);
    expect(relatedElements.servers).toHaveLength(0);
    expect(relatedElements.apiItems).toHaveLength(0);
  });
});