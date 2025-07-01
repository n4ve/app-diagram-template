/**
 * Unit Tests for ConnectionType Enum
 * Tests the enum-based connection type system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.js';
import { ConnectionType } from '../src/types/index.js';
import type { ConnectionPair } from '../src/types/index.js';

describe('ConnectionType Enum Tests', () => {
    let dom: JSDOM;
    let relationshipManager: CardRelationshipManager;

    beforeEach(() => {
        // Create a minimal DOM for testing
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
                    
                    <!-- Server Cards -->
                    <div class="server-card" data-server="auth-server" data-backends='["mysql-db"]'>
                        <div class="api-item" data-api-text="POST /auth/login">POST /auth/login</div>
                    </div>
                    
                    <div class="server-card" data-server="payment-server" data-backends='["mysql-db"]'>
                        <div class="api-item" data-api-text="GET /payment/status">GET /payment/status</div>
                    </div>
                    
                    <!-- Backend Cards -->
                    <div class="backend-card" data-backend="mysql-db">MySQL Database</div>
                </div>
            </body>
            </html>
        `);
        
        global.document = dom.window.document;
        global.window = dom.window as any;
        
        relationshipManager = new CardRelationshipManager();
        relationshipManager.initialize();
    });

    describe('ConnectionType Enum Values', () => {
        it('should have correct enum values', () => {
            expect(ConnectionType.PAGE_TO_SERVER).toBe('page-to-server');
            expect(ConnectionType.GROUP_TO_SERVER).toBe('group-to-server');
            expect(ConnectionType.SERVER_TO_BACKEND).toBe('server-to-backend');
        });

        it('should be accessible as enum members', () => {
            expect(Object.values(ConnectionType)).toEqual([
                'page-to-server',
                'group-to-server',
                'server-to-backend'
            ]);
        });
    });

    describe('getUniqueRelationPairs with Enum Types', () => {
        it('should return PAGE_TO_SERVER type for page-server connections', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            const pageToServerPairs = connectionPairs.filter(pair => pair.type === ConnectionType.PAGE_TO_SERVER);
            expect(pageToServerPairs.length).toBeGreaterThan(0);
            
            pageToServerPairs.forEach(pair => {
                expect(pair.type).toBe(ConnectionType.PAGE_TO_SERVER);
                expect(pair.method).toBeDefined();
                expect(pair.api).toBeDefined();
            });
        });

        it('should return SERVER_TO_BACKEND type for server-backend connections', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            const serverToBackendPairs = connectionPairs.filter(pair => pair.type === ConnectionType.SERVER_TO_BACKEND);
            expect(serverToBackendPairs.length).toBeGreaterThan(0);
            
            serverToBackendPairs.forEach(pair => {
                expect(pair.type).toBe(ConnectionType.SERVER_TO_BACKEND);
                expect(pair.method).toBeUndefined(); // No method for DB connections
                expect(pair.api).toBeUndefined(); // No specific API for DB connections
            });
        });

        it('should return both connection types when hovering page card', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            const types = connectionPairs.map(pair => pair.type);
            expect(types).toContain(ConnectionType.PAGE_TO_SERVER);
            expect(types).toContain(ConnectionType.SERVER_TO_BACKEND);
        });

        it('should ensure all connection pairs have valid enum types', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            connectionPairs.forEach(pair => {
                expect(Object.values(ConnectionType)).toContain(pair.type);
            });
        });
    });

    describe('Connection Type Specificity', () => {
        it('should correctly assign enum types to connection pairs', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            // All pairs should have valid enum types
            connectionPairs.forEach(pair => {
                expect(Object.values(ConnectionType)).toContain(pair.type);
            });

            // Should have both types of connections
            const types = connectionPairs.map(pair => pair.type);
            expect(types).toContain(ConnectionType.PAGE_TO_SERVER);
            expect(types).toContain(ConnectionType.SERVER_TO_BACKEND);
        });

        it('should provide correct metadata for each connection type', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            const pageToServerPairs = connectionPairs.filter(pair => pair.type === ConnectionType.PAGE_TO_SERVER);
            const serverToBackendPairs = connectionPairs.filter(pair => pair.type === ConnectionType.SERVER_TO_BACKEND);

            // PAGE_TO_SERVER should have method and api data
            pageToServerPairs.forEach(pair => {
                expect(pair.method).toBeDefined();
                expect(pair.api).toBeDefined();
                expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'WEBSOCKET']).toContain(pair.method);
            });

            // SERVER_TO_BACKEND should not have method/api data (they're DB connections)
            serverToBackendPairs.forEach(pair => {
                expect(pair.method).toBeUndefined();
                expect(pair.api).toBeUndefined();
            });
        });
    });

    describe('Type Safety', () => {
        it('should maintain type safety with TypeScript', () => {
            // This test ensures that the enum is properly typed
            const testType: ConnectionType = ConnectionType.PAGE_TO_SERVER;
            expect(testType).toBe('page-to-server');

            const testPair: ConnectionPair = {
                from: document.createElement('div'),
                to: document.createElement('div'),
                type: ConnectionType.SERVER_TO_BACKEND
            };
            expect(testPair.type).toBe(ConnectionType.SERVER_TO_BACKEND);
        });

        it('should allow enum comparison and switching', () => {
            const pageCard = document.querySelector('.page-card') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(pageCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

            connectionPairs.forEach(pair => {
                let expectedBehavior: string;
                
                switch (pair.type) {
                    case ConnectionType.PAGE_TO_SERVER:
                        expectedBehavior = 'api-connection';
                        expect(pair.method).toBeDefined();
                        break;
                    case ConnectionType.SERVER_TO_BACKEND:
                        expectedBehavior = 'database-connection';
                        expect(pair.method).toBeUndefined();
                        break;
                    default:
                        // TypeScript should catch this at compile time
                        expectedBehavior = 'unknown';
                        break;
                }
                
                expect(expectedBehavior).toMatch(/^(api-connection|database-connection)$/);
            });
        });
    });
});