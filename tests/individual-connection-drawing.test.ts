/**
 * Test individual connection drawing functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { HoverEventManager } from '../src/scripts/components/connection-area/HoverEventManager.js';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.js';
import { CardAnimationManager } from '../src/scripts/components/connection-area/CardAnimationManager.js';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager.js';
import { CardPositionManager } from '../src/scripts/shared/CardPositionManager.js';
import { ConnectionType } from '../src/types/index.js';
import type { ConnectionPair } from '../src/types/index.js';

describe('Individual Connection Drawing Tests', () => {
    let dom: JSDOM;
    let hoverEventManager: HoverEventManager;
    let relationshipManager: CardRelationshipManager;
    let connectionManager: ConnectionManager;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <svg id="connection-svg"></svg>
                <div id="diagram-container">
                    <div class="page-card" data-apis='["auth-server:POST /auth/login"]'>
                        <div class="api-item" data-full-api="auth-server:POST /auth/login">POST /auth/login</div>
                    </div>
                    
                    <div class="server-card" data-server="auth-server" data-backend="mysql-db">
                        <div class="api-item" data-api-text="POST /auth/login">POST /auth/login</div>
                    </div>
                    
                    <div class="backend-card" data-backend="mysql-db">MySQL Database</div>
                </div>
            </body>
            </html>
        `);
        
        global.document = dom.window.document;
        global.window = dom.window as any;
        global.SVGElement = dom.window.SVGElement;
        
        relationshipManager = new CardRelationshipManager();
        connectionManager = new ConnectionManager();
        const animationManager = new CardAnimationManager(
            new CardPositionManager(),
            connectionManager
        );
        
        hoverEventManager = new HoverEventManager(
            relationshipManager,
            animationManager,
            connectionManager
        );
        
        relationshipManager.initialize();
        connectionManager.initialize();
        animationManager.initialize();
        hoverEventManager.initialize();
    });

    it('should draw individual connections one at a time', () => {
        const pageApiElement = document.querySelector('.api-item[data-full-api]') as HTMLElement;
        const serverApiElement = document.querySelector('.api-item[data-api-text]') as HTMLElement;
        const serverCard = document.querySelector('.server-card') as HTMLElement;
        const backendCard = document.querySelector('.backend-card') as HTMLElement;

        // Create mock connection pairs
        const pageToServerConnection: ConnectionPair = {
            from: pageApiElement,
            to: serverApiElement,
            type: ConnectionType.PAGE_TO_SERVER,
            method: 'POST',
            api: 'auth-server:POST /auth/login'
        };

        const serverToBackendConnection: ConnectionPair = {
            from: serverCard,
            to: backendCard,
            type: ConnectionType.SERVER_TO_BACKEND
        };

        // Spy on createConnectionLine to verify it's called
        const createSpy = vi.spyOn(connectionManager, 'createConnectionLine').mockReturnValue(
            document.createElementNS('http://www.w3.org/2000/svg', 'line') as unknown as SVGElement
        );

        // Draw connections individually
        console.log('Drawing page-to-server connection...');
        hoverEventManager.drawConnection(pageToServerConnection);

        console.log('Drawing server-to-backend connection...');
        hoverEventManager.drawConnection(serverToBackendConnection);

        // Verify both connections were drawn
        expect(createSpy).toHaveBeenCalledTimes(2);
        
        // Verify the first connection (page-to-server)
        expect(createSpy).toHaveBeenNthCalledWith(1,
            pageApiElement,
            serverApiElement,
            expect.any(String), // Color for POST method
            'POST'
        );

        // Verify the second connection (server-to-backend)
        expect(createSpy).toHaveBeenNthCalledWith(2,
            serverCard,
            backendCard,
            '#8b5cf6', // Purple for DB connections
            'DB'
        );

        // Verify API elements are highlighted for page-to-server connections
        expect(pageApiElement.classList.contains('highlighted')).toBe(true);
        expect(serverApiElement.classList.contains('highlighted')).toBe(true);
    });

    it('should allow custom connection drawing sequences', () => {
        const pageCard = document.querySelector('.page-card') as HTMLElement;
        const relatedElements = relationshipManager.findRelatedCards(pageCard);
        const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

        // Create a custom drawing sequence (e.g., draw backend connections first)
        const backendConnections = connectionPairs.filter(p => p.type === ConnectionType.SERVER_TO_BACKEND);
        const apiConnections = connectionPairs.filter(p => p.type === ConnectionType.PAGE_TO_SERVER);

        console.log('Drawing backend connections first...');
        backendConnections.forEach((pair, index) => {
            console.log(`  Drawing backend connection ${index + 1}/${backendConnections.length}`);
            hoverEventManager.drawConnection(pair);
        });

        console.log('Drawing API connections second...');
        apiConnections.forEach((pair, index) => {
            console.log(`  Drawing API connection ${index + 1}/${apiConnections.length}`);
            hoverEventManager.drawConnection(pair);
        });

        // Both types should be drawn
        expect(backendConnections.length + apiConnections.length).toBeGreaterThan(0);
    });

    it('should support selective connection drawing', () => {
        const pageCard = document.querySelector('.page-card') as HTMLElement;
        const relatedElements = relationshipManager.findRelatedCards(pageCard);
        const connectionPairs = relationshipManager.getUniqueRelationPairs(pageCard, relatedElements);

        // Only draw POST method connections
        const postConnections = connectionPairs.filter(p => p.method === 'POST');
        
        console.log(`Drawing only POST connections (${postConnections.length} of ${connectionPairs.length} total)`);
        postConnections.forEach(pair => {
            hoverEventManager.drawConnection(pair);
        });

        // Verify we filtered correctly
        expect(postConnections.length).toBeGreaterThan(0);
        expect(postConnections.every(p => p.method === 'POST')).toBe(true);
    });

    it('should handle connection drawing with different styles', () => {
        const pageApiElement = document.querySelector('.api-item[data-full-api]') as HTMLElement;
        const serverApiElement = document.querySelector('.api-item[data-api-text]') as HTMLElement;

        // Create a connection pair
        const connection: ConnectionPair = {
            from: pageApiElement,
            to: serverApiElement,
            type: ConnectionType.PAGE_TO_SERVER,
            method: 'GET',
            api: 'auth-server:GET /auth/verify'
        };

        // Mock the SVG line element
        const mockLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vi.spyOn(connectionManager, 'createConnectionLine').mockReturnValue(mockLine as unknown as SVGElement);

        // Draw the connection
        hoverEventManager.drawConnection(connection);

        // Verify the line has correct attributes
        expect(mockLine.getAttribute('stroke-width')).toBe('4');
        expect(mockLine.getAttribute('opacity')).toBe('0.9');
        expect(mockLine.classList.contains('highlighted')).toBe(true);
    });
});