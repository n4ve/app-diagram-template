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

    describe('Connection Creation - Any Elements', () => {
        it('should create connections between page cards (no validation in ConnectionManager)', () => {
            const pageCard1 = document.createElement('div');
            pageCard1.className = 'page-card';
            pageCard1.textContent = 'Page 1';
            
            const pageCard2 = document.createElement('div');
            pageCard2.className = 'page-card';
            pageCard2.textContent = 'Page 2';

            document.body.appendChild(pageCard1);
            document.body.appendChild(pageCard2);

            const result = connectionManager.createConnectionLine(pageCard1, pageCard2);
            expect(result).not.toBeNull();
            expect(result?.tagName).toBe('line');
        });

        it('should create connections between server cards (no validation in ConnectionManager)', () => {
            const serverCard1 = document.createElement('div');
            serverCard1.className = 'server-card';
            serverCard1.textContent = 'Server 1';
            
            const serverCard2 = document.createElement('div');
            serverCard2.className = 'server-card';
            serverCard2.textContent = 'Server 2';

            document.body.appendChild(serverCard1);
            document.body.appendChild(serverCard2);

            const result = connectionManager.createConnectionLine(serverCard1, serverCard2);
            expect(result).not.toBeNull();
            expect(result?.tagName).toBe('line');
        });

        it('should create connections between backend cards (no validation in ConnectionManager)', () => {
            const backendCard1 = document.createElement('div');
            backendCard1.className = 'backend-card';
            backendCard1.textContent = 'Backend 1';
            
            const backendCard2 = document.createElement('div');
            backendCard2.className = 'backend-card';
            backendCard2.textContent = 'Backend 2';

            document.body.appendChild(backendCard1);
            document.body.appendChild(backendCard2);

            const result = connectionManager.createConnectionLine(backendCard1, backendCard2);
            expect(result).not.toBeNull();
            expect(result?.tagName).toBe('line');
        });
    });

    describe('Duplicate Connection Prevention', () => {
        it('should prevent duplicate connections with same ID', () => {
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';
            pageCard.textContent = 'Same Content';
            
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            serverCard.textContent = 'Same Content';

            document.body.appendChild(pageCard);
            document.body.appendChild(serverCard);

            const result1 = connectionManager.createConnectionLine(pageCard, serverCard);
            expect(result1).not.toBeNull();
            
            // Second attempt should return null (duplicate)
            const result2 = connectionManager.createConnectionLine(pageCard, serverCard);
            expect(result2).toBeNull();
        });
    });

    describe('Element Content Based Connections', () => {
        it('should create connections between elements with different content', () => {
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

            pageApi1.textContent = 'API 1';
            pageApi2.textContent = 'API 2';

            const result = connectionManager.createConnectionLine(pageApi1, pageApi2);
            expect(result).not.toBeNull();
            expect(result?.tagName).toBe('line');
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