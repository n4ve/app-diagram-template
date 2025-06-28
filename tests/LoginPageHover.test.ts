/**
 * Unit Tests for Login Page Hover Behavior
 * Tests the card repositioning and connection logic when hovering over login page
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CardAnimationManager } from '../src/scripts/components/connection-area/CardAnimationManager.ts';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.ts';
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
  return element;
};

const createMockApiElement = (fullApi: string, text: string) => {
  const element = document.createElement('div');
  element.className = 'api-item';
  element.dataset.fullApi = fullApi;
  element.dataset.apiText = text;
  element.textContent = text;
  return element;
};

describe('Login Page Hover Behavior', () => {
  let animationManager: CardAnimationManager;
  let relationshipManager: CardRelationshipManager;
  let positionManager: CardPositionManager;
  let connectionManager: ConnectionManager;
  
  let loginPageCard: HTMLElement;
  let dashboardPageCard: HTMLElement;
  let productsPageCard: HTMLElement;
  let ordersPageCard: HTMLElement;
  
  let authServerCard: HTMLElement;
  let paymentServerCard: HTMLElement;
  let userServerCard: HTMLElement;
  let productServerCard: HTMLElement;

  let mysqlBackendCard: HTMLElement;
  let redisBackendCard: HTMLElement;
  let elasticsearchBackendCard: HTMLElement;

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

    // Create page cards
    loginPageCard = createMockCard('login-page', 'page-card', {
      apis: JSON.stringify([
        'auth-server:POST /auth/login',
        'auth-server:GET /auth/validate', 
        'auth-server:POST /auth/forgot-password',
        'payment-server:GET /payment/status'
      ])
    });

    dashboardPageCard = createMockCard('dashboard-page', 'page-card', {
      apis: JSON.stringify([
        'user-server:GET /user/profile',
        'analytics-server:GET /analytics/summary',
        'notification-server:GET /notifications/recent'
      ])
    });

    productsPageCard = createMockCard('products-page', 'page-card', {
      apis: JSON.stringify([
        'product-server:GET /products/list',
        'product-server:POST /products/create'
      ])
    });

    ordersPageCard = createMockCard('orders-page', 'page-card', {
      apis: JSON.stringify([
        'order-server:GET /orders/list',
        'payment-server:GET /payment/status'
      ])
    });

    // Create server cards
    authServerCard = createMockCard('auth-server', 'server-card', { server: 'auth-server', backend: 'mysql-db' });
    paymentServerCard = createMockCard('payment-server', 'server-card', { server: 'payment-server', backend: 'mysql-db' });
    userServerCard = createMockCard('user-server', 'server-card', { server: 'user-server', backend: 'redis-cache' });
    productServerCard = createMockCard('product-server', 'server-card', { server: 'product-server', backend: 'elasticsearch' });

    // Create backend cards
    mysqlBackendCard = createMockCard('mysql-db', 'backend-card', { backend: 'mysql-db' });
    redisBackendCard = createMockCard('redis-cache', 'backend-card', { backend: 'redis-cache' });
    elasticsearchBackendCard = createMockCard('elasticsearch', 'backend-card', { backend: 'elasticsearch' });

    // Add API elements to login page
    const loginApiElements = [
      createMockApiElement('auth-server:POST /auth/login', 'POST /auth/login'),
      createMockApiElement('auth-server:GET /auth/validate', 'GET /auth/validate'),
      createMockApiElement('auth-server:POST /auth/forgot-password', 'POST /auth/forgot-password'),
      createMockApiElement('payment-server:GET /payment/status', 'GET /payment/status')
    ];
    loginApiElements.forEach(el => loginPageCard.appendChild(el));

    // Add API elements to auth server
    const authApiElements = [
      createMockApiElement('', 'POST /auth/login'),
      createMockApiElement('', 'GET /auth/validate'),
      createMockApiElement('', 'POST /auth/forgot-password')
    ];
    authApiElements.forEach(el => authServerCard.appendChild(el));

    // Add API elements to payment server
    const paymentApiElements = [
      createMockApiElement('', 'GET /payment/status')
    ];
    paymentApiElements.forEach(el => paymentServerCard.appendChild(el));

    // Add all cards to container
    [loginPageCard, dashboardPageCard, productsPageCard, ordersPageCard,
     authServerCard, paymentServerCard, userServerCard, productServerCard,
     mysqlBackendCard, redisBackendCard, elasticsearchBackendCard]
      .forEach(card => diagramContainer.appendChild(card));

    // Mock querySelector and querySelectorAll
    const allCards = [loginPageCard, dashboardPageCard, productsPageCard, ordersPageCard,
                     authServerCard, paymentServerCard, userServerCard, productServerCard,
                     mysqlBackendCard, redisBackendCard, elasticsearchBackendCard];
    
    document.querySelectorAll = vi.fn((selector: string) => {
      if (selector === '.page-card, .server-card, .backend-card') {
        return allCards as any;
      }
      if (selector === '.page-card') {
        return [loginPageCard, dashboardPageCard, productsPageCard, ordersPageCard] as any;
      }
      if (selector === '.server-card') {
        return [authServerCard, paymentServerCard, userServerCard, productServerCard] as any;
      }
      if (selector === '.backend-card') {
        return [mysqlBackendCard, redisBackendCard, elasticsearchBackendCard] as any;
      }
      return [] as any;
    });

    document.querySelector = vi.fn((selector: string) => {
      if (selector === '[data-server="auth-server"]') return authServerCard;
      if (selector === '[data-server="payment-server"]') return paymentServerCard;
      if (selector === '[data-server="user-server"]') return userServerCard;
      if (selector === '[data-server="product-server"]') return productServerCard;
      if (selector === '[data-backend="mysql-db"]') return mysqlBackendCard;
      if (selector === '[data-backend="redis-cache"]') return redisBackendCard;
      if (selector === '[data-backend="elasticsearch"]') return elasticsearchBackendCard;
      return null;
    });

    // Initialize managers
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

  test('should identify correct related cards for login page', () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    // Only direct API connections matter - no automatic page relationships
    expect(relatedElements.pages).toHaveLength(0); // No related pages
    
    // Only servers with direct API connections
    expect(relatedElements.servers).toContain(authServerCard);
    expect(relatedElements.servers).toContain(paymentServerCard);
    expect(relatedElements.servers).not.toContain(userServerCard);
    expect(relatedElements.servers).not.toContain(productServerCard);
    expect(relatedElements.servers).toHaveLength(2);
  });

  test('should move related cards together when hovering login page', async () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    await animationManager.repositionRelatedCards(loginPageCard, relatedElements);

    // Hovered card should scale up
    expect(loginPageCard.style.transform).toContain('scale(1.1)');
    expect(loginPageCard.classList.contains('active')).toBe(true);

    // Only directly connected servers should move and scale up
    expect(authServerCard.style.transform).toContain('translate');
    expect(authServerCard.style.transform).toContain('scale(1.05)');
    expect(authServerCard.classList.contains('highlighted')).toBe(true);

    expect(paymentServerCard.style.transform).toContain('translate');
    expect(paymentServerCard.classList.contains('highlighted')).toBe(true);

    // Orders page should be hidden (no direct relationship)
    expect(ordersPageCard.style.opacity).toBe('0.1');
    expect(ordersPageCard.classList.contains('dimmed')).toBe(true);
  });

  test('should hide unrelated cards when hovering login page', async () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    await animationManager.repositionRelatedCards(loginPageCard, relatedElements);

    // All non-directly connected cards should be heavily dimmed
    expect(dashboardPageCard.style.opacity).toBe('0.1');
    expect(dashboardPageCard.style.transform).toContain('scale(0.7)');
    expect(dashboardPageCard.classList.contains('dimmed')).toBe(true);

    expect(productsPageCard.style.opacity).toBe('0.1');
    expect(ordersPageCard.style.opacity).toBe('0.1'); // No direct API connection
    expect(userServerCard.style.opacity).toBe('0.1');
    expect(productServerCard.style.opacity).toBe('0.1');
  });

  test('should set correct active classes for login page hover', () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    relationshipManager.setActiveClasses(loginPageCard, relatedElements);

    // Hovered card should be active
    expect(loginPageCard.classList.contains('active')).toBe(true);

    // Only directly connected servers should be active
    expect(authServerCard.classList.contains('active')).toBe(true);
    expect(paymentServerCard.classList.contains('active')).toBe(true);

    // All other cards should not be active
    expect(ordersPageCard.classList.contains('active')).toBe(false);
    expect(dashboardPageCard.classList.contains('active')).toBe(false);
    expect(productsPageCard.classList.contains('active')).toBe(false);
    expect(userServerCard.classList.contains('active')).toBe(false);
    expect(productServerCard.classList.contains('active')).toBe(false);
  });

  test('should reset all cards to initial state', async () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    // First hover
    await animationManager.repositionRelatedCards(loginPageCard, relatedElements);
    relationshipManager.setActiveClasses(loginPageCard, relatedElements);

    // Then reset
    await animationManager.resetAllCards();
    relationshipManager.clearActiveClasses();

    // All cards should be reset
    [loginPageCard, dashboardPageCard, productsPageCard, ordersPageCard,
     authServerCard, paymentServerCard, userServerCard, productServerCard].forEach(card => {
      expect(card.style.opacity).toBe('1');
      expect(card.style.pointerEvents).toBe('auto');
      expect(card.style.transform).toBe('none');
      expect(card.classList.contains('active')).toBe(false);
      expect(card.classList.contains('highlighted')).toBe(false);
      expect(card.classList.contains('dimmed')).toBe(false);
    });
  });

  test('should create connections only between directly connected cards', () => {
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    
    // This would be called during the animation
    animationManager.repositionRelatedCards(loginPageCard, relatedElements);

    // Verify that only direct API connections are established
    expect(relatedElements.servers).toHaveLength(2); // auth-server, payment-server
    expect(relatedElements.pages).toHaveLength(0); // No automatic page relationships
    
    // Verify API items are correctly identified
    expect(relatedElements.apiItems.length).toBeGreaterThan(0);
  });

  test('should calculate correct API relationships for login page', () => {
    const pageApisData = loginPageCard.dataset.apis;
    expect(pageApisData).toBeDefined();
    
    const pageApis: string[] = JSON.parse(pageApisData!);
    expect(pageApis).toEqual([
      'auth-server:POST /auth/login',
      'auth-server:GET /auth/validate', 
      'auth-server:POST /auth/forgot-password',
      'payment-server:GET /payment/status'
    ]);

    // Verify server IDs extraction - only these servers should be directly related
    const serverIds = pageApis.map(api => api.split(':')[0]);
    expect(serverIds).toContain('auth-server');
    expect(serverIds).toContain('payment-server');
    expect(new Set(serverIds)).toEqual(new Set(['auth-server', 'payment-server']));
    
    // Verify relationship logic
    const relatedElements = relationshipManager.findRelatedCards(loginPageCard);
    expect(relatedElements.servers.length).toBe(2);
    expect(relatedElements.pages.length).toBe(0); // No automatic page relationships
  });
});