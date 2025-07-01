/**
 * Connection Correctness Tests
 * Ensures all connections are created correctly with proper flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager';

describe('Connection Correctness Tests', () => {
    let connectionManager: ConnectionManager;
    let relationshipManager: CardRelationshipManager;
    let mockSVG: SVGElement;

    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <div id="diagram-container">
                <svg id="connection-svg"></svg>
                
                <!-- Login Page -->
                <div class="page-card" data-page="login" data-apis='["auth-server:POST /auth/login", "payment-server:GET /payment/status"]'>
                    <div class="api-item" data-full-api="auth-server:POST /auth/login" data-api-text="POST /auth/login">POST /auth/login</div>
                    <div class="api-item" data-full-api="payment-server:GET /payment/status" data-api-text="GET /payment/status">GET /payment/status</div>
                </div>
                
                <!-- Orders Page -->
                <div class="page-card" data-page="orders" data-apis='["order-server:GET /orders/list", "payment-server:GET /payment/status"]'>
                    <div class="api-item" data-full-api="order-server:GET /orders/list" data-api-text="GET /orders/list">GET /orders/list</div>
                    <div class="api-item" data-full-api="payment-server:GET /payment/status" data-api-text="GET /payment/status">GET /payment/status</div>
                </div>
                
                <!-- Auth Server -->
                <div class="server-card" data-server="auth-server" data-backends='["mysql-db"]'>
                    <div class="api-item" data-api-text="POST /auth/login">POST /auth/login</div>
                </div>
                
                <!-- Order Server -->
                <div class="server-card" data-server="order-server" data-backends='["mysql-db"]'>
                    <div class="api-item" data-api-text="GET /orders/list">GET /orders/list</div>
                </div>
                
                <!-- Payment Server -->
                <div class="server-card" data-server="payment-server" data-backends='["mysql-db"]'>
                    <div class="api-item" data-api-text="GET /payment/status">GET /payment/status</div>
                </div>
                
                <!-- MySQL Backend -->
                <div class="backend-card" data-backend="mysql-db"></div>
            </div>
        `;

        mockSVG = document.getElementById('connection-svg') as SVGElement;
        connectionManager = new ConnectionManager();
        relationshipManager = new CardRelationshipManager();
        
        connectionManager.initialize();
        relationshipManager.initialize();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    describe('Login Page Connections', () => {
        it('should create correct connections for login page', () => {
            const loginPage = document.querySelector('[data-page="login"]') as HTMLElement;
            
            // Find related elements
            const relatedElements = relationshipManager.findRelatedCards(loginPage);
            
            // Should find auth-server and payment-server
            expect(relatedElements.servers).toHaveLength(2);
            
            const serverIds = relatedElements.servers.map(s => s.dataset.server);
            expect(serverIds).toContain('auth-server');
            expect(serverIds).toContain('payment-server');
            
            // Should find mysql-db backend
            expect(relatedElements.backends).toHaveLength(1);
            expect(relatedElements.backends[0].dataset.backend).toBe('mysql-db');
        });

        it('should create API-to-API connections for login page', () => {
            const loginPageApi = document.querySelector('[data-full-api="auth-server:POST /auth/login"]') as HTMLElement;
            const authServerApi = document.querySelector('[data-server="auth-server"] [data-api-text="POST /auth/login"]') as HTMLElement;
            
            expect(loginPageApi).toBeTruthy();
            expect(authServerApi).toBeTruthy();
            
            const connection = connectionManager.createConnectionLine(loginPageApi, authServerApi, '#3b82f6', 'POST');
            expect(connection).not.toBeNull();
            expect(connection?.tagName).toBe('line');
        });

        it('should create server-to-backend connections', () => {
            const authServer = document.querySelector('[data-server="auth-server"]') as HTMLElement;
            const mysqlBackend = document.querySelector('[data-backend="mysql-db"]') as HTMLElement;
            
            expect(authServer).toBeTruthy();
            expect(mysqlBackend).toBeTruthy();
            
            const connection = connectionManager.createConnectionLine(authServer, mysqlBackend, '#8b5cf6', 'DB');
            expect(connection).not.toBeNull();
            expect(connection?.tagName).toBe('line');
        });
    });

    describe('Orders Page Connections', () => {
        it('should create correct connections for orders page', () => {
            const ordersPage = document.querySelector('[data-page="orders"]') as HTMLElement;
            
            // Find related elements
            const relatedElements = relationshipManager.findRelatedCards(ordersPage);
            
            // Should find order-server and payment-server
            expect(relatedElements.servers).toHaveLength(2);
            
            const serverIds = relatedElements.servers.map(s => s.dataset.server);
            expect(serverIds).toContain('order-server');
            expect(serverIds).toContain('payment-server');
            
            // Should NOT find auth-server
            expect(serverIds).not.toContain('auth-server');
            
            // Should find mysql-db backend
            expect(relatedElements.backends).toHaveLength(1);
            expect(relatedElements.backends[0].dataset.backend).toBe('mysql-db');
        });

        it('should connect orders page to order-server (not auth-server)', () => {
            const ordersPageApi = document.querySelector('[data-full-api="order-server:GET /orders/list"]') as HTMLElement;
            const orderServerApi = document.querySelector('[data-server="order-server"] [data-api-text="GET /orders/list"]') as HTMLElement;
            
            expect(ordersPageApi).toBeTruthy();
            expect(orderServerApi).toBeTruthy();
            
            const connection = connectionManager.createConnectionLine(ordersPageApi, orderServerApi, '#10b981', 'GET');
            expect(connection).not.toBeNull();
            
            // Should NOT connect to auth-server
            const authServerApi = document.querySelector('[data-server="auth-server"] [data-api-text="POST /auth/login"]') as HTMLElement;
            expect(authServerApi).toBeTruthy();
            
            // This should work (no blocking), but it would be wrong in the application logic
            const wrongConnection = connectionManager.createConnectionLine(ordersPageApi, authServerApi, '#10b981', 'GET');
            expect(wrongConnection).not.toBeNull(); // Connection Manager allows it, but relationship logic prevents it
        });
    });

    describe('Server-to-Backend Flow', () => {
        it('should ensure all servers connect to their correct backends', () => {
            const servers = [
                { card: document.querySelector('[data-server="auth-server"]') as HTMLElement, backend: 'mysql-db' },
                { card: document.querySelector('[data-server="order-server"]') as HTMLElement, backend: 'mysql-db' },
                { card: document.querySelector('[data-server="payment-server"]') as HTMLElement, backend: 'mysql-db' }
            ];

            servers.forEach(({ card, backend }) => {
                expect(card).toBeTruthy();
                expect(card.dataset.backends).toBeTruthy();
                const backends = JSON.parse(card.dataset.backends || '[]');
                expect(backends).toContain(backend);
                
                const backendCard = document.querySelector(`[data-backend="${backend}"]`) as HTMLElement;
                expect(backendCard).toBeTruthy();
                
                const connection = connectionManager.createConnectionLine(card, backendCard, '#8b5cf6', 'DB');
                expect(connection).not.toBeNull();
                expect(connection?.getAttribute('data-method')).toBe('DB');
            });
        });
    });

    describe('Connection Flow Integrity', () => {
        it('should maintain proper frontend → server → backend flow', () => {
            // Test complete flow for orders page
            const ordersPage = document.querySelector('[data-page="orders"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(ordersPage);
            
            // Verify flow: Orders → Order Server → MySQL
            const orderServerApi = document.querySelector('[data-full-api="order-server:GET /orders/list"]') as HTMLElement;
            const serverOrderApi = document.querySelector('[data-server="order-server"] [data-api-text="GET /orders/list"]') as HTMLElement;
            const orderServer = document.querySelector('[data-server="order-server"]') as HTMLElement;
            const mysqlBackend = document.querySelector('[data-backend="mysql-db"]') as HTMLElement;
            
            // Frontend → Server API connection
            const frontendConnection = connectionManager.createConnectionLine(orderServerApi, serverOrderApi, '#10b981', 'GET');
            expect(frontendConnection).not.toBeNull();
            
            // Server → Backend connection  
            const backendConnection = connectionManager.createConnectionLine(orderServer, mysqlBackend, '#8b5cf6', 'DB');
            expect(backendConnection).not.toBeNull();
            
            // Verify the connection attributes
            expect(frontendConnection?.getAttribute('data-method')).toBe('GET');
            expect(backendConnection?.getAttribute('data-method')).toBe('DB');
        });

        it('should ensure consistent color coding', () => {
            const orderServer = document.querySelector('[data-server="order-server"]') as HTMLElement;
            const mysqlBackend = document.querySelector('[data-backend="mysql-db"]') as HTMLElement;
            
            const connection = connectionManager.createConnectionLine(orderServer, mysqlBackend, '#8b5cf6', 'DB');
            expect(connection).not.toBeNull();
            
            // Should have purple color for backend connections
            expect(connection?.getAttribute('stroke')).toBe('#8b5cf6');
        });
    });

    describe('Relationship Detection Accuracy', () => {
        it('should accurately detect page-to-server relationships', () => {
            const loginPage = document.querySelector('[data-page="login"]') as HTMLElement;
            const ordersPage = document.querySelector('[data-page="orders"]') as HTMLElement;
            
            const loginRelations = relationshipManager.findRelatedCards(loginPage);
            const ordersRelations = relationshipManager.findRelatedCards(ordersPage);
            
            // Login should connect to auth-server and payment-server
            const loginServerIds = loginRelations.servers.map(s => s.dataset.server);
            expect(loginServerIds).toContain('auth-server');
            expect(loginServerIds).toContain('payment-server');
            expect(loginServerIds).not.toContain('order-server');
            
            // Orders should connect to order-server and payment-server
            const ordersServerIds = ordersRelations.servers.map(s => s.dataset.server);
            expect(ordersServerIds).toContain('order-server');
            expect(ordersServerIds).toContain('payment-server');
            expect(ordersServerIds).not.toContain('auth-server');
        });
    });
});

// Export test summary
export function getConnectionCorrectnessRules() {
    return {
        architecture: 'Frontend → Server → Backend',
        correctFlow: [
            'Page APIs connect to matching Server APIs',
            'Servers connect to their assigned backends',
            'Backend connections use purple color (#8b5cf6)',
            'API connections use method-specific colors'
        ],
        dataIntegrity: [
            'Orders page connects to order-server (not auth-server)',
            'Login page connects to auth-server',
            'All servers connect to correct backends',
            'No cross-contamination between unrelated components'
        ]
    };
}