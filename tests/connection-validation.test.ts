/**
 * Connection Validation Tests
 * Tests that invalid connections are properly blocked
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager';

describe('Connection Validation Tests', () => {
    let connectionManager: ConnectionManager;
    let mockSVG: SVGElement;

    beforeEach(() => {
        // Create mock SVG element
        mockSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        mockSVG.id = 'connection-svg';
        document.body.appendChild(mockSVG);

        connectionManager = new ConnectionManager();
        connectionManager.initialize();

        // Mock console.warn to track blocked connections
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    describe('Valid Connections', () => {
        it('should allow page-api to server-api connections', () => {
            const pageApi = document.createElement('div');
            pageApi.className = 'api-item';
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';
            pageCard.appendChild(pageApi);

            const serverApi = document.createElement('div');
            serverApi.className = 'api-item';
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            serverCard.appendChild(serverApi);

            document.body.appendChild(pageCard);
            document.body.appendChild(serverCard);

            const result = connectionManager.createConnectionLine(pageApi, serverApi);
            expect(result).not.toBeNull();
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('should allow server to backend connections', () => {
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            
            const backendCard = document.createElement('div');
            backendCard.className = 'backend-card';

            document.body.appendChild(serverCard);
            document.body.appendChild(backendCard);

            const result = connectionManager.createConnectionLine(serverCard, backendCard);
            expect(result).not.toBeNull();
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('should allow page to server connections', () => {
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';
            
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';

            document.body.appendChild(pageCard);
            document.body.appendChild(serverCard);

            const result = connectionManager.createConnectionLine(pageCard, serverCard);
            expect(result).not.toBeNull();
            expect(console.warn).not.toHaveBeenCalled();
        });
    });

    describe('Invalid Connections - Same Type', () => {
        it('should block page to page connections', () => {
            const pageCard1 = document.createElement('div');
            pageCard1.className = 'page-card';
            
            const pageCard2 = document.createElement('div');
            pageCard2.className = 'page-card';

            document.body.appendChild(pageCard1);
            document.body.appendChild(pageCard2);

            const result = connectionManager.createConnectionLine(pageCard1, pageCard2);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: page → page')
            );
        });

        it('should block server to server connections', () => {
            const serverCard1 = document.createElement('div');
            serverCard1.className = 'server-card';
            
            const serverCard2 = document.createElement('div');
            serverCard2.className = 'server-card';

            document.body.appendChild(serverCard1);
            document.body.appendChild(serverCard2);

            const result = connectionManager.createConnectionLine(serverCard1, serverCard2);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: server → server')
            );
        });

        it('should block backend to backend connections', () => {
            const backendCard1 = document.createElement('div');
            backendCard1.className = 'backend-card';
            
            const backendCard2 = document.createElement('div');
            backendCard2.className = 'backend-card';

            document.body.appendChild(backendCard1);
            document.body.appendChild(backendCard2);

            const result = connectionManager.createConnectionLine(backendCard1, backendCard2);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: backend → backend')
            );
        });
    });

    describe('Invalid Connections - Backend Initiation', () => {
        it('should block backend to server connections', () => {
            const backendCard = document.createElement('div');
            backendCard.className = 'backend-card';
            
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';

            document.body.appendChild(backendCard);
            document.body.appendChild(serverCard);

            const result = connectionManager.createConnectionLine(backendCard, serverCard);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: backend → server')
            );
        });

        it('should block backend to page connections', () => {
            const backendCard = document.createElement('div');
            backendCard.className = 'backend-card';
            
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';

            document.body.appendChild(backendCard);
            document.body.appendChild(pageCard);

            const result = connectionManager.createConnectionLine(backendCard, pageCard);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: backend → page')
            );
        });
    });

    describe('Invalid Connections - Reverse Direction', () => {
        it('should block server-api to page-api connections', () => {
            const serverApi = document.createElement('div');
            serverApi.className = 'api-item';
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            serverCard.appendChild(serverApi);

            const pageApi = document.createElement('div');
            pageApi.className = 'api-item';
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';
            pageCard.appendChild(pageApi);

            document.body.appendChild(serverCard);
            document.body.appendChild(pageCard);

            const result = connectionManager.createConnectionLine(serverApi, pageApi);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: server-api → page-api')
            );
        });

        it('should block server to page connections', () => {
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';

            document.body.appendChild(serverCard);
            document.body.appendChild(pageCard);

            const result = connectionManager.createConnectionLine(serverCard, pageCard);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: server → page')
            );
        });
    });

    describe('API Item Validation', () => {
        it('should block same-type API connections (page-api to page-api)', () => {
            const pageApi1 = document.createElement('div');
            pageApi1.className = 'api-item';
            const pageCard1 = document.createElement('div');
            pageCard1.className = 'page-card';
            pageCard1.appendChild(pageApi1);

            const pageApi2 = document.createElement('div');
            pageApi2.className = 'api-item';
            const pageCard2 = document.createElement('div');
            pageCard2.className = 'page-card';
            pageCard2.appendChild(pageApi2);

            document.body.appendChild(pageCard1);
            document.body.appendChild(pageCard2);

            const result = connectionManager.createConnectionLine(pageApi1, pageApi2);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: page-api → page-api')
            );
        });

        it('should block same-type API connections (server-api to server-api)', () => {
            const serverApi1 = document.createElement('div');
            serverApi1.className = 'api-item';
            const serverCard1 = document.createElement('div');
            serverCard1.className = 'server-card';
            serverCard1.appendChild(serverApi1);

            const serverApi2 = document.createElement('div');
            serverApi2.className = 'api-item';
            const serverCard2 = document.createElement('div');
            serverCard2.className = 'server-card';
            serverCard2.appendChild(serverApi2);

            document.body.appendChild(serverCard1);
            document.body.appendChild(serverCard2);

            const result = connectionManager.createConnectionLine(serverApi1, serverApi2);
            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('🚫 Blocked invalid connection: server-api → server-api')
            );
        });
    });
});

// Export validation summary for manual testing
export function getValidationRules() {
    return {
        valid: [
            'page-api → server-api',
            'server → backend',
            'page → server'
        ],
        invalid: [
            'page → page',
            'server → server',
            'backend → backend',
            'backend → server',
            'backend → page',
            'server-api → page-api',
            'server → page',
            'page-api → page-api',
            'server-api → server-api'
        ]
    };
}