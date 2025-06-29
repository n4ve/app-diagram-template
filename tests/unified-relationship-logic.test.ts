/**
 * Unit Tests for Unified Relationship Logic
 * Tests the bidirectional relationship system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.js';

describe('Unified Relationship Logic Tests', () => {
    let dom: JSDOM;
    let relationshipManager: CardRelationshipManager;

    beforeEach(() => {
        // Create a comprehensive DOM for testing bidirectional relationships
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="diagram-container">
                    <!-- Page Cards -->
                    <div class="page-card" data-apis='["auth-server:POST /auth/login", "payment-server:GET /payment/status"]'>
                        <div class="api-item" data-full-api="auth-server:POST /auth/login">POST /auth/login</div>
                        <div class="api-item" data-full-api="payment-server:GET /payment/status">GET /payment/status</div>
                    </div>
                    
                    <div class="page-card" data-apis='["auth-server:GET /auth/verify"]'>
                        <div class="api-item" data-full-api="auth-server:GET /auth/verify">GET /auth/verify</div>
                    </div>
                    
                    <!-- Server Cards -->
                    <div class="server-card" data-server="auth-server" data-backend="mysql-db">
                        <div class="api-item" data-api-text="POST /auth/login">POST /auth/login</div>
                        <div class="api-item" data-api-text="GET /auth/verify">GET /auth/verify</div>
                    </div>
                    
                    <div class="server-card" data-server="payment-server" data-backend="mysql-db">
                        <div class="api-item" data-api-text="GET /payment/status">GET /payment/status</div>
                    </div>
                    
                    <div class="server-card" data-server="analytics-server" data-backend="redis-db">
                        <div class="api-item" data-api-text="POST /analytics/track">POST /analytics/track</div>
                    </div>
                    
                    <!-- Backend Cards -->
                    <div class="backend-card" data-backend="mysql-db">MySQL Database</div>
                    <div class="backend-card" data-backend="redis-db">Redis Database</div>
                </div>
            </body>
            </html>
        `, {
            url: 'http://localhost',
            pretendToBeVisual: true,
            resources: 'usable'
        });
        
        global.document = dom.window.document;
        global.window = dom.window as any;
        
        // Mock localStorage to avoid JSDOM security errors
        if (!global.localStorage) {
            Object.defineProperty(global, 'localStorage', {
                value: {
                    getItem: vi.fn(() => null),
                    setItem: vi.fn(),
                    removeItem: vi.fn(),
                    clear: vi.fn(),
                    length: 0,
                    key: vi.fn(() => null)
                },
                writable: true
            });
        }
        
        relationshipManager = new CardRelationshipManager();
        relationshipManager.initialize();
    });

    describe('Bidirectional Page ↔ Server ↔ Backend Relationships', () => {
        it('should find same relationships when hovering page vs related server', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const authServerCard = document.querySelector('[data-server="auth-server"]') as HTMLElement;

            // Find relationships from page perspective
            const pageRelations = relationshipManager.findRelatedCards(pageCard);
            
            // Find relationships from server perspective
            const serverRelations = relationshipManager.findRelatedCards(authServerCard);

            // Both should identify the auth-server as related
            const pageRelatedServerIds = pageRelations.servers.map(s => s.dataset.server);
            expect(pageRelatedServerIds).toContain('auth-server');

            // Both should identify the same page as related
            const serverRelatedPages = serverRelations.pages;
            expect(serverRelatedPages).toContain(pageCard);

            // Both should identify the same backend
            const pageRelatedBackends = pageRelations.backends.map(b => b.dataset.backend);
            const serverRelatedBackends = serverRelations.backends.map(b => b.dataset.backend);
            expect(pageRelatedBackends).toContain('mysql-db');
            expect(serverRelatedBackends).toContain('mysql-db');
        });

        it('should find same relationships when hovering server vs related backend', () => {
            const authServerCard = document.querySelector('.server-card[data-server="auth-server"]') as HTMLElement;
            const mysqlBackendCard = document.querySelector('.backend-card[data-backend="mysql-db"]') as HTMLElement;

            // Find relationships from server perspective
            const serverRelations = relationshipManager.findRelatedCards(authServerCard);
            
            // Find relationships from backend perspective
            const backendRelations = relationshipManager.findRelatedCards(mysqlBackendCard);

            // Server should identify mysql-db as related backend
            const serverRelatedBackends = serverRelations.backends.map(b => b.dataset.backend);
            expect(serverRelatedBackends).toContain('mysql-db');

            // Backend should identify auth-server as related server
            const backendRelatedServers = backendRelations.servers.map(s => s.dataset.server);
            expect(backendRelatedServers).toContain('auth-server');
        });

        it('should maintain consistency across three-way relationships (page-server-backend)', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const authServerCard = document.querySelector('.server-card[data-server="auth-server"]') as HTMLElement;
            const mysqlBackendCard = document.querySelector('.backend-card[data-backend="mysql-db"]') as HTMLElement;

            // Get relationships from all three perspectives
            const pageRelations = relationshipManager.findRelatedCards(pageCard);
            const serverRelations = relationshipManager.findRelatedCards(authServerCard);
            const backendRelations = relationshipManager.findRelatedCards(mysqlBackendCard);

            // Verify the chain: page -> server -> backend
            expect(pageRelations.servers.map(s => s.dataset.server)).toContain('auth-server');
            expect(pageRelations.backends.map(b => b.dataset.backend)).toContain('mysql-db');

            // Verify the reverse chain: backend -> server -> page
            expect(backendRelations.servers.map(s => s.dataset.server)).toContain('auth-server');
            expect(backendRelations.pages).toContain(pageCard);

            // Server should connect to both directions
            expect(serverRelations.pages).toContain(pageCard);
            expect(serverRelations.backends.map(b => b.dataset.backend)).toContain('mysql-db');
        });
    });

    describe('Isolated Relationship Testing', () => {
        it('should not create false relationships between unconnected components', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement; // Uses auth-server and payment-server
            const analyticsServerCard = document.querySelector('.server-card[data-server="analytics-server"]') as HTMLElement;
            const redisBackendCard = document.querySelector('.backend-card[data-backend="redis-db"]') as HTMLElement;

            // Page relationships should not include analytics-server or redis-db
            const pageRelations = relationshipManager.findRelatedCards(pageCard);
            const pageRelatedServerIds = pageRelations.servers.map(s => s.dataset.server);
            const pageRelatedBackendIds = pageRelations.backends.map(b => b.dataset.backend);
            
            expect(pageRelatedServerIds).not.toContain('analytics-server');
            expect(pageRelatedBackendIds).not.toContain('redis-db');

            // Analytics server relationships should not include the test page
            const analyticsRelations = relationshipManager.findRelatedCards(analyticsServerCard);
            expect(analyticsRelations.pages).not.toContain(pageCard);

            // Redis backend should not be related to auth/payment servers
            const redisRelations = relationshipManager.findRelatedCards(redisBackendCard);
            const redisRelatedServerIds = redisRelations.servers.map(s => s.dataset.server);
            expect(redisRelatedServerIds).not.toContain('auth-server');
            expect(redisRelatedServerIds).not.toContain('payment-server');
        });

        it('should handle multiple servers connecting to same backend', () => {
            const mysqlBackendCard = document.querySelector('.backend-card[data-backend="mysql-db"]') as HTMLElement;
            const backendRelations = relationshipManager.findRelatedCards(mysqlBackendCard);

            // MySQL should be related to both auth-server and payment-server
            const relatedServerIds = backendRelations.servers.map(s => s.dataset.server);
            expect(relatedServerIds).toContain('auth-server');
            expect(relatedServerIds).toContain('payment-server');
            expect(relatedServerIds).not.toContain('analytics-server'); // analytics uses redis
        });
    });

    describe('API Item Relationship Consistency', () => {
        it('should find matching API items from both directions', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const authServerCard = document.querySelector('.server-card[data-server="auth-server"]') as HTMLElement;

            const pageRelations = relationshipManager.findRelatedCards(pageCard);
            const serverRelations = relationshipManager.findRelatedCards(authServerCard);

            // Both should identify related API items
            expect(pageRelations.apiItems.length).toBeGreaterThan(0);
            expect(serverRelations.apiItems.length).toBeGreaterThan(0);

            // Should have matching API items (same endpoints)
            const pageApiTexts = pageRelations.apiItems.map(item => 
                item.textContent?.trim() || item.dataset.fullApi
            );
            const serverApiTexts = serverRelations.apiItems.map(item => 
                item.textContent?.trim() || item.dataset.apiText
            );

            // Should have overlapping API endpoints
            const hasMatchingApis = pageApiTexts.some(pageApi => 
                serverApiTexts.some(serverApi => 
                    pageApi?.includes('POST /auth/login') || serverApi?.includes('POST /auth/login')
                )
            );
            expect(hasMatchingApis).toBe(true);
        });
    });

    describe('Unified Logic Verification', () => {
        it('should use same helper methods for bidirectional relationships', () => {
            // This test verifies that the unified logic produces consistent results
            const allPages = Array.from(document.querySelectorAll('.page-card')) as HTMLElement[];
            const allServers = Array.from(document.querySelectorAll('.server-card')) as HTMLElement[];
            const allBackends = Array.from(document.querySelectorAll('.backend-card')) as HTMLElement[];

            // Test all combinations and verify bidirectional consistency
            allPages.forEach(page => {
                const pageRelations = relationshipManager.findRelatedCards(page);
                
                pageRelations.servers.forEach(server => {
                    const serverRelations = relationshipManager.findRelatedCards(server);
                    // Server should list this page as related
                    expect(serverRelations.pages).toContain(page);
                });

                pageRelations.backends.forEach(backend => {
                    const backendRelations = relationshipManager.findRelatedCards(backend);
                    // Backend should list this page as related
                    expect(backendRelations.pages).toContain(page);
                });
            });

            allServers.forEach(server => {
                const serverRelations = relationshipManager.findRelatedCards(server);
                
                serverRelations.backends.forEach(backend => {
                    const backendRelations = relationshipManager.findRelatedCards(backend);
                    // Backend should list this server as related
                    expect(backendRelations.servers).toContain(server);
                });
            });
        });
    });
});